"""
Twilio service for SMS and WhatsApp integration with VoiceAI platform
"""

import os
from flask import current_app
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

def get_twilio_credentials():
    """Get Twilio credentials from environment or settings"""
    account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    phone_number = os.environ.get('TWILIO_PHONE_NUMBER')
    
    # If not available in environment, try to get from settings database
    if not (account_sid and auth_token and phone_number):
        try:
            from backend.models.db import Setting
            
            if not account_sid:
                setting = Setting.query.filter_by(category='telephony', key='twilio_account_sid').first()
                if setting:
                    account_sid = setting.value
                    
            if not auth_token:
                setting = Setting.query.filter_by(category='telephony', key='twilio_auth_token').first()
                if setting:
                    auth_token = setting.value
                    
            if not phone_number:
                setting = Setting.query.filter_by(category='telephony', key='twilio_phone_number').first()
                if setting:
                    phone_number = setting.value
        except:
            current_app.logger.error("Failed to get Twilio credentials from settings")
    
    return account_sid, auth_token, phone_number

def send_sms(to_number, message):
    """
    Send SMS message via Twilio
    
    Args:
        to_number: Recipient phone number (with country code)
        message: Message text to send
        
    Returns:
        tuple: (success, message_sid or error)
    """
    account_sid, auth_token, from_number = get_twilio_credentials()
    
    if not (account_sid and auth_token and from_number):
        error = "Twilio credentials not configured"
        current_app.logger.error(error)
        return False, error
    
    try:
        # Format phone number if needed (ensure it has + and country code)
        if not to_number.startswith('+'):
            # Assume Brazilian number if no country code
            if to_number.startswith('0'):
                to_number = '+55' + to_number[1:]
            else:
                to_number = '+55' + to_number
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Send SMS
        message = client.messages.create(
            body=message,
            from_=from_number,
            to=to_number
        )
        
        current_app.logger.info(f"SMS sent to {to_number}: {message.sid}")
        return True, message.sid
        
    except TwilioRestException as e:
        error = f"Twilio error: {e.code} - {e.msg}"
        current_app.logger.error(error)
        return False, error
    except Exception as e:
        error = f"Failed to send SMS: {str(e)}"
        current_app.logger.error(error)
        return False, error

def send_whatsapp(to_number, message):
    """
    Send WhatsApp message via Twilio
    
    Args:
        to_number: Recipient phone number (with country code)
        message: Message text to send
        
    Returns:
        tuple: (success, message_sid or error)
    """
    account_sid, auth_token, from_number = get_twilio_credentials()
    
    if not (account_sid and auth_token and from_number):
        error = "Twilio credentials not configured"
        current_app.logger.error(error)
        return False, error
    
    try:
        # Format phone number if needed (ensure it has + and country code)
        if not to_number.startswith('+'):
            # Assume Brazilian number if no country code
            if to_number.startswith('0'):
                to_number = '+55' + to_number[1:]
            else:
                to_number = '+55' + to_number
        
        # Format WhatsApp number
        whatsapp_from = f"whatsapp:{from_number}"
        whatsapp_to = f"whatsapp:{to_number}"
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # Send WhatsApp message
        message = client.messages.create(
            body=message,
            from_=whatsapp_from,
            to=whatsapp_to
        )
        
        current_app.logger.info(f"WhatsApp message sent to {to_number}: {message.sid}")
        return True, message.sid
        
    except TwilioRestException as e:
        error = f"Twilio error: {e.code} - {e.msg}"
        current_app.logger.error(error)
        return False, error
    except Exception as e:
        error = f"Failed to send WhatsApp message: {str(e)}"
        current_app.logger.error(error)
        return False, error

def send_voice_message(to_number, message=None, twiml=None):
    """
    Initiate a voice call with a message or TwiML
    
    Args:
        to_number: Recipient phone number (with country code)
        message: Simple message to say (if TwiML not provided)
        twiml: TwiML for more complex voice interactions
        
    Returns:
        tuple: (success, call_sid or error)
    """
    account_sid, auth_token, from_number = get_twilio_credentials()
    
    if not (account_sid and auth_token and from_number):
        error = "Twilio credentials not configured"
        current_app.logger.error(error)
        return False, error
    
    try:
        # Format phone number if needed (ensure it has + and country code)
        if not to_number.startswith('+'):
            # Assume Brazilian number if no country code
            if to_number.startswith('0'):
                to_number = '+55' + to_number[1:]
            else:
                to_number = '+55' + to_number
        
        # Initialize Twilio client
        client = Client(account_sid, auth_token)
        
        # If no TwiML provided, create simple one with message
        if not twiml and message:
            twiml = f"""
            <Response>
                <Say voice="woman" language="pt-BR">{message}</Say>
            </Response>
            """
        
        # Make call
        call = client.calls.create(
            twiml=twiml,
            to=to_number,
            from_=from_number
        )
        
        current_app.logger.info(f"Voice call initiated to {to_number}: {call.sid}")
        return True, call.sid
        
    except TwilioRestException as e:
        error = f"Twilio error: {e.code} - {e.msg}"
        current_app.logger.error(error)
        return False, error
    except Exception as e:
        error = f"Failed to initiate voice call: {str(e)}"
        current_app.logger.error(error)
        return False, error

def check_twilio_configuration():
    """Check if Twilio is properly configured"""
    account_sid, auth_token, phone_number = get_twilio_credentials()
    
    if not (account_sid and auth_token and phone_number):
        return False, "Missing Twilio credentials"
    
    try:
        # Test client initialization
        client = Client(account_sid, auth_token)
        
        # Get account info
        account = client.api.accounts(account_sid).fetch()
        
        return True, {
            "status": account.status,
            "friendly_name": account.friendly_name,
            "phone_number": phone_number,
        }
    except Exception as e:
        return False, f"Twilio configuration error: {str(e)}"

def send_appointment_reminder(to_number, lead_name, appointment_datetime, agent_name, notes=None):
    """
    Send a formatted appointment reminder SMS
    
    This is a higher-level function specifically for appointment reminders
    """
    # Format message
    message = f"Olá {lead_name}, este é um lembrete para o nosso compromisso agendado para {appointment_datetime}."
    
    if agent_name:
        message += f" Você falará com {agent_name}."
        
    if notes:
        message += f" Notas: {notes}"
        
    message += " Aguardamos seu contato!"
    
    # Send SMS
    return send_sms(to_number, message)