"""
ElevenLabs service for Text-to-Speech integration with VoiceAI platform
"""

import os
import json
import time
import requests
from flask import current_app

def get_elevenlabs_api_key():
    """Get ElevenLabs API key from environment or settings"""
    api_key = os.environ.get('ELEVENLABS_API_KEY')
    if not api_key:
        # Try to get from settings database
        try:
            from backend.models.db import Setting
            setting = Setting.query.filter_by(category='ai', key='elevenlabs_api_key').first()
            if setting:
                api_key = setting.value
        except:
            current_app.logger.error("Failed to get ElevenLabs API key from settings")
    
    return api_key

def get_available_voices():
    """Get available voices from ElevenLabs"""
    api_key = get_elevenlabs_api_key()
    if not api_key:
        return {"error": "ElevenLabs API key not configured"}
    
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            "https://api.elevenlabs.io/v1/voices",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            current_app.logger.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
            return {"error": f"API error: {response.status_code}"}
    except Exception as e:
        current_app.logger.error(f"ElevenLabs API request failed: {str(e)}")
        return {"error": str(e)}

def text_to_speech(text, voice_id=None, model_id="eleven_multilingual_v2", output_format="mp3"):
    """
    Convert text to speech using ElevenLabs API
    
    Args:
        text: The text to convert to speech
        voice_id: The voice ID to use (defaults to Rachel if not provided)
        model_id: The model ID to use
        output_format: The output format (mp3 or wav)
    
    Returns:
        A tuple with (success, data) where data is either the audio bytes or an error message
    """
    api_key = get_elevenlabs_api_key()
    if not api_key:
        return False, "ElevenLabs API key not configured"
    
    # Default voice (Rachel)
    if not voice_id:
        voice_id = "21m00Tcm4TlvDq8ikWAM"
    
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "accept": "audio/mpeg"
    }
    
    data = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True
        }
    }
    
    try:
        response = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            json=data,
            headers=headers
        )
        
        if response.status_code == 200:
            return True, response.content
        else:
            error_msg = f"ElevenLabs API error: {response.status_code} - {response.text}"
            current_app.logger.error(error_msg)
            return False, error_msg
    except Exception as e:
        error_msg = f"ElevenLabs API request failed: {str(e)}"
        current_app.logger.error(error_msg)
        return False, error_msg

def get_user_subscription_info():
    """Get user subscription info from ElevenLabs"""
    api_key = get_elevenlabs_api_key()
    if not api_key:
        return {"error": "ElevenLabs API key not configured"}
    
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(
            "https://api.elevenlabs.io/v1/user/subscription",
            headers=headers
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            current_app.logger.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
            return {"error": f"API error: {response.status_code}"}
    except Exception as e:
        current_app.logger.error(f"ElevenLabs API request failed: {str(e)}")
        return {"error": str(e)}

def generate_voice_sample(voice_id, text="Olá, estou ligando para falar sobre uma oportunidade especial para você."):
    """Generate a voice sample using ElevenLabs API"""
    success, data = text_to_speech(text, voice_id)
    return success, data

def add_voice(name, description, files):
    """Add a new voice to ElevenLabs"""
    api_key = get_elevenlabs_api_key()
    if not api_key:
        return False, "ElevenLabs API key not configured"
    
    headers = {
        "xi-api-key": api_key,
        "accept": "application/json"
    }
    
    # Prepare form data for multipart upload
    form_data = {
        'name': name,
        'description': description
    }
    
    files_data = []
    for i, file in enumerate(files):
        files_data.append(('files', file))
    
    try:
        response = requests.post(
            "https://api.elevenlabs.io/v1/voices/add",
            headers=headers,
            data=form_data,
            files=files_data
        )
        
        if response.status_code == 200:
            return True, response.json()
        else:
            error_msg = f"ElevenLabs API error: {response.status_code} - {response.text}"
            current_app.logger.error(error_msg)
            return False, error_msg
    except Exception as e:
        error_msg = f"ElevenLabs API request failed: {str(e)}"
        current_app.logger.error(error_msg)
        return False, error_msg

def delete_voice(voice_id):
    """Delete a voice from ElevenLabs"""
    api_key = get_elevenlabs_api_key()
    if not api_key:
        return False, "ElevenLabs API key not configured"
    
    headers = {
        "xi-api-key": api_key,
        "accept": "application/json"
    }
    
    try:
        response = requests.delete(
            f"https://api.elevenlabs.io/v1/voices/{voice_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            return True, "Voice deleted successfully"
        else:
            error_msg = f"ElevenLabs API error: {response.status_code} - {response.text}"
            current_app.logger.error(error_msg)
            return False, error_msg
    except Exception as e:
        error_msg = f"ElevenLabs API request failed: {str(e)}"
        current_app.logger.error(error_msg)
        return False, error_msg

def stream_speech_to_asterisk(text, call_id, voice_id=None):
    """
    Stream generated speech directly to an Asterisk call
    
    This combines the ElevenLabs TTS with the Asterisk service
    to play generated speech on an active call
    """
    from backend.services.asterisk_service import play_audio_data_on_call
    
    # Generate speech
    success, data = text_to_speech(text, voice_id)
    if not success:
        return False, data
    
    # Stream to Asterisk call
    return play_audio_data_on_call(call_id, data)

def voice_clone_from_sample(name, description, sample_file):
    """Clone a voice from a sample file using ElevenLabs Voice Lab"""
    api_key = get_elevenlabs_api_key()
    if not api_key:
        return False, "ElevenLabs API key not configured"
    
    # First, check if user has access to Voice Lab (Professional/Enterprise plan)
    subscription_info = get_user_subscription_info()
    if "error" in subscription_info:
        return False, subscription_info["error"]
    
    if not subscription_info.get("can_use_instant_voice_cloning", False):
        return False, "Your ElevenLabs plan does not support voice cloning. Please upgrade to Professional or Enterprise plan."
    
    # Add voice with the sample
    return add_voice(name, description, [sample_file])