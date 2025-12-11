# FIRST30 Campaign - Quick Start Guide

## 🎯 Campaign Overview

**Promo Code:** `FIRST30`  
**Launch Date:** December 10, 2025  
**Slots:** 30 users  
**Benefit:** 1 free virtual internship  
**Requirement:** Feedback consent (survey sent after 30 days)  

---

## 📋 What Gets Built

### User Experience Flow

```
1. User visits /auth?tab=signup
   ↓
2. Fills in name, email, password
   ↓
3. Enters "FIRST30" in promo code field
   ↓
4. Feedback consent checkbox appears
   "□ I consent to receiving a feedback survey via email..."
   ↓
5. User checks box and submits
   ↓
6. Email verification sent
   ↓
7. After verification → promotional_internships_remaining = 1
   ↓
8. User sees badge in header: "🎁 1 Free Internship"
   ↓
9. User clicks "Create New Internship"
   ↓
10. Sees green banner: "🎉 FIRST30 Promotion Active!"
   ↓
11. Creates internship → counter decrements to 0
   ↓
12. Feedback reminder scheduled for 30 days
   ↓
13. 30 days later → Email sent with survey link
   ↓
14. User completes feedback survey
   ↓
15. (Optional) Entered into gift card drawing
```

---

## 🏗️ System Architecture

### Database Changes

```sql
-- New Tables
promotional_codes               -- Store FIRST30 and future codes
promotional_code_redemptions    -- Track who redeemed what
promotional_feedback_reminders  -- Schedule feedback emails

-- New Columns in profiles
promotional_internships_remaining  -- How many free internships left
promo_code_used                   -- Which code they used
feedback_consent                  -- Did they agree to feedback
feedback_consent_date             -- When they consented

-- New Columns in internship_sessions
is_promotional   -- Is this a promotional internship?
promo_code      -- Which promo code was used
```

### Frontend Components

```
src/
├── hooks/
│   ├── usePromoCode.ts                    [NEW] Validate & redeem codes
│   ├── usePromotionalInternships.ts       [NEW] Track promo status
│   └── useSignUpForm.ts                   [UPDATE] Add promo fields
│
├── components/
│   ├── auth/
│   │   ├── PromoCodeInput.tsx             [NEW] Promo code field
│   │   └── SignUpForm.tsx                 [UPDATE] Add promo input
│   │
│   ├── promotional/
│   │   └── PromotionalBadge.tsx           [NEW] Header badge
│   │
│   ├── layout/
│   │   ├── desktop/DesktopHeader.tsx      [UPDATE] Add badge
│   │   └── mobile/MobileHeader.tsx        [UPDATE] Add badge
│   │
│   └── internship/
│       └── MultiStepInternshipSetupForm.tsx [UPDATE] Access check
│
└── pages/
    └── PromotionalFeedback.tsx            [NEW] Survey form
```

### Backend Functions

```
supabase/functions/
├── create-internship-session/
│   └── index.ts                           [UPDATE] Add promo validation
│
└── send-promotional-feedback-email/
    └── index.ts                           [NEW] Email automation
```

---

## ✅ Implementation Checklist

### Phase 1: Database Setup (2 hours)
- [ ] Apply SQL migration (`FIRST30_PROMO_IMPLEMENTATION_GUIDE.md` Section 1)
- [ ] Verify FIRST30 code created with max_uses = 30
- [ ] Test RLS policies
- [ ] Regenerate TypeScript types

### Phase 2: Promo Code System (2 hours)
- [ ] Create `usePromoCode.ts` hook
- [ ] Create `usePromotionalInternships.ts` hook
- [ ] Update `useSignUpForm.ts` with promo logic
- [ ] Test validation and redemption

### Phase 3: Signup Flow (2 hours)
- [ ] Create `PromoCodeInput.tsx` component
- [ ] Update `SignUpForm.tsx` to include promo field
- [ ] Test feedback consent checkbox appears
- [ ] Test promo code redemption after signup

### Phase 4: Header Badge (1 hour)
- [ ] Create `PromotionalBadge.tsx` component
- [ ] Update `DesktopHeader.tsx`
- [ ] Update `MobileHeader.tsx`
- [ ] Test badge appears after redemption

### Phase 5: Internship Creation (1 hour)
- [ ] Update `MultiStepInternshipSetupForm.tsx` access check
- [ ] Add promotional banner for FIRST30 users
- [ ] Test counter decrements after creation
- [ ] Verify server-side validation

### Phase 6: Feedback System (3 hours)
- [ ] Create `PromotionalFeedback.tsx` page
- [ ] Create `send-promotional-feedback-email` edge function
- [ ] Set up email service (Resend)
- [ ] Schedule cron job in Supabase
- [ ] Test email sending

### Phase 7: Testing (2 hours)
- [ ] Complete full user flow
- [ ] Test edge cases (30th user, duplicate redemption)
- [ ] Verify all SQL queries work
- [ ] Check header badge on mobile and desktop

### Phase 8: Deployment (1 hour)
- [ ] Deploy to staging
- [ ] Final testing
- [ ] Deploy to production on Dec 10, 2025
- [ ] Monitor logs

---

## 🧪 Quick Test Commands

### Check Campaign Status
```sql
SELECT 
  code,
  current_uses || '/' || max_uses as usage,
  starts_at,
  CASE 
    WHEN current_uses >= max_uses THEN 'FULL'
    WHEN starts_at > NOW() THEN 'NOT STARTED'
    ELSE 'ACTIVE'
  END as status
FROM promotional_codes
WHERE code = 'FIRST30';
```

### List FIRST30 Users
```sql
SELECT 
  p.email,
  p.promotional_internships_remaining as remaining,
  p.feedback_consent,
  r.redeemed_at
FROM profiles p
JOIN promotional_code_redemptions r ON p.id = r.user_id
JOIN promotional_codes pc ON r.code_id = pc.id
WHERE pc.code = 'FIRST30'
ORDER BY r.redeemed_at;
```

### Check Promotional Internships
```sql
SELECT 
  p.email,
  i.job_title,
  i.industry,
  i.created_at
FROM internship_sessions i
JOIN profiles p ON i.user_id = p.id
WHERE i.promo_code = 'FIRST30'
ORDER BY i.created_at;
```

### Manually Grant Promo (Testing Only)
```sql
UPDATE profiles
SET promotional_internships_remaining = 1,
    promo_code_used = 'FIRST30',
    feedback_consent = true
WHERE email = 'test@example.com';
```

---

## 📚 Documentation Files

1. **`FIRST30_PROMO_IMPLEMENTATION_GUIDE.md`** (THIS IS THE MAIN ONE)
   - 8 detailed sections with complete code
   - Database migration (300+ lines of SQL)
   - All React components
   - Edge functions
   - Email templates
   - Testing & deployment

2. **`PROMOTIONAL_INTERNSHIP_SUMMARY.md`** (Updated)
   - Executive summary
   - Architecture overview
   - Files to study
   - Estimated effort

3. **`FIRST30_QUICK_START.md`** (This file)
   - Quick reference
   - User flow
   - Checklist
   - Test commands

---

## 🚀 Deployment Day (Dec 10, 2025)

### Pre-Launch Checklist
- [ ] All code deployed and tested in staging
- [ ] FIRST30 code visible in database with 0 uses
- [ ] Email service configured and tested
- [ ] Cron job scheduled and tested
- [ ] Marketing materials ready (if any)

### Launch Steps
1. Deploy to production (early morning)
2. Verify promo code works
3. Monitor first redemptions
4. Watch for errors in logs
5. Celebrate first users! 🎉

### Post-Launch Monitoring
- Check SQL queries daily for usage
- Monitor edge function logs
- Watch for feedback emails (30 days later)
- Track feedback submission rate

---

## 📞 Support & Troubleshooting

### Common Issues

**"Promo code already used"**
- User already redeemed FIRST30
- Check: `promotional_code_redemptions` table

**"Usage limit reached"**
- All 30 slots filled
- Check: `promotional_codes.current_uses`

**"Feedback consent required"**
- User didn't check the consent box
- Checkbox only appears when FIRST30 is entered

**Badge not showing**
- Check `promotional_internships_remaining` > 0
- Verify realtime subscription is working
- Clear browser cache

**Email not sending**
- Check cron job is running
- Verify Resend API key is set
- Check `promotional_feedback_reminders.sent_at`

### Debug Logs

```bash
# Watch edge function logs
supabase functions logs create-internship-session --tail
supabase functions logs send-promotional-feedback-email --tail

# Check database in Supabase Dashboard
# https://app.supabase.com/project/YOUR_PROJECT/editor
```

---

## 🎁 Campaign Results Tracking

### Week 1 Report
```sql
SELECT 
  COUNT(*) as total_redemptions,
  COUNT(CASE WHEN promotional_internships_remaining > 0 THEN 1 END) as not_used_yet,
  COUNT(CASE WHEN promotional_internships_remaining = 0 THEN 1 END) as already_created
FROM profiles
WHERE promo_code_used = 'FIRST30';
```

### Month 1 Report (After Feedback)
```sql
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN feedback_email_sent THEN 1 END) as emails_sent,
  COUNT(CASE WHEN f.feedback_submitted THEN 1 END) as feedback_received
FROM profiles p
LEFT JOIN promotional_feedback_reminders f ON p.id = f.user_id
WHERE p.promo_code_used = 'FIRST30';
```

---

**Need Help?** 
- Full implementation: `FIRST30_PROMO_IMPLEMENTATION_GUIDE.md`
- Architecture details: `PROMOTIONAL_INTERNSHIP_SUMMARY.md`
- This quick reference: `FIRST30_QUICK_START.md`

