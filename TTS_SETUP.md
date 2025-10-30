# TTS API Setup Guide

## Required API Keys

### 1. Google Gemini API Key (REQUIRED)
- Go to: https://aistudio.google.com/
- Sign in with Google account
- Create new API key
- Set environment variable: GOOGLE_API_KEY=your_key_here

### 2. ElevenLabs API Key (OPTIONAL)
- Go to: https://elevenlabs.io/
- Sign up for account
- Get API key from dashboard
- Set environment variable: ELEVENLABS_API_KEY=your_key_here

## How to Set Environment Variables

### Windows (Command Prompt):
```
set GOOGLE_API_KEY=your_google_gemini_api_key_here
set ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Windows (PowerShell):
```
$env:GOOGLE_API_KEY="your_google_gemini_api_key_here"
$env:ELEVENLABS_API_KEY="your_elevenlabs_api_key_here"
```

### Create .env file in project root:
```
GOOGLE_API_KEY=your_google_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
TTS_MODE=normal
TTS_VOICE=male
```

## Fallback TTS Engines (No API Keys Required)
- gTTS (Google Text-to-Speech) - Free
- Pollinations TTS - Free
- BanglaTTS - Free

## Testing
Run: python main.py "সকালের শিফটের বাস বরাদ্দ"
If it works, your API keys are set correctly!
