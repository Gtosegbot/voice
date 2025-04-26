from typing import Optional
from ..schemas.mcp import MCPConfig, MCPStatus
from supabase import Client
import asyncio


class MCPManager:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.config = MCPConfig()
        self.status = MCPStatus()

    async def get_status(self) -> MCPStatus:
        """Obtém o status atual do MCP"""
        try:
            # Verificar conexão com o Supabase
            response = await self.supabase.table("settings").select("*").limit(1).execute()
            self.status.connected = True
            self.status.message = "Conexão com Supabase estabelecida"
        except Exception as e:
            self.status.connected = False
            self.status.message = f"Erro na conexão com Supabase: {str(e)}"

        return self.status

    async def get_config(self) -> MCPConfig:
        """Obtém a configuração atual do MCP"""
        try:
            response = await self.supabase.table("settings").select("*").eq("category", "mcp").execute()
            if response.data:
                self.config = MCPConfig(**response.data[0])
            return self.config
        except Exception as e:
            raise Exception(f"Erro ao obter configuração: {str(e)}")

    async def update_config(self, config: MCPConfig) -> MCPConfig:
        """Atualiza a configuração do MCP"""
        try:
            await self.supabase.table("settings").upsert({
                "category": "mcp",
                "key": "config",
                "value": config.dict()
            }).execute()
            self.config = config
            return self.config
        except Exception as e:
            raise Exception(f"Erro ao atualizar configuração: {str(e)}")

    async def create_tables(self):
        """Cria todas as tabelas necessárias no Supabase"""
        try:
            # Tabela de usuários
            await self.supabase.table("users").create({
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
            await self.supabase.table("leads").create({
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
            await self.supabase.table("campaigns").create({
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
            await self.supabase.table("conversations").create({
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
            await self.supabase.table("messages").create({
                "id": "uuid primary key",
                "conversation_id": "uuid references conversations(id) not null",
                "sender_type": "text not null",
                "sender_id": "uuid",
                "content": "text not null",
                "message_type": "text default 'text'",
                "created_at": "timestamp with time zone default now()"
            })

            # Tabela de chamadas
            await self.supabase.table("calls").create({
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
            await self.supabase.table("notes").create({
                "id": "uuid primary key",
                "lead_id": "uuid references leads(id) not null",
                "user_id": "uuid references users(id) not null",
                "content": "text not null",
                "note_type": "text default 'general'",
                "created_at": "timestamp with time zone default now()"
            })

            # Tabela de fluxos
            await self.supabase.table("flows").create({
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
            await self.supabase.table("settings").create({
                "id": "uuid primary key",
                "user_id": "uuid references users(id)",
                "category": "text not null",
                "key": "text not null",
                "value": "text not null",
                "created_at": "timestamp with time zone default now()",
                "updated_at": "timestamp with time zone default now()"
            })

            # Tabela de callbacks
            await self.supabase.table("callbacks").create({
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
            await self.supabase.table("reminders").create({
                "id": "uuid primary key",
                "callback_id": "uuid references callbacks(id) not null",
                "reminder_time": "timestamp with time zone not null",
                "channel": "text not null",
                "status": "text default 'pending'",
                "error": "text",
                "created_at": "timestamp with time zone default now()",
                "updated_at": "timestamp with time zone default now()"
            })

            return True
        except Exception as e:
            raise Exception(f"Erro ao criar tabelas: {str(e)}")
