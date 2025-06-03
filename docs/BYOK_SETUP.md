# BYOK (Bring Your Own Key) Setup Guide

## Overview
The BYOK feature allows authenticated users to input and save their own API keys for AI providers (OpenAI, Mistral, Anthropic, Google AI, xAI). These keys are securely encrypted and stored in the database, with the system falling back to environment variables when user keys are not available.

## Database Setup

Add the following SQL to your Supabase database:

```sql
-- Create user_keys table for storing encrypted API keys
CREATE TABLE IF NOT EXISTS user_keys (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, provider)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_keys_user_id ON user_keys(user_id);

-- Add RLS policies
ALTER TABLE user_keys ENABLE ROW LEVEL SECURITY;

-- Users can only access their own keys
CREATE POLICY "Users can access their own keys" ON user_keys
  FOR ALL USING (auth.uid() = user_id);
```

## Environment Variables

Add to your `.env.local`:

```bash
# Encryption key for user API keys (64 character hex string)
ENCRYPTION_SECRET=your_64_character_hex_encryption_key
```

Generate a secure encryption key:
```bash
openssl rand -hex 32
```

## Features

- **Secure Storage**: API keys are encrypted using AES-256-GCM before storage
- **Masked Display**: Keys are shown as ••••••••••••••••• in the UI
- **Edit Mode**: Click the eye icon to reveal/edit keys
- **Auto-Save**: Changes are automatically detected and save button appears
- **Provider Priority**: User keys take precedence over environment variables
- **CSRF Protection**: All API requests are protected against CSRF attacks

## Supported Providers

- OpenAI (sk-...)
- Mistral AI
- Anthropic (sk-ant-...)
- Google AI
- xAI/Grok (xai-...)

## Usage

1. Navigate to Settings → Connections
2. Find the "API Keys" section
3. Enter your API keys for desired providers
4. Click "Save API Keys" when done
5. Your keys will be used automatically for AI requests

## Security Notes

- Keys are encrypted before storage using AES-256-GCM
- Only the authenticated user can access their own keys
- Keys are never sent to the frontend except during edit mode
- CSRF tokens protect against cross-site request forgery
- Fallback to environment variables ensures service continuity
