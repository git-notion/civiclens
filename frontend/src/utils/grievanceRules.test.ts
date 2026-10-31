import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSlaRemaining,
  formatTicketId,
  calculateUrgencyScore,
  filterGrievances,
  computeTelemetry,
  generateDailyReport,
  quickLookupGrievances,
} from './grievanceRules';
import { Grievance } from '../types';

test('formatTicketId formats sequence number correctly', () => {
  assert.equal(formatTicketId(8812, 2026), '#CIV-2026-8812');
  assert.equal(formatTicketId(5, 2026), '#CIV-2026-0005');
});

test('calculateSlaRemaining computes correct remaining hours and breach status', () => {
  const baseTime = new Date('2026-10-30T12:00:00Z');

  // Created 10 hours ago with 48h deadline => 38 hours remaining
  const created10hAgo = new Date('2026-10-30T02:00:00Z').toISOString();
  const sla1 = calculateSlaRemaining(created10hAgo, 48, baseTime);
  assert.equal(sla1.isBreached, false);
  assert.equal(sla1.hoursRemaining, 38);
  assert.equal(sla1.formatted, '38h 0m left');

  // Created 50 hours ago with 48h deadline => breached by 2 hours
  const created50hAgo = new Date('2026-10-28T10:00:00Z').toISOString();
  const sla2 = calculateSlaRemaining(created50hAgo, 48, baseTime);
  assert.equal(sla2.isBreached, true);
  assert.ok(sla2.hoursRemaining <= 0);
  assert.ok(sla2.formatted.includes('Breached'));
});

test('calculateUrgencyScore weights emergency higher than low', () => {
  const scoreEmergency = calculateUrgencyScore('Emergency', 80, 5);
  const scoreLow = calculateUrgencyScore('Low', 20, 40);
  assert.ok(scoreEmergency > scoreLow);
});

test('filterGrievances filters by status and text search', () => {
  const sample: Grievance[] = [
    {
      id: '#CIV-2026-1001',
      title: 'Water Pipe Burst on 5th Avenue',
      description: 'Major leak flooding pedestrian crosswalk',
      category: 'Water Supply',
      department: 'Water Supply & Drainage',
      precinct: 'Ward 4 - Metro Center',
      locationAddress: '5th Ave & Pine St',
      status: 'Escalated',
      priority: 'Emergency',
      citizen: { name: 'Elena Rostova', phone: '555-0199', email: 'elena@example.com' },
      createdAt: '2026-10-29T10:00:00Z',
      slaDeadlineHours: 24,
      evidence: [],
      timeline: [],
      impactScore: 85,
      upvotes: 14,
    },
    {
      id: '#CIV-2026-1002',
      title: 'Broken Streetlamp outside school',
      description: 'Light flickering and dark at night',
      category: 'Lighting',
      department: 'Electrical & Street Lighting',
      precinct: 'Ward 7 - North District',
      locationAddress: '88 Oak Lane',
      status: 'Under Review',
      priority: 'Standard',
      citizen: { name: 'Marcus Bell', phone: '555-0122', email: 'marcus@example.com' },
      createdAt: '2026-10-30T08:00:00Z',
      slaDeadlineHours: 72,
      evidence: [],
      timeline: [],
      impactScore: 40,
      upvotes: 5,
    },
  ];

  const searchPipe = filterGrievances(sample, { search: 'burst' });
  assert.equal(searchPipe.length, 1);
  assert.equal(searchPipe[0].id, '#CIV-2026-1001');

  const filterStatus = filterGrievances(sample, { status: 'Under Review' });
  assert.equal(filterStatus.length, 1);
  assert.equal(filterStatus[0].id, '#CIV-2026-1002');
});

test('computeTelemetry calculates summary aggregates', () => {
  const sample: Grievance[] = [
    {
      id: '#CIV-2026-1',
      title: 'Issue 1',
      description: 'Desc',
      category: 'Roads',
      department: 'Public Works & Roads',
      precinct: 'Ward 1',
      locationAddress: 'Loc 1',
      status: 'Resolved',
      priority: 'Standard',
      citizen: { name: 'User 1', phone: '', email: '' },
      createdAt: '2026-10-28T00:00:00Z',
      resolvedAt: '2026-10-29T12:00:00Z', // 36 hours
      slaDeadlineHours: 48,
      evidence: [],
      timeline: [],
      impactScore: 50,
      upvotes: 0,
    },
  ];

  const stats = computeTelemetry(sample);
  assert.equal(stats.total, 1);
  assert.equal(stats.resolved, 1);
  assert.equal(stats.slaComplianceRate, 100);
  assert.equal(stats.avgResolutionHours, 36);
});

test('generateDailyReport produces structured executive report', () => {
  const sample: Grievance[] = [
    {
      id: '#CIV-2026-9001',
      title: 'Emergency Power Grid Outage',
      description: 'Downtown substations failure',
      category: 'Power Grid',
      department: 'Electrical & Street Lighting',
      precinct: 'Ward 4 - Metro Center',
      locationAddress: 'Center St',
      status: 'Escalated',
      priority: 'Emergency',
      citizen: { name: 'Admin', phone: '555', email: 'admin@gov.org' },
      createdAt: '2026-10-30T00:00:00Z',
      slaDeadlineHours: 12,
      evidence: [],
      timeline: [],
      impactScore: 99,
      upvotes: 10,
    },
  ];

  const report = generateDailyReport(sample, new Date('2026-10-30T12:00:00Z'));
  assert.ok(report.reportId.startsWith('MDR-20261030'));
  assert.equal(report.totalGrievances, 1);
  assert.equal(report.urgentActionItems.length, 1);
  assert.equal(report.urgentActionItems[0].id, '#CIV-2026-9001');
  assert.ok(
    report.departmentBreakdown.some((d) => d.department === 'Electrical & Street Lighting')
  );
});

test('quickLookupGrievances finds tickets by docket number or citizen name with match prioritization', () => {
  const sample: Grievance[] = [
    {
      id: '#CIV-2026-8812',
      title: 'Severe Asphalt Subsidence and Deep Pothole',
      description: 'Pothole description',
      category: 'Potholes',
      department: 'Public Works & Roads',
      precinct: 'Ward 4',
      locationAddress: '248 Lexington Ave',
      status: 'Escalated',
      priority: 'Urgent',
      citizen: { name: 'Julian Vance', phone: '555', email: 'j@example.com' },
      createdAt: '2026-10-30T00:00:00Z',
      slaDeadlineHours: 24,
      evidence: [],
      timeline: [],
      impactScore: 80,
      upvotes: 5,
    },
    {
      id: '#CIV-2026-8813',
      title: 'Water Pipe Burst',
      description: 'Water leak',
      category: 'Water',
      department: 'Water Supply & Drainage',
      precinct: 'Ward 7',
      locationAddress: 'Elm Street',
      status: 'In Progress',
      priority: 'Emergency',
      citizen: { name: 'Nadia Thorne', phone: '555', email: 'n@example.com' },
      createdAt: '2026-10-30T00:00:00Z',
      slaDeadlineHours: 12,
      evidence: [],
      timeline: [],
      impactScore: 90,
      upvotes: 12,
    },
  ];

  // Lookup by docket number
  const byDocket = quickLookupGrievances(sample, '8812');
  assert.equal(byDocket.length, 1);
  assert.equal(byDocket[0].item.id, '#CIV-2026-8812');
  assert.equal(byDocket[0].matchType, 'docket');

  // Lookup by citizen name
  const byCitizen = quickLookupGrievances(sample, 'Nadia');
  assert.equal(byCitizen.length, 1);
  assert.equal(byCitizen[0].item.id, '#CIV-2026-8813');
  assert.equal(byCitizen[0].matchType, 'citizen');

  // Lookup non-existent
  const notFound = quickLookupGrievances(sample, 'xyz999');
  assert.equal(notFound.length, 0);
});
