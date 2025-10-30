import os
import logging
from gtts import gTTS

logger = logging.getLogger(__name__)

def generate_gtts(
    text: str,
    lang: str = "bn",
    output_file: str = "gtts_output.mp3",
    slow: bool = False,
    tld: str = "com"
):
    """
    Generate TTS using Google Text-to-Speech (gTTS) with Indian West Bengal accent
    """
    try:
        # Create gTTS object with Indian accent settings
        # Using 'com' TLD for more natural Indian English accent
        # 'slow=False' for natural speech speed
        tts = gTTS(text=text, lang=lang, slow=slow, tld=tld)
        
        # Save the audio file
        tts.save(output_file)
        
        logger.info(f"gTTS (Indian West Bengal accent) wrote '{output_file}'")
        return output_file
        
    except Exception as e:
        raise RuntimeError(f"gTTS error: {e}")

def text_to_speech(
    text: str,
    voice: str = "male",
    output_file: str = "gtts_output.mp3"
):
    """
    Wrapper function for compatibility with main.py
    """
    return generate_gtts(text, "bn", output_file)
