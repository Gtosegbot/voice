"""
ElevenLabs API endpoints for the VoiceAI platform
"""

from flask import Blueprint, request, jsonify, current_app, send_file
import io
import json
from backend.models.db import db, Setting
from backend.services.auth_service import get_user_from_token
from backend.services.elevenlabs_service import (
    get_elevenlabs_api_key,
    get_available_voices,
    text_to_speech,
    get_user_subscription_info,
    generate_voice_sample,
    add_voice,
    delete_voice
)

# Create blueprint
elevenlabs_bp = Blueprint('elevenlabs', __name__)

@elevenlabs_bp.route('/api/ai/elevenlabs/voices', methods=['GET'])
def get_voices():
    """Get available ElevenLabs voices"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get voices from ElevenLabs
        voices_data = get_available_voices()
        
        if "error" in voices_data:
            return jsonify({"error": voices_data["error"]}), 400
            
        return jsonify(voices_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting ElevenLabs voices: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/tts', methods=['POST'])
def text_to_speech_api():
    """Convert text to speech using ElevenLabs"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get request data
        data = request.json
        
        # Validate required fields
        if not data.get('text'):
            return jsonify({"error": "Missing required field: text"}), 400
            
        # Get voice ID (optional)
        voice_id = data.get('voice_id')
        
        # Get model ID (optional)
        model_id = data.get('model_id', 'eleven_multilingual_v2')
        
        # Get output format (optional)
        output_format = data.get('output_format', 'mp3')
        
        # Get voice settings (optional)
        voice_settings = data.get('voice_settings', {
            'stability': 0.5,
            'similarity_boost': 0.75
        })
        
        # Convert text to speech
        success, result = text_to_speech(
            data['text'],
            voice_id,
            model_id,
            output_format
        )
        
        if not success:
            return jsonify({"error": result}), 400
            
        # Return audio file
        audio_file = io.BytesIO(result)
        return send_file(
            audio_file,
            mimetype=f'audio/{output_format}',
            as_attachment=True,
            download_name=f'speech.{output_format}'
        )
        
    except Exception as e:
        current_app.logger.error(f"Error in text-to-speech: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/subscription', methods=['GET'])
def get_subscription():
    """Get user subscription info from ElevenLabs"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get subscription info from ElevenLabs
        subscription_data = get_user_subscription_info()
        
        if "error" in subscription_data:
            return jsonify({"error": subscription_data["error"]}), 400
            
        return jsonify(subscription_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting ElevenLabs subscription: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/sample', methods=['POST'])
def voice_sample():
    """Generate a voice sample using ElevenLabs"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get request data
        data = request.json
        
        # Validate required fields
        if not data.get('voice_id'):
            return jsonify({"error": "Missing required field: voice_id"}), 400
            
        # Get text (optional)
        text = data.get('text', "Olá, estou ligando para falar sobre uma oportunidade especial para você.")
        
        # Generate voice sample
        success, result = generate_voice_sample(data['voice_id'], text)
        
        if not success:
            return jsonify({"error": result}), 400
            
        # Return audio file
        audio_file = io.BytesIO(result)
        return send_file(
            audio_file,
            mimetype='audio/mp3',
            as_attachment=True,
            download_name='sample.mp3'
        )
        
    except Exception as e:
        current_app.logger.error(f"Error generating voice sample: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/voice', methods=['POST'])
def add_new_voice():
    """Add a new voice to ElevenLabs"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Ensure that the request is multipart/form-data
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        # Get form data
        name = request.form.get('name')
        description = request.form.get('description', '')
        
        # Validate required fields
        if not name:
            return jsonify({"error": "Missing required field: name"}), 400
            
        # Get audio file
        file = request.files['file']
        
        # Add voice to ElevenLabs
        success, result = add_voice(name, description, [file])
        
        if not success:
            return jsonify({"error": result}), 400
            
        return jsonify(result), 201
        
    except Exception as e:
        current_app.logger.error(f"Error adding voice: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/voice/<voice_id>', methods=['DELETE'])
def delete_voice_api(voice_id):
    """Delete a voice from ElevenLabs"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Delete voice from ElevenLabs
        success, result = delete_voice(voice_id)
        
        if not success:
            return jsonify({"error": result}), 400
            
        return jsonify({"message": result}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error deleting voice: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/key', methods=['POST'])
def set_api_key():
    """Set ElevenLabs API key in database"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get request data
        data = request.json
        
        # Validate required fields
        if not data.get('api_key'):
            return jsonify({"error": "Missing required field: api_key"}), 400
            
        # Save API key as a setting
        setting = Setting.query.filter_by(category='ai', key='elevenlabs_api_key').first()
        
        if setting:
            setting.value = data['api_key']
        else:
            setting = Setting(
                category='ai',
                key='elevenlabs_api_key',
                value=data['api_key']
            )
            db.session.add(setting)
            
        db.session.commit()
        
        return jsonify({"message": "API key saved successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error setting ElevenLabs API key: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/settings', methods=['GET'])
def get_settings():
    """Get ElevenLabs settings"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get settings
        settings = {}
        
        # Get API key (masked)
        api_key = get_elevenlabs_api_key()
        if api_key:
            # Mask the API key for security
            masked_key = "*" * (len(api_key) - 6) + api_key[-6:]
            settings['api_key'] = masked_key
        else:
            settings['api_key'] = None
            
        # Get default voice
        default_voice_setting = Setting.query.filter_by(category='ai', key='elevenlabs_default_voice').first()
        settings['default_voice'] = default_voice_setting.value if default_voice_setting else None
        
        # Get default model
        default_model_setting = Setting.query.filter_by(category='ai', key='elevenlabs_default_model').first()
        settings['default_model'] = default_model_setting.value if default_model_setting else 'eleven_multilingual_v2'
        
        # Get voice settings
        voice_settings_setting = Setting.query.filter_by(category='ai', key='elevenlabs_voice_settings').first()
        if voice_settings_setting:
            settings['voice_settings'] = json.loads(voice_settings_setting.value)
        else:
            settings['voice_settings'] = {
                'stability': 0.5,
                'similarity_boost': 0.75,
                'style': 0.0,
                'use_speaker_boost': True
            }
            
        return jsonify(settings), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting ElevenLabs settings: {str(e)}")
        return jsonify({"error": str(e)}), 500

@elevenlabs_bp.route('/api/ai/elevenlabs/settings', methods=['POST'])
def update_settings():
    """Update ElevenLabs settings"""
    try:
        # Get current user from token
        user = get_user_from_token(request)
        if not user:
            return jsonify({"error": "Unauthorized"}), 401
            
        # Get request data
        data = request.json
        
        # Update default voice if provided
        if 'default_voice' in data:
            setting = Setting.query.filter_by(category='ai', key='elevenlabs_default_voice').first()
            
            if setting:
                setting.value = data['default_voice']
            else:
                setting = Setting(
                    category='ai',
                    key='elevenlabs_default_voice',
                    value=data['default_voice']
                )
                db.session.add(setting)
        
        # Update default model if provided
        if 'default_model' in data:
            setting = Setting.query.filter_by(category='ai', key='elevenlabs_default_model').first()
            
            if setting:
                setting.value = data['default_model']
            else:
                setting = Setting(
                    category='ai',
                    key='elevenlabs_default_model',
                    value=data['default_model']
                )
                db.session.add(setting)
        
        # Update voice settings if provided
        if 'voice_settings' in data:
            setting = Setting.query.filter_by(category='ai', key='elevenlabs_voice_settings').first()
            
            if setting:
                setting.value = json.dumps(data['voice_settings'])
            else:
                setting = Setting(
                    category='ai',
                    key='elevenlabs_voice_settings',
                    value=json.dumps(data['voice_settings'])
                )
                db.session.add(setting)
        
        db.session.commit()
        
        return jsonify({"message": "Settings updated successfully"}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating ElevenLabs settings: {str(e)}")
        return jsonify({"error": str(e)}), 500