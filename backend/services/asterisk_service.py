"""
Asterisk service for integration with VoiceAI platform
"""

import os
import requests
from flask import current_app
import json
import time
import random

# Asterisk ARI configuration
ASTERISK_ARI_URL = os.environ.get('ASTERISK_ARI_URL', 'http://asterisk:8088/ari')
ASTERISK_ARI_USERNAME = os.environ.get('ASTERISK_ARI_USERNAME', 'voiceai')
ASTERISK_ARI_PASSWORD = os.environ.get('ASTERISK_ARI_PASSWORD', 'voiceai-secret')
ASTERISK_CONTEXT = os.environ.get('ASTERISK_CONTEXT', 'voiceai-outbound')

# Trunk configuration - we have 3 trunks available for load balancing
ASTERISK_TRUNKS = ['trunk1', 'trunk2', 'trunk3']

def get_asterisk_url():
    """Get Asterisk ARI URL"""
    return ASTERISK_ARI_URL

def get_asterisk_credentials():
    """Get Asterisk credentials"""
    return (ASTERISK_ARI_USERNAME, ASTERISK_ARI_PASSWORD)

def initiate_call(phone_number, lead_id=None, agent_id=None):
    """Initiate outbound call using Asterisk ARI"""
    if not phone_number:
        return {
            'success': False,
            'error': 'Phone number is required'
        }
    
    try:
        # Select least busy trunk
        trunk = get_least_busy_trunk()
        
        # Generate unique call ID
        call_id = f"voiceai-{int(time.time())}-{random.randint(1000, 9999)}"
        
        # Set variables to pass to dialplan
        variables = {
            'LEAD_ID': str(lead_id) if lead_id else '',
            'AGENT_ID': str(agent_id) if agent_id else '',
            'CALL_ID': call_id,
            'TRUNK': trunk,
            'DESTINATION': phone_number
        }
        
        # Make the API request to Asterisk
        response = requests.post(
            f"{ASTERISK_ARI_URL}/channels",
            auth=get_asterisk_credentials(),
            params={
                'endpoint': f"{trunk}/{phone_number}",
                'context': ASTERISK_CONTEXT,
                'extension': 's',
                'priority': 1,
                'callerId': 'VoiceAI',
                'variables': json.dumps(variables)
            }
        )
        
        if response.status_code != 201:
            current_app.logger.error(f"Failed to initiate call: {response.text}")
            return {
                'success': False,
                'error': f"Failed to initiate call: {response.text}"
            }
        
        channel_id = response.json().get('id')
        
        return {
            'success': True,
            'call_id': call_id,
            'channel_id': channel_id,
            'trunk': trunk
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
        # Get channels from Asterisk ARI
        response = requests.get(
            f"{ASTERISK_ARI_URL}/channels",
            auth=get_asterisk_credentials()
        )
        
        if response.status_code != 200:
            current_app.logger.error(f"Failed to get channels: {response.text}")
            return {
                'success': False,
                'error': f"Failed to get channels: {response.text}"
            }
        
        channels = response.json()
        
        # Find channel with matching call ID variable
        for channel in channels:
            if channel.get('channelVars', {}).get('CALL_ID') == call_id:
                return {
                    'success': True,
                    'status': channel.get('state'),
                    'duration': channel.get('creationtime'),
                    'channel_id': channel.get('id')
                }
        
        # Check if call is in bridges (conferences)
        response = requests.get(
            f"{ASTERISK_ARI_URL}/bridges",
            auth=get_asterisk_credentials()
        )
        
        if response.status_code == 200:
            bridges = response.json()
            
            for bridge in bridges:
                for channel_id in bridge.get('channels', []):
                    # Get channel details
                    channel_response = requests.get(
                        f"{ASTERISK_ARI_URL}/channels/{channel_id}",
                        auth=get_asterisk_credentials()
                    )
                    
                    if channel_response.status_code == 200:
                        channel = channel_response.json()
                        if channel.get('channelVars', {}).get('CALL_ID') == call_id:
                            return {
                                'success': True,
                                'status': 'in-conference',
                                'duration': channel.get('creationtime'),
                                'channel_id': channel.get('id'),
                                'bridge_id': bridge.get('id')
                            }
        
        return {
            'success': False,
            'error': 'Call not found',
            'status': 'ended'
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
        # Get call status to find channel ID
        status = get_call_status(call_id)
        
        if not status.get('success') or status.get('status') == 'ended':
            return {
                'success': False,
                'error': 'Call not found or already ended'
            }
        
        channel_id = status.get('channel_id')
        
        # Hang up the channel
        response = requests.delete(
            f"{ASTERISK_ARI_URL}/channels/{channel_id}",
            auth=get_asterisk_credentials(),
            params={
                'reason': 'normal'
            }
        )
        
        if response.status_code not in [200, 204]:
            current_app.logger.error(f"Failed to end call: {response.text}")
            return {
                'success': False,
                'error': f"Failed to end call: {response.text}"
            }
        
        return {
            'success': True,
            'message': 'Call ended successfully'
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
        # Get channels from Asterisk ARI
        response = requests.get(
            f"{ASTERISK_ARI_URL}/channels",
            auth=get_asterisk_credentials()
        )
        
        if response.status_code != 200:
            # If error, just return a random trunk
            return random.choice(ASTERISK_TRUNKS)
        
        channels = response.json()
        
        # Count channels per trunk
        trunk_usage = {trunk: 0 for trunk in ASTERISK_TRUNKS}
        
        for channel in channels:
            trunk = channel.get('channelVars', {}).get('TRUNK')
            if trunk in trunk_usage:
                trunk_usage[trunk] += 1
        
        # Find trunk with lowest usage
        least_busy_trunk = min(trunk_usage.items(), key=lambda x: x[1])[0]
        
        return least_busy_trunk
    except Exception as e:
        current_app.logger.error(f"Error getting least busy trunk: {str(e)}")
        # If error, just return a random trunk
        return random.choice(ASTERISK_TRUNKS)

def play_sound(call_id, sound_file):
    """Play a sound file on an active call"""
    try:
        # Get call status to find channel ID
        status = get_call_status(call_id)
        
        if not status.get('success') or status.get('status') == 'ended':
            return {
                'success': False,
                'error': 'Call not found or already ended'
            }
        
        channel_id = status.get('channel_id')
        
        # Play sound on the channel
        response = requests.post(
            f"{ASTERISK_ARI_URL}/channels/{channel_id}/play",
            auth=get_asterisk_credentials(),
            params={
                'media': f"sound:{sound_file}"
            }
        )
        
        if response.status_code != 201:
            current_app.logger.error(f"Failed to play sound: {response.text}")
            return {
                'success': False,
                'error': f"Failed to play sound: {response.text}"
            }
        
        playback_id = response.json().get('id')
        
        return {
            'success': True,
            'playback_id': playback_id
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
        # Get call status to find channel ID
        status = get_call_status(call_id)
        
        if not status.get('success') or status.get('status') == 'ended':
            return {
                'success': False,
                'error': 'Call not found or already ended'
            }
        
        channel_id = status.get('channel_id')
        
        # Generate recording name if not provided
        if not file_name:
            file_name = f"voiceai-{call_id}-{int(time.time())}"
        
        # Start recording
        response = requests.post(
            f"{ASTERISK_ARI_URL}/channels/{channel_id}/record",
            auth=get_asterisk_credentials(),
            params={
                'name': file_name,
                'format': 'wav',
                'maxDurationSeconds': 3600,  # 1 hour max
                'beep': True
            }
        )
        
        if response.status_code != 200:
            current_app.logger.error(f"Failed to start recording: {response.text}")
            return {
                'success': False,
                'error': f"Failed to start recording: {response.text}"
            }
        
        return {
            'success': True,
            'recording_name': file_name
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
        # Get call status to find channel ID
        status = get_call_status(call_id)
        
        if not status.get('success') or status.get('status') == 'ended':
            return {
                'success': False,
                'error': 'Call not found or already ended'
            }
        
        channel_id = status.get('channel_id')
        
        # Stop recording
        response = requests.delete(
            f"{ASTERISK_ARI_URL}/recordings/live/{recording_name}",
            auth=get_asterisk_credentials()
        )
        
        if response.status_code not in [200, 204]:
            current_app.logger.error(f"Failed to stop recording: {response.text}")
            return {
                'success': False,
                'error': f"Failed to stop recording: {response.text}"
            }
        
        return {
            'success': True,
            'message': 'Recording stopped successfully'
        }
    except Exception as e:
        current_app.logger.error(f"Error stopping recording: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }
