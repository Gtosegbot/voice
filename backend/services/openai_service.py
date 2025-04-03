"""
OpenAI service for AI features in the VoiceAI platform
"""

import os
from openai import OpenAI
from flask import current_app

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

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
        # Create a proper system prompt
        system_prompt = """
        You are an AI assistant specialized in analyzing sales conversations. 
        Analyze the conversation transcript to determine:
        
        1. Lead score (0-100): How qualified is this lead?
        2. Key pain points identified
        3. Buying signals and level of interest
        4. Objections raised
        5. Next best actions for the sales team
        6. Overall sentiment
        
        Provide your response in JSON format with the following structure:
        {
            "lead_score": <score>,
            "pain_points": ["point1", "point2", ...],
            "buying_signals": ["signal1", "signal2", ...],
            "interest_level": "high|medium|low",
            "objections": ["objection1", "objection2", ...],
            "next_actions": ["action1", "action2", ...],
            "sentiment": "positive|neutral|negative",
            "summary": "brief summary of the conversation"
        }
        """
        
        # Prepare conversation input
        if messages:
            # Format structured messages
            conversation_text = "\n".join([f"{msg['sender']}: {msg['content']}" for msg in messages])
        else:
            # Use raw transcript
            conversation_text = conversation
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": conversation_text}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse and return the analysis
        return {
            "success": True,
            "analysis": response.choices[0].message.content
        }
    except Exception as e:
        current_app.logger.error(f"Error analyzing conversation: {str(e)}")
        return {
            "success": False,
            "error": str(e)
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
        # Create system prompt
        system_prompt = """
        You are an AI assistant specialized in creating effective sales call scripts.
        Generate a personalized script for a sales call based on the lead information provided.
        
        The script should include:
        1. An engaging introduction
        2. Key value propositions tailored to the lead's industry and role
        3. Discovery questions to identify pain points
        4. Responses to potential objections
        5. A clear call to action
        
        Provide your response in JSON format with the following structure:
        {
            "introduction": "script for introduction",
            "value_propositions": ["proposition1", "proposition2", ...],
            "discovery_questions": ["question1", "question2", ...],
            "objection_responses": {"objection1": "response1", "objection2": "response2", ...},
            "call_to_action": "script for call to action",
            "full_script": "complete call script"
        }
        """
        
        # Prepare lead information
        lead_context = {
            "name": lead_info.get("name", ""),
            "company": lead_info.get("company", ""),
            "industry": lead_info.get("industry", ""),
            "role": lead_info.get("job_title", ""),
            "source": lead_info.get("source", ""),
            "campaign": campaign_info.get("name") if campaign_info else ""
        }
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": str(lead_context)}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse and return the script
        return {
            "success": True,
            "script": response.choices[0].message.content
        }
    except Exception as e:
        current_app.logger.error(f"Error generating call script: {str(e)}")
        return {
            "success": False,
            "error": str(e)
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
        # Create system prompt
        system_prompt = """
        You are an AI assistant specialized in creating effective follow-up emails.
        Generate a personalized follow-up email based on the conversation transcript and lead information.
        
        The email should include:
        1. A personalized greeting
        2. Reference to specific topics discussed
        3. Clear next steps
        4. A call to action
        5. Professional signature
        
        Provide your response in JSON format with the following structure:
        {
            "subject": "email subject line",
            "greeting": "personalized greeting",
            "body": "main email body",
            "call_to_action": "specific call to action",
            "closing": "email closing",
            "full_email": "complete email text"
        }
        """
        
        # Prepare context information
        context = {
            "conversation": conversation,
            "lead": {
                "name": lead_info.get("name", ""),
                "company": lead_info.get("company", ""),
                "email": lead_info.get("email", "")
            }
        }
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": str(context)}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse and return the email
        return {
            "success": True,
            "email": response.choices[0].message.content
        }
    except Exception as e:
        current_app.logger.error(f"Error generating follow-up email: {str(e)}")
        return {
            "success": False,
            "error": str(e)
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
        # Create system prompt
        system_prompt = """
        You are an AI assistant for a sales team, having a phone conversation with a potential lead.
        Generate a natural-sounding, conversational response that addresses the person's message.
        
        Keep your responses concise, friendly, and focused on helping the person.
        Don't introduce multiple topics in one response.
        Avoid using bullet points, lists, or special characters that wouldn't work in a spoken conversation.
        Speak in a natural, conversational tone.
        
        Your responses should be 1-3 sentences at most, optimized for voice conversation.
        """
        
        # Prepare messages
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        # Add conversation history if available
        if conversation_history:
            for msg in conversation_history:
                role = "assistant" if msg.get("is_ai", False) else "user"
                messages.append({"role": role, "content": msg.get("content", "")})
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=messages,
            max_tokens=150  # Keep responses concise
        )
        
        # Return the text response
        return {
            "success": True,
            "response": response.choices[0].message.content
        }
    except Exception as e:
        current_app.logger.error(f"Error generating voice response: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
