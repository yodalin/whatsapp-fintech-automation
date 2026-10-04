-- 001_initial_schema.sql
-- Idempotent baseline schema for whatsapp-fintech-automation.
-- Safe to run against an existing database (no-op when objects already exist)
-- or against a fresh one owned by the migrating user.
-- Requires the uuid-ossp extension for uuid_generate_v4() used in column defaults.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- conversations
CREATE TABLE IF NOT EXISTS conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    whatsapp_number VARCHAR(20) NOT NULL,
    status          VARCHAR(20) DEFAULT 'open',
    created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- messages
CREATE TABLE IF NOT EXISTS messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender          VARCHAR(20) NOT NULL,
    message_type    VARCHAR(20) DEFAULT 'text',
    content         TEXT,
    raw_payload     JSONB,
    created_at      TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);

-- Indexes: guarded with an existence check so we never issue CREATE INDEX on a
-- table we don't own (pg raises "must be owner of table ..." otherwise, even
-- when the index already exists). Only created on a fresh, owned database.
DO $$
DECLARE
    idx  TEXT;
    tbl  TEXT;
    col  TEXT;
BEGIN
    FOR idx, tbl, col IN
        VALUES
            ('idx_conversations_whatsapp_number', 'conversations', 'whatsapp_number'),
            ('idx_conversations_status',            'conversations', 'status'),
            ('idx_messages_conversation_id',        'messages',      'conversation_id'),
            ('idx_messages_created_at',             'messages',      'created_at')
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM pg_indexes
            WHERE schemaname = 'public'
              AND tablename  = tbl
              AND indexname  = idx
        ) THEN
            EXECUTE format('CREATE INDEX %I ON %I (%I)', idx, tbl, col);
        END IF;
    END LOOP;
END $$;
