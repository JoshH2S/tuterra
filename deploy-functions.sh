#!/bin/bash

# Make sure supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: supabase CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in
if ! supabase functions list &> /dev/null; then
    echo "Please login to Supabase CLI first with 'supabase login'"
    exit 1
fi

# Deploy the Edge Functions
echo "Deploying generate-company-profile function..."
supabase functions deploy generate-company-profile --no-verify-jwt

echo "Deploying generate-task-details function..."
supabase functions deploy generate-task-details --no-verify-jwt

echo "Deploying generate-internship-feedback function..."
supabase functions deploy generate-internship-feedback --no-verify-jwt

echo "Deploying create-internship-session function..."
supabase functions deploy create-internship-session --no-verify-jwt

echo "All functions deployed successfully!" 