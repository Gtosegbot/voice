"""
Asterisk service for integration with VoiceAI platform
"""

import os
import requests
import json
from flask import current_app

def get_asterisk_url():
    """Get Asterisk ARI URL"""
    return os.environ.get('ASTERISK_URL', 'http://localhost:8088/ari')

def get_asterisk_credentials():
    """Get Asterisk credentials"""
    return {
        'username': os.environ.get('ASTERISK_USERNAME', 'asterisk'),
        'password': os.environ.get('ASTERISK_PASSWORD', 'asterisk')
    }

def initiate_call(phone_number, lead_id=None, agent_id=None):
    """Initiate outbound call using Asterisk ARI"""
    try:
        url = f"{get_asterisk_url()}/channels"
        auth = get_asterisk_credentials()
        
        # Determine which trunk to use based on availability
        # Here we're using a simple round-robin, but in production
        # this would check actual trunk availability
        trunk_id = get_least_busy_trunk()
        
        # Format the endpoint based on the trunk
        endpoint = f"PJSIP/{phone_number}@inphonex-endpoint-{trunk_id}"
        
        # Prepare call variables
        variables = {
            'LEAD_ID': str(lead_id) if lead_id else '',
            'AGENT_ID': str(agent_id) if agent_id else '',
            'TRUNK_ID': str(trunk_id),
            'CALL_TYPE': 'outbound'
        }
        
        # Make the API request
        response = requests.post(
            url,
            auth=(auth['username'], auth['password']),
            params={
                'endpoint': endpoint,
                'extension': phone_number,
                'context': 'from-internal',
                'priority': 1,
                'callerId': os.environ.get('OUTBOUND_CALLER_ID', ''),
                'variables': json.dumps(variables)
            }
        )
        
        if response.status_code == 200:
            call_data = response.json()
            return {
                'success': True,
                'call_id': call_data['id'],
                'trunk_id': trunk_id
            }
        else:
            current_app.logger.error(f"Asterisk call initiation failed: {response.status_code}, {response.text}")
            return {
                'success': False,
                'error': f"Failed to initiate call: {response.text}"
            }
    except Exception as e:
        current_app.logger.error(f"Error initiating call: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_call_status(call_id):
    """Get status of an active call"""
    try:
        url = f"{get_asterisk_url()}/channels/{call_id}"
        auth = get_asterisk_credentials()
        
        response = requests.get(
            url,
            auth=(auth['username'], auth['password'])
        )
        
        if response.status_code == 200:
            call_data = response.json()
            return {
                'success': True,
                'status': call_data['state'],
                'duration': call_data.get('dialplan', {}).get('seconds', 0)
            }
        else:
            return {
                'success': False,
                'error': f"Failed to get call status: {response.text}"
            }
    except Exception as e:
        current_app.logger.error(f"Error getting call status: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def end_call(call_id):
    """End an active call"""
    try:
        url = f"{get_asterisk_url()}/channels/{call_id}"
        auth = get_asterisk_credentials()
        
        response = requests.delete(
            url,
            auth=(auth['username'], auth['password'])
        )
        
        if response.status_code in [200, 204]:
            return {
                'success': True
            }
        else:
            return {
                'success': False,
                'error': f"Failed to end call: {response.text}"
            }
    except Exception as e:
        current_app.logger.error(f"Error ending call: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def get_least_busy_trunk():
    """Get the least busy trunk from the three available trunks"""
    try:
        # In a real implementation, this would check actual trunk usage
        # For now, we'll simulate a simple round-robin approach
        from random import randint
        return randint(1, 3)
    except Exception as e:
        current_app.logger.error(f"Error determining least busy trunk: {str(e)}")
        # Default to trunk 1 if there's an error
        return 1

def play_sound(call_id, sound_file):
    """Play a sound file on an active call"""
    try:
        url = f"{get_asterisk_url()}/channels/{call_id}/play"
        auth = get_asterisk_credentials()
        
        response = requests.post(
            url,
            auth=(auth['username'], auth['password']),
            params={
                'media': f"sound:{sound_file}"
            }
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'playback_id': response.json().get('id')
            }
        else:
            return {
                'success': False,
                'error': f"Failed to play sound: {response.text}"
            }
    except Exception as e:
        current_app.logger.error(f"Error playing sound: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def record_call(call_id, file_name=None):
    """Start recording an active call"""
    try:
        url = f"{get_asterisk_url()}/channels/{call_id}/record"
        auth = get_asterisk_credentials()
        
        if not file_name:
            file_name = f"call_{call_id}_{int(time.time())}"
        
        response = requests.post(
            url,
            auth=(auth['username'], auth['password']),
            params={
                'name': file_name,
                'format': 'wav',
                'maxDurationSeconds': 3600,  # 1 hour max
                'beep': True
            }
        )
        
        if response.status_code == 200:
            return {
                'success': True,
                'recording_name': file_name
            }
        else:
            return {
                'success': False,
                'error': f"Failed to start recording: {response.text}"
            }
    except Exception as e:
        current_app.logger.error(f"Error starting recording: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def stop_recording(call_id, recording_name):
    """Stop recording an active call"""
    try:
        url = f"{get_asterisk_url()}/recordings/live/{recording_name}"
        auth = get_asterisk_credentials()
        
        response = requests.delete(
            url,
            auth=(auth['username'], auth['password'])
        )
        
        if response.status_code in [200, 204]:
            return {
                'success': True
            }
        else:
            return {
                'success': False,
                'error': f"Failed to stop recording: {response.text}"
            }
    except Exception as e:
        current_app.logger.error(f"Error stopping recording: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
