
import sys

from pathlib import Path
from voice_explainer import generate_speech


def main():

    if len(sys.argv) < 2:
        print('Usage: python test_voice.py "Text to speak"')
        return

    text = sys.argv[1]

    print("Generating voice explanation...")

    try:

        audio = generate_speech(
            text=text,
            voice="Kore"
        )

        output_path = Path("policy_explainer.wav")

        output_path.write_bytes(audio)

        print("\nVOICE GENERATION SUCCESSFUL")
        print("Audio file:", output_path.resolve())
        print("Audio size:", len(audio), "bytes")

    except Exception as error:

        print("\nVOICE GENERATION FAILED")
        print(type(error).__name__, str(error))


if __name__ == "__main__":
    main()
