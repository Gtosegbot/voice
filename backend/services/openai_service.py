"""
OpenAI service for AI features in the VoiceAI platform
"""

import os
import json
import openai
from flask import current_app

# OpenAI API key from environment
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

# Initialize OpenAI client
openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)

def analyze_conversation(conversation, messages=None):
    """
    Analyze a conversation to determine lead quality, next steps, and insights
    
    Args:
        conversation (str): The full conversation transcript
        messages (list): Optional list of individual messages with metadata
    
    Returns:
        dict: Analysis results including lead score, insights, and next actions
    """
    try:
        if not OPENAI_API_KEY:
            return {
                'success': False,
                'error': 'OpenAI API key not configured'
            }
        
        system_prompt = """
        You are an AI assistant that analyzes sales conversations to extract insights.
        Analyze the conversation provided and extract the following:
        1. Lead score (1-100) based on interest level and fit
        2. Key pain points mentioned by the lead
        3. Objections raised by the lead
        4. Interest level in the product/service
        5. Next steps recommended for the sales agent
        6. Important follow-up topics
        
        Format your response as a JSON object with these keys.
        """
        
        user_prompt = f"Here is the conversation to analyze:\n\n{conversation}"
        
        if messages:
            user_prompt += "\n\nHere are the individual messages with metadata:\n"
            user_prompt += json.dumps(messages, indent=2)
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse response
        analysis = json.loads(response.choices[0].message.content)
        
        return {
            'success': True,
            'analysis': analysis
        }
    except Exception as e:
        current_app.logger.error(f'OpenAI analysis error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }

def generate_call_script(lead_info, campaign_info=None):
    """
    Generate a personalized call script based on lead information
    
    Args:
        lead_info (dict): Information about the lead
        campaign_info (dict): Optional information about the campaign
        
    Returns:
        dict: Generated script and talking points
    """
    try:
        if not OPENAI_API_KEY:
            return {
                'success': False,
                'error': 'OpenAI API key not configured'
            }
        
        system_prompt = """
        You are an AI assistant that generates personalized call scripts for sales agents.
        Create a natural-sounding call script that the agent can use when calling a lead.
        The script should include:
        1. Introduction
        2. Purpose of the call
        3. Key questions to ask
        4. Responses to common objections
        5. Value proposition tailored to the lead's industry/needs
        6. Call-to-action or next steps
        
        Format your response as a JSON object with these sections.
        """
        
        user_prompt = f"Here is the lead information:\n{json.dumps(lead_info, indent=2)}"
        
        if campaign_info:
            user_prompt += f"\n\nHere is the campaign information:\n{json.dumps(campaign_info, indent=2)}"
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse response
        script = json.loads(response.choices[0].message.content)
        
        return {
            'success': True,
            'script': script
        }
    except Exception as e:
        current_app.logger.error(f'OpenAI script generation error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }

def generate_follow_up_email(conversation, lead_info):
    """
    Generate a follow-up email based on a conversation and lead information
    
    Args:
        conversation (str): The conversation transcript
        lead_info (dict): Information about the lead
        
    Returns:
        dict: Generated email content
    """
    try:
        if not OPENAI_API_KEY:
            return {
                'success': False,
                'error': 'OpenAI API key not configured'
            }
        
        system_prompt = """
        You are an AI assistant that generates personalized follow-up emails after sales calls.
        Create a professional email that summarizes the conversation and includes:
        1. Personalized greeting
        2. Brief summary of what was discussed
        3. Answers to any questions raised during the call
        4. Clear next steps
        5. Professional closing
        
        Format your response as a JSON object with 'subject' and 'body' fields.
        """
        
        user_prompt = f"""
        Here is the lead information:
        {json.dumps(lead_info, indent=2)}
        
        Here is the conversation transcript:
        {conversation}
        
        Please generate a follow-up email for this lead.
        """
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse response
        email = json.loads(response.choices[0].message.content)
        
        return {
            'success': True,
            'email': email
        }
    except Exception as e:
        current_app.logger.error(f'OpenAI email generation error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }

def generate_voice_response(user_message, conversation_history=None, lead_info=None):
    """
    Generate a voice response for interactive voice calls
    
    Args:
        user_message (str): The user's latest message
        conversation_history (list): Optional list of previous messages
        lead_info (dict): Optional information about the lead
        
    Returns:
        dict: Generated response for voice synthesis
    """
    try:
        if not OPENAI_API_KEY:
            return {
                'success': False,
                'error': 'OpenAI API key not configured'
            }
        
        system_prompt = """
        You are an AI assistant for a voice call system. Generate concise, conversational responses
        that sound natural when spoken. Your responses should be helpful, friendly, and direct.
        Avoid lengthy explanations or text formatting that wouldn't work in speech.
        
        Keep responses short and to the point for voice delivery.
        """
        
        # Build messages array
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history
        if conversation_history:
            for msg in conversation_history:
                role = "assistant" if msg.get("sender") == "ai" else "user"
                messages.append({"role": role, "content": msg.get("content")})
        
        # Add lead info to system prompt if available
        if lead_info:
            lead_context = f"""
            Additional context about the lead:
            {json.dumps(lead_info, indent=2)}
            
            Use this information to personalize your response, but don't explicitly mention
            having this data unless relevant to the conversation.
            """
            messages.append({"role": "system", "content": lead_context})
        
        # Add user's message
        messages.append({"role": "user", "content": user_message})
        
        # Call OpenAI API
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        
        response_text = response.choices[0].message.content
        
        return {
            'success': True,
            'response': response_text
        }
    except Exception as e:
        current_app.logger.error(f'OpenAI voice response error: {str(e)}')
        return {
            'success': False,
            'error': str(e)
        }
