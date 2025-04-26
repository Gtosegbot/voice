from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Criar cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Função para criar tabelas


async def create_tables():
    """Cria todas as tabelas necessárias no Supabase"""
    try:
        # Tabela de usuários
        await supabase.table("users").create({
            "id": "uuid primary key",
            "name": "text not null",
            "email": "text unique not null",
            "password": "text not null",
            "role": "text default 'agent'",
            "phone": "text",
            "job_title": "text",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()"
        })

        # Tabela de leads
        await supabase.table("leads").create({
            "id": "uuid primary key",
            "name": "text not null",
            "company": "text",
            "phone": "text",
            "email": "text",
            "status": "text default 'new'",
            "score": "integer default 0",
            "source": "text",
            "agent_id": "uuid references users(id)",
            "campaign_id": "uuid references campaigns(id)",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()",
            "last_activity": "timestamp with time zone default now()"
        })

        # Tabela de campanhas
        await supabase.table("campaigns").create({
            "id": "uuid primary key",
            "name": "text not null",
            "description": "text",
            "status": "text default 'draft'",
            "target_leads": "integer default 0",
            "start_date": "date",
            "end_date": "date",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()"
        })

        # Tabela de conversas
        await supabase.table("conversations").create({
            "id": "uuid primary key",
            "lead_id": "uuid references leads(id) not null",
            "channel": "text not null",
            "status": "text default 'active'",
            "lead_score": "integer",
            "lead_status": "text",
            "lead_source": "text",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()",
            "last_activity_at": "timestamp with time zone default now()"
        })

        # Tabela de mensagens
        await supabase.table("messages").create({
            "id": "uuid primary key",
            "conversation_id": "uuid references conversations(id) not null",
            "sender_type": "text not null",
            "sender_id": "uuid",
            "content": "text not null",
            "message_type": "text default 'text'",
            "created_at": "timestamp with time zone default now()"
        })

        # Tabela de chamadas
        await supabase.table("calls").create({
            "id": "uuid primary key",
            "conversation_id": "uuid references conversations(id)",
            "lead_id": "uuid references leads(id)",
            "agent_id": "uuid references users(id)",
            "direction": "text not null",
            "status": "text default 'ringing'",
            "start_time": "timestamp with time zone",
            "end_time": "timestamp with time zone",
            "duration": "integer",
            "recording_url": "text",
            "transcript": "text",
            "call_notes": "text",
            "created_at": "timestamp with time zone default now()"
        })

        # Tabela de notas
        await supabase.table("notes").create({
            "id": "uuid primary key",
            "lead_id": "uuid references leads(id) not null",
            "user_id": "uuid references users(id) not null",
            "content": "text not null",
            "note_type": "text default 'general'",
            "created_at": "timestamp with time zone default now()"
        })

        # Tabela de fluxos
        await supabase.table("flows").create({
            "id": "uuid primary key",
            "name": "text not null",
            "trigger_type": "text not null",
            "status": "text default 'draft'",
            "campaign_id": "uuid references campaigns(id)",
            "nodes": "jsonb",
            "connections": "jsonb",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()"
        })

        # Tabela de configurações
        await supabase.table("settings").create({
            "id": "uuid primary key",
            "user_id": "uuid references users(id)",
            "category": "text not null",
            "key": "text not null",
            "value": "text not null",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()"
        })

        # Tabela de callbacks
        await supabase.table("callbacks").create({
            "id": "uuid primary key",
            "lead_id": "uuid references leads(id) not null",
            "agent_id": "uuid references users(id) not null",
            "scheduled_at": "timestamp with time zone not null",
            "notes": "text",
            "status": "text default 'scheduled'",
            "call_id": "uuid references calls(id)",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()"
        })

        # Tabela de lembretes
        await supabase.table("reminders").create({
            "id": "uuid primary key",
            "callback_id": "uuid references callbacks(id) not null",
            "reminder_time": "timestamp with time zone not null",
            "channel": "text not null",
            "status": "text default 'pending'",
            "error": "text",
            "created_at": "timestamp with time zone default now()",
            "updated_at": "timestamp with time zone default now()"
        })

        print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {str(e)}")
        raise e
