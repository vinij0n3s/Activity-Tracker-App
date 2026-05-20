#!/bin/bash
# Telegram reminder script - sends a reminder every 6 days

PROJECT_ID="uqjqlmzlsgasfhvbpssb"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxanFsbXpsc2dhc2ZodmJwc3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2MzQwMzIsImV4cCI6MjA4NTIxMDAzMn0.TVJi7bm1svNnx9af2ekyVOe2NDBqNG8NN57Lc7Rpm9M"

echo "Sending Telegram reminder at $(date)"
curl -X POST "https://${PROJECT_ID}.supabase.co/functions/v1/make-server-7c33a2a7/telegram-reminder" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json"
echo ""
echo "Telegram reminder completed"
