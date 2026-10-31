import React from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'header' | 'sidebar' | 'pill';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'header',
  showLabel = true,
}) => {
  const { theme, toggleTheme, setTheme } = useGrievance();
  const isDark = theme === 'dark-cerulean';

  if (variant === 'header') {
    return (
      <div
        className="flex items-center bg-[#1d1d1d] p-0.5 rounded-lg border border-[#C9B99F]/30 shadow-inner"
        role="group"
        aria-label="Color scheme selector"
      >
        {/* Heritage Light Button */}
        <button
          type="button"
          onClick={() => setTheme('civic-heritage')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all duration-200 ${
            !isDark ? 'bg-[#FAF7F0] text-[#242424] shadow-xs' : 'text-[#C9B99F]/70 hover:text-white'
          }`}
          title="Switch to Civic Heritage Light theme (CSS variables: Warm Ivory & Deep Plum)"
          aria-pressed={!isDark}
        >
          <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-600' : 'text-[#C9B99F]/60'}`} />
          {showLabel && <span className="hidden sm:inline text-[11px]">Light</span>}
        </button>

        {/* Cerulean Dark Button */}
        <button
          type="button"
          onClick={() => setTheme('dark-cerulean')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all duration-200 ${
            isDark ? 'bg-[#0284c7] text-white shadow-xs' : 'text-[#C9B99F]/70 hover:text-white'
          }`}
          title="Switch to Obsidian & Cerulean Dark theme (CSS variables: Jet Black & Cerulean Blue)"
          aria-pressed={isDark}
        >
          <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-[#C9B99F]/60'}`} />
          {showLabel && <span className="hidden sm:inline text-[11px]">Dark</span>}
        </button>
      </div>
    );
  }

  // Sliding Switch Pill Variant
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:ring-offset-2 ${
        isDark ? 'bg-[#0284c7]' : 'bg-[#48234F]'
      }`}
      title={`Switch to ${isDark ? 'Civic Heritage Light' : 'Obsidian & Cerulean Dark'} scheme`}
      aria-label="Toggle light and dark color scheme"
    >
      <span className="sr-only">Toggle color scheme</span>
      <span
        className={`pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          isDark ? 'translate-x-5 text-[#0284c7]' : 'translate-x-0 text-[#48234F]'
        }`}
      >
        {isDark ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3 text-amber-600" />}
      </span>
    </button>
  );
};
