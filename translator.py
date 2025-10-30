#!/usr/bin/env python3
"""
Simple Bengali translator for bus announcements
Uses Google Translate API (free tier) to translate English to Bengali
"""

import sys
import urllib.parse
import urllib.request
import json
import re

def translate_to_bengali(text):
    """
    Translate English text to Bengali using Google Translate API
    """
    try:
        # Clean the text
        text = text.strip()
        if not text:
            return text
            
        # URL encode the text
        encoded_text = urllib.parse.quote(text)
        
        # Google Translate API URL (free tier)
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q={encoded_text}"
        
        # Make request
        with urllib.request.urlopen(url, timeout=10) as response:
            data = response.read().decode('utf-8')
            
        # Parse JSON response
        result = json.loads(data)
        
        if result and len(result) > 0 and len(result[0]) > 0:
            # Extract translated text
            translated_parts = []
            for item in result[0]:
                if item and len(item) > 0 and item[0]:
                    translated_parts.append(item[0])
            
            translated = ''.join(translated_parts)
            return translated.strip()
            
    except Exception as e:
        print(f"Translation error: {e}", file=sys.stderr)
        return text  # Return original text if translation fails
    
    return text

def translate_bus_data(text):
    """
    Translate bus-related data with special handling for common terms
    """
    # Common bus-related terms mapping
    bus_terms = {
        'bus': 'বাস',
        'number': 'নম্বর',
        'boys': 'ছেলেদের',
        'girls': 'মেয়েদের',
        'for': 'জন্য',
        'stand': 'স্ট্যান্ড',
        'stands': 'স্ট্যান্ড',
        'morning': 'সকাল',
        'day': 'দিন',
        'college': 'কলেজ',
        'shift': 'শিফট',
        'assignment': 'বরাদ্দ',
        'assignments': 'বরাদ্দ',
        'thank you': 'ধন্যবাদ',
        'no buses': 'কোন বাস নেই',
        'assigned': 'বরাদ্দ করা হয়েছে',
        'has no stands': 'এর জন্য কোন স্ট্যান্ড নেই'
    }
    
    # First try direct term replacement
    translated_text = text.lower()
    for english_term, bengali_term in bus_terms.items():
        translated_text = translated_text.replace(english_term, bengali_term)
    
    # If the text still contains English, use Google Translate
    if re.search(r'[a-zA-Z]', translated_text):
        try:
            # Translate remaining English parts
            google_translated = translate_to_bengali(text)
            if google_translated and google_translated != text:
                return google_translated
        except:
            pass
    
    return translated_text

if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_text = " ".join(sys.argv[1:])
        translated = translate_bus_data(input_text)
        print(translated)
    else:
        print("Usage: python translator.py <text to translate>")
        sys.exit(1)
