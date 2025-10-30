from google import genai
from google.genai import types
import wave, os
import logging

logger = logging.getLogger(__name__)

GOOGLE_API_KEY = "AIzaSyDRLt4EXyXKT-lmDAjbfE6a2l1SsHmVW9Q"  # Hardcoded API key

# Fallback to environment variable if hardcoded key is not available
if not GOOGLE_API_KEY:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY not found in hardcoded value or environment variable")

client = genai.Client(api_key=GOOGLE_API_KEY)

# --- Helper to save wave files ---
def save_wave(filename, pcm, channels=1, rate=24000, sample_width=2):
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(rate)
        wf.writeframes(pcm)

def generate_gemini_tts(
    text: str,
    output_file: str = "bangla_out.wav",
    voice_name: str = "Orus",  # Changed from "Kore" to "Orus" for male voice
    language_code: str = "bn-BD"
):
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-preview-tts",
            contents=text,
            config=types.GenerateContentConfig(
                response_modalities=["AUDIO"],
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name
                        )
                    ),
                    language_code=language_code
                ),
            ),
        )
        
        # Debug: Check response structure
        logger.info(f"Response type: {type(response)}")
        logger.info(f"Response: {response}")
        
        if not response or not response.candidates:
            raise RuntimeError("No candidates in response")
        
        candidate = response.candidates[0]
        if not candidate or not candidate.content:
            raise RuntimeError("No content in candidate")
        
        content = candidate.content
        if not content.parts:
            raise RuntimeError("No parts in content")
        
        part = content.parts[0]
        if not part or not part.inline_data:
            raise RuntimeError("No inline_data in part")
        
        audio_data = part.inline_data.data
        save_wave(output_file, audio_data)
        logger.info(f"Bangla Gemini TTS wrote '{output_file}'")
        return output_file
    except Exception as e:
        raise RuntimeError(f"Gemini TTS (Bangla) error: {e}")