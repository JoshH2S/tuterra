#!/bin/bash

# This script deploys the generate-internship-feedback Edge Function to Supabase

# Navigate to the project directory
cd "$(dirname "$0")"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first."
    echo "Installation instructions: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Deploy the Edge Function
echo "Deploying generate-internship-feedback Edge Function..."
supabase functions deploy generate-internship-feedback --no-verify-jwt

# Set up secrets for the Edge Function
echo "Setting up secrets for the Edge Function..."
echo "Please enter your OpenAI API key:"
read -s OPENAI_API_KEY

supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"

echo "Edge Function deployed successfully!"
echo "Make sure you have set up the database triggers or client code to call this function." 