# 🚀 Quick Deployment Guide

## Step-by-Step Deployment

### 1️⃣ **Run Database Migrations** (5 min)

Open Supabase SQL Editor and run these **3 SQL files in order**:

```sql
-- File 1: Schema + Idempotency + RLS
-- Paste: supabase/migrations/20250930000001_supervisor_mvp_idempotency.sql
```

```sql
-- File 2: Metrics Functions  
-- Paste: supabase/migrations/20250930000002_supervisor_metrics.sql
```

```sql
-- File 3: Cleanup Old Architecture
-- Paste: supabase/migrations/20250930000003_cleanup_locks_transactions.sql
```

**Expected output:**
```
✅ Supervisor MVP migration completed successfully
✅ Idempotency keys enabled
✅ Email-style fields added
✅ RLS policies configured
✅ Performance indexes created
✅ Supervisor metrics functions created successfully
✅ Cleanup complete: Lock-based architecture removed
```

---

### 2️⃣ **Deploy Edge Functions** (2 min)

```bash
cd /Users/jmugh/Downloads/tuterra-6

# Deploy refactored ai-supervisor
supabase functions deploy ai-supervisor

# Deploy new supervisor-scan (cron)
supabase functions deploy supervisor-scan
```

---

### 3️⃣ **Set Environment Variables** (1 min)

In **Supabase Dashboard** → **Edge Functions** → **Settings**:

```
OPENAI_API_KEY = sk-your-key-here
```

---

### 4️⃣ **Enable Cron Job** (2 min)

In **Supabase Dashboard** → **Database** → **Cron Jobs** → **New Cron Job**:

**Name:** `supervisor-scan-job`  
**Schedule:** `*/30 * * * *` (every 30 minutes)  
**SQL:**

```sql
SELECT net.http_post(
  url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/supervisor-scan',
  headers := jsonb_build_object(
    'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY',
    'Content-Type', 'application/json'
  )
);
```

**Replace:**
- `YOUR_PROJECT_REF` with your Supabase project reference
- `YOUR_SERVICE_ROLE_KEY` with your service role key (Dashboard → Settings → API)

---

### 5️⃣ **Test the System** (5 min)

#### Test Onboarding (should send once):
```typescript
// In your app or via Supabase Function Test
{
  "action": "onboarding",
  "session_id": "your-session-uuid",
  "user_id": "your-user-uuid"
}
```

#### Verify Metrics:
```sql
SELECT * FROM get_supervisor_metrics_summary(
  'your-session-uuid'::uuid,
  'your-user-uuid'::uuid,
  30
);
```

#### Check Messages:
```sql
SELECT 
  id, 
  subject, 
  direction, 
  sender_type, 
  idem_key,
  sent_at 
FROM internship_supervisor_messages
ORDER BY sent_at DESC
LIMIT 5;
```

---

## 🎯 Verification Checklist

- [ ] All 3 migrations ran successfully
- [ ] `idem_key` column exists in `internship_supervisor_messages`
- [ ] RPC functions exist: `increment_interactions`, `get_supervisor_metrics_summary`
- [ ] `supervisor_locks` table is gone
- [ ] `ai-supervisor` function deployed
- [ ] `supervisor-scan` function deployed
- [ ] Cron job is scheduled and enabled
- [ ] Test onboarding message sends (and doesn't duplicate)
- [ ] Metrics component shows data

---

## 🔧 Troubleshooting

### **Migrations fail:**
- Make sure you run them in order (001 → 002 → 003)
- Check for existing conflicting columns (use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`)

### **Cron not running:**
- Check cron job is **enabled** in Dashboard
- Verify URL and service key are correct
- Check logs in **Edge Functions** → **supervisor-scan** → **Logs**

### **Messages not sending:**
- Check `OPENAI_API_KEY` is set correctly
- Verify templates exist in `internship_supervisor_templates` table
- Check Edge Function logs for errors

### **Metrics showing N/A:**
- Make sure messages have been sent (check `sent_at` is not null)
- Verify RLS policies allow user to read their messages
- Check function permissions: `GRANT EXECUTE ON FUNCTION get_supervisor_metrics_summary TO authenticated;`

---

## 📊 Monitoring

### View Recent Messages:
```sql
SELECT 
  message_type,
  subject,
  direction,
  sender_type,
  sent_at,
  idem_key
FROM internship_supervisor_messages
WHERE session_id = 'your-session-uuid'
ORDER BY sent_at DESC
LIMIT 10;
```

### Check Cron Execution:
```sql
SELECT * FROM cron.job_run_details 
WHERE jobname = 'supervisor-scan-job'
ORDER BY start_time DESC 
LIMIT 5;
```

### View Metrics:
```sql
SELECT * FROM get_supervisor_metrics_summary(
  'session-uuid'::uuid,
  'user-uuid'::uuid,
  30 -- days
);
```

---

## 🎉 You're Done!

The supervisor messaging system is now:
- ✅ Idempotent (no duplicates)
- ✅ Deterministic (predictable triggers)
- ✅ Resilient (AI timeout + fallback)
- ✅ Secure (RLS policies)
- ✅ Observable (metrics dashboard)
- ✅ Proactive (cron scanner)

**Ready for production!** 🚀

