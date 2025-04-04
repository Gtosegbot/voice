"""
Twilio service for the VoiceAI platform
"""

import os
from twilio.rest import Client
from flask import current_app
from twilio.base.exceptions import TwilioRestException

# Twilio credentials from environment variables
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')

def get_twilio_client():
    """Get Twilio client instance"""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        current_app.logger.error('Twilio credentials not found')
        return None
    
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_sms(to_number, message):
    """Send SMS message using Twilio"""
    client = get_twilio_client()
    
    if not client:
        return {
            'success': False,
            'error': 'Twilio client not initialized'
        }
    
    if not TWILIO_PHONE_NUMBER:
        return {
            'success': False,
            'error': 'Twilio phone number not configured'
        }
    
    try:
        # Send message
        message = client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_number
        )
        
        return {
            'success': True,
            'sid': message.sid
        }
    except TwilioRestException as e:
        current_app.logger.error(f'Twilio error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        current_app.logger.error(f'Error sending SMS: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }

def make_call(to_number, url=None, twiml=None):
    """Make a phone call using Twilio"""
    client = get_twilio_client()
    
    if not client:
        return {
            'success': False,
            'error': 'Twilio client not initialized'
        }
    
    if not TWILIO_PHONE_NUMBER:
        return {
            'success': False,
            'error': 'Twilio phone number not configured'
        }
    
    try:
        call_params = {
            'to': to_number,
            'from_': TWILIO_PHONE_NUMBER
        }
        
        # Use either URL or TwiML
        if url:
            call_params['url'] = url
        elif twiml:
            call_params['twiml'] = twiml
        else:
            return {
                'success': False,
                'error': 'Either URL or TwiML required'
            }
        
        # Make call
        call = client.calls.create(**call_params)
        
        return {
            'success': True,
            'sid': call.sid
        }
    except TwilioRestException as e:
        current_app.logger.error(f'Twilio error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        current_app.logger.error(f'Error making call: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }

def get_call_status(call_sid):
    """Get call status from Twilio"""
    client = get_twilio_client()
    
    if not client:
        return {
            'success': False,
            'error': 'Twilio client not initialized'
        }
    
    try:
        call = client.calls(call_sid).fetch()
        
        return {
            'success': True,
            'status': call.status,
            'duration': call.duration,
            'direction': call.direction,
            'from': call.from_,
            'to': call.to,
            'started_at': call.start_time,
            'ended_at': call.end_time
        }
    except TwilioRestException as e:
        current_app.logger.error(f'Twilio error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        current_app.logger.error(f'Error getting call status: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }

def get_recording_url(recording_sid):
    """Get recording URL from Twilio"""
    client = get_twilio_client()
    
    if not client:
        return {
            'success': False,
            'error': 'Twilio client not initialized'
        }
    
    try:
        recording = client.recordings(recording_sid).fetch()
        
        return {
            'success': True,
            'url': recording.uri,
            'duration': recording.duration,
            'channels': recording.channels,
            'status': recording.status
        }
    except TwilioRestException as e:
        current_app.logger.error(f'Twilio error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }
    except Exception as e:
        current_app.logger.error(f'Error getting recording URL: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }
