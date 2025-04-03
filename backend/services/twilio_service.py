"""
Twilio service for the VoiceAI platform
"""

import os
from twilio.rest import Client
from flask import current_app

def get_twilio_client():
    """Get Twilio client instance"""
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    
    if not account_sid or not auth_token:
        current_app.logger.error('Twilio credentials not set')
        return None
    
    return Client(account_sid, auth_token)

def send_sms(to_number, message):
    """Send SMS message using Twilio"""
    client = get_twilio_client()
    
    if not client:
        return {
            'success': False,
            'error': 'Twilio client not initialized'
        }
    
    try:
        from_number = os.environ.get('TWILIO_PHONE_NUMBER')
        if not from_number:
            return {
                'success': False,
                'error': 'Twilio phone number not set'
            }
        
        message = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        
        return {
            'success': True,
            'sid': message.sid
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
    
    try:
        from_number = os.environ.get('TWILIO_PHONE_NUMBER')
        if not from_number:
            return {
                'success': False,
                'error': 'Twilio phone number not set'
            }
        
        # Call with either a URL to TwiML or TwiML directly
        if url:
            call = client.calls.create(
                to=to_number,
                from_=from_number,
                url=url
            )
        elif twiml:
            call = client.calls.create(
                to=to_number,
                from_=from_number,
                twiml=twiml
            )
        else:
            return {
                'success': False,
                'error': 'Either url or twiml parameter must be provided'
            }
        
        return {
            'success': True,
            'sid': call.sid
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
            'url': recording.uri
        }
    except Exception as e:
        current_app.logger.error(f'Error getting recording URL: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }