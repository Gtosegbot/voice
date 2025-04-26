from flask import Blueprint, request, jsonify, Response, stream_with_context
from typing import Dict, Any
from ..services.conductor_service import ConductorService
import json

llm_bp = Blueprint('llm', __name__)
conductor_service = ConductorService()


@llm_bp.route('/completion', methods=['POST'])
async def generate_completion():
    """
    Endpoint para gerar conclusões usando o modelo mais adequado.
    """
    try:
        data = request.get_json()

        # Validação dos parâmetros obrigatórios
        if not data or 'prompt' not in data or 'use_case' not in data:
            return jsonify({
                'error': 'Parâmetros obrigatórios ausentes: prompt e use_case'
            }), 400

        # Gera a conclusão
        result = await conductor_service.generate_completion(
            prompt=data['prompt'],
            use_case=data['use_case'],
            content_type=data.get('content_type'),
            temperature=float(data.get('temperature', 0.7)),
            max_tokens=data.get('max_tokens'),
            **data.get('kwargs', {})
        )

        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


@llm_bp.route('/stream', methods=['POST'])
async def stream_completion():
    """
    Endpoint para gerar conclusões em streaming.
    """
    try:
        data = request.get_json()

        # Validação dos parâmetros obrigatórios
        if not data or 'prompt' not in data or 'use_case' not in data:
            return jsonify({
                'error': 'Parâmetros obrigatórios ausentes: prompt e use_case'
            }), 400

        def generate():
            async for chunk in conductor_service.stream_completion(
                prompt=data['prompt'],
                use_case=data['use_case'],
                content_type=data.get('content_type'),
                temperature=float(data.get('temperature', 0.7)),
                max_tokens=data.get('max_tokens'),
                **data.get('kwargs', {})
            ):
                yield f"data: {json.dumps(chunk)}\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream'
        )

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500


@llm_bp.route('/models', methods=['GET'])
def get_models():
    """
    Endpoint para obter informações sobre os modelos disponíveis.
    """
    try:
        models_info = conductor_service.get_available_models()
        return jsonify(models_info)

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500
