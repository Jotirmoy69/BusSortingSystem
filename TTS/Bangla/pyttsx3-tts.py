import os
import logging
import pyttsx3
import tempfile

logger = logging.getLogger(__name__)

def generate_pyttsx3_tts(
    text: str,
    voice: str = "male",
    output_file: str = "pyttsx3_output.wav",
    rate: int = 150,  # Speech rate (words per minute)
    volume: float = 0.9  # Volume level (0.0 to 1.0)
):
    """
    Generate TTS using pyttsx3 with Windows system voices for natural Indian pronunciation
    """
    try:
        # Initialize the TTS engine
        engine = pyttsx3.init()
        
        # Get available voices
        voices = engine.getProperty('voices')
        
        # Try to find an Indian or Bengali voice
        indian_voice = None
        for voice_obj in voices:
            voice_name = voice_obj.name.lower()
            # Look for Indian/Bengali voices
            if any(keyword in voice_name for keyword in ['bengali', 'bengal', 'indian', 'india', 'hindi']):
                indian_voice = voice_obj
                logger.info(f"Found Indian voice: {voice_obj.name}")
                break
        
        # If no Indian voice found, use the first available voice
        if not indian_voice and voices:
            indian_voice = voices[0]
            logger.info(f"Using default voice: {indian_voice.name}")
        
        # Set voice properties
        if indian_voice:
            engine.setProperty('voice', indian_voice.id)
        
        # Set speech rate (slower for clearer pronunciation)
        engine.setProperty('rate', rate)
        
        # Set volume
        engine.setProperty('volume', volume)
        
        # Save to file
        engine.save_to_file(text, output_file)
        engine.runAndWait()
        
        logger.info(f"pyttsx3 (Indian voice) wrote '{output_file}'")
        return output_file
        
    except Exception as e:
        logger.warning(f"pyttsx3 failed: {e}")
        raise RuntimeError(f"pyttsx3 TTS error: {e}")

def text_to_speech(
    text: str,
    voice: str = "male",
    output_file: str = "pyttsx3_output.wav",
    rate: int = 150,
    volume: float = 0.9
):
    """
    Wrapper function for compatibility with main.py
    """
    return generate_pyttsx3_tts(text, voice, output_file, rate, volume)
