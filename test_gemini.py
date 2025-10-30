from TTS.Bangla.gemini-tts import generate_gemini_tts

# Test Bengali text
text = "কি অবস্থা বন্ধু ? তোমার নাম কি"
result = generate_gemini_tts(text, "test_gemini_bengali.wav")
print("Gemini TTS test result:", result)
