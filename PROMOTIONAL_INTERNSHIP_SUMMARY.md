# FIRST30 Promotional Campaign - Executive Summary

## What You Asked For
Implement a promotion where **the first 30 users to sign up with promo code "FIRST30"** (starting December 10, 2025) get **access to one free virtual internship** with **mandatory feedback consent**.

## Current System

### How Access Works Now
1. **Subscription Tier** is stored in `profiles.subscription_tier` (values: "free", "pro", "premium")
2. **Free users** ($0/month) get:
   - 5 quizzes/month
   - 2 interview simulations/month
   - 1 skill assessment/month
   - ❌ **NO virtual internships**

3. **Pro users** ($9.99/month) get:
   - Unlimited everything
   - ✅ **Unlimited virtual internships**

### Access Control Flow
```
User tries to create internship
  ↓
Check subscription_tier in profiles table
  ↓
If "free" → Show upgrade prompt → Redirect to /pricing
If "pro" or "premium" → Allow creation
```

**Key Files:**
- `src/hooks/useSubscription.ts` - Fetches subscription tier
- `src/components/internship/MultiStepInternshipSetupForm.tsx` - Line 128 checks if user is free tier
- `supabase/functions/create-internship-session/index.ts` - Edge function that creates internships

## What Needs to Change

### 1. Database Changes (SQL Migration)
**Add new tables and fields:**
- `promotional_codes` table - Store promo codes (FIRST30)
- `promotional_code_redemptions` table - Track who redeemed which codes
- `promotional_feedback_reminders` table - Schedule feedback emails
- `profiles.promotional_internships_remaining` (integer) - How many free internships user has left
- `profiles.promo_code_used` (text) - Which promo code they used
- `profiles.feedback_consent` (boolean) - Did they consent to feedback
- `internship_sessions.is_promotional` (boolean) - Mark promotional internships
- `internship_sessions.promo_code` (text) - Which promo code was used

**Promo code validation logic:**
```sql
-- Function to validate and redeem FIRST30
-- Max 30 uses, requires feedback consent
-- Schedules feedback reminder for 30 days after internship creation
```

### 2. Hook Changes
**Create new hooks:**
- `src/hooks/usePromoCode.ts` - Validate and redeem promo codes
- `src/hooks/usePromotionalInternships.ts` - Fetch promotional status, decrement counter

**Update existing hook:**
- `src/hooks/useSignUpForm.ts` - Add promo code and feedback consent state

### 3. Component Changes

**Create new components:**
- `src/components/auth/PromoCodeInput.tsx` - Promo code field with feedback consent checkbox
- `src/components/promotional/PromotionalBadge.tsx` - Header badge showing free internships
- `src/pages/PromotionalFeedback.tsx` - Feedback survey form

**Update components:**
- `src/components/auth/SignUpForm.tsx` - Add promo code input
- `src/components/layout/desktop/DesktopHeader.tsx` - Add promotional badge
- `src/components/layout/mobile/MobileHeader.tsx` - Add promotional badge (compact)
- `src/components/internship/MultiStepInternshipSetupForm.tsx` - Update access check

**New access check logic:**
```typescript
const hasAccess = 
  subscription.tier === "pro" || 
  subscription.tier === "premium" || 
  status.hasPromotionalInternships;

if (!hasAccess) {
  setShowUpgradePrompt(true);
  return;
}
```

**Promotional banner in header:**
```typescript
{status.hasPromotionalInternships && (
  <PromotionalBadge
    internshipsRemaining={status.internshipsRemaining}
    promoCode={status.promoCodeUsed}
  />
)}
```

### 4. Edge Function Changes

**Update:** `supabase/functions/create-internship-session/index.ts`
- Add server-side validation (subscription tier OR promotional internships)
- Decrement promotional count after successful creation
- Mark session as `is_promotional: true` and `promo_code: "FIRST30"`
- Schedule feedback reminder for 30 days

**Create new:** `supabase/functions/send-promotional-feedback-email/index.ts`
- Sends feedback survey emails
- Triggered by cron job daily
- Checks for reminders scheduled_for <= NOW()
- Marks emails as sent

## Implementation Approach

### Promo Code System (FIRST30)
✅ **Selected approach based on your requirements**

- Users enter code "FIRST30" during signup
- First 30 redemptions get 1 free internship
- **Mandatory feedback consent** checkbox appears when FIRST30 is entered
- Code is validated and redeemed after email verification
- Promotional badge shows in header after redemption
- Feedback survey sent automatically 30 days after internship creation
- Complete audit trail of redemptions

## What's in the Implementation Guide

I've created **`FIRST30_PROMO_IMPLEMENTATION_GUIDE.md`** with:

✅ **Complete Architecture Explanation**
- How subscription tier storage works
- How feature access is controlled
- Database schema for promo codes, redemptions, and feedback

✅ **Step-by-Step Implementation (8 Sections)**
1. Database Schema Changes - Complete SQL migration with functions
2. Promo Code System - Validation and redemption hooks
3. Signup Flow Integration - Promo code input with feedback consent
4. Header Badge Implementation - Desktop and mobile promotional badges
5. Internship Creation Logic - Access control and counter management
6. Feedback Collection System - Automated email surveys after 30 days
7. Testing & Validation - Comprehensive testing checklist and SQL queries
8. Deployment Steps - Commands, verification, and cron job setup

✅ **Complete Code Examples**
- Every file includes full, production-ready code
- SQL functions for validation and redemption
- React components with TypeScript
- Edge functions with error handling
- Email templates with HTML styling

✅ **Testing Tools**
- SQL queries to monitor campaign status
- Admin queries for debugging
- Step-by-step testing checklist
- Edge case scenarios

✅ **Security & Best Practices**
- Server-side validation in edge function
- RLS policies for all new tables
- Idempotency checks for redemptions
- Audit trail for compliance

## Files Your Engineer Should Study

### Must Read (Core System):
1. **`src/hooks/useSubscription.ts`** - How subscription state is managed
2. **`src/components/auth/SignUpForm.tsx`** - Signup flow with promo code
3. **`src/hooks/useSignUpForm.ts`** - Signup logic including promo validation
4. **`src/components/internship/MultiStepInternshipSetupForm.tsx`** - Where access check happens
5. **`supabase/functions/create-internship-session/index.ts`** - Server-side internship creation

### New Files to Create (From Guide):
6. **`src/hooks/usePromoCode.ts`** - Promo code validation and redemption
7. **`src/hooks/usePromotionalInternships.ts`** - Promotional status tracking
8. **`src/components/auth/PromoCodeInput.tsx`** - Promo code field component
9. **`src/components/promotional/PromotionalBadge.tsx`** - Header badge component
10. **`src/pages/PromotionalFeedback.tsx`** - Feedback survey page
11. **`supabase/functions/send-promotional-feedback-email/index.ts`** - Email automation

### Should Update (Existing Files):
12. **`src/components/layout/desktop/DesktopHeader.tsx`** - Add promotional badge
13. **`src/components/layout/mobile/MobileHeader.tsx`** - Add promotional badge
14. **`src/integrations/supabase/types.ts`** - Regenerate after migration

### Reference (Context):
15. **`src/components/pricing/PricingPlans.tsx`** - Feature definitions
16. **`src/pages/InternshipOverviewPage.tsx`** - Internship list page

## Campaign Details (As Specified)

✅ **Start Date:** December 10, 2025  
✅ **Promo Code:** FIRST30  
✅ **Slots Available:** 30 (first come, first served)  
✅ **Redemption:** During signup only  
✅ **Requirement:** Mandatory feedback consent checkbox  
✅ **Visibility:** Badge in header showing "1 Free Internship"  
✅ **Feedback Timing:** Automated email 30 days after internship creation  
✅ **Feedback Form:** Dedicated page with survey questions  
✅ **Expiration:** No expiration (can use anytime after redemption)  

## Additional Considerations

### Should Also Decide:

1. **Code Expiration:** Should FIRST30 code stop working after 30 redemptions?
   - Currently: No expiration, just max 30 uses
   - Alternative: Expires on specific date (e.g., Jan 31, 2026)

2. **Promotional Internship Restrictions:** Any limits on promotional internships?
   - Currently: Same features as paid internships
   - Alternative: Shorter duration or limited features

3. **Email Service:** Which email provider?
   - Guide uses Resend (recommended)
   - Alternatives: SendGrid, Mailgun, AWS SES

4. **Feedback Incentive:** Mentioned in guide but needs confirmation:
   - Gift card drawing for feedback submission?
   - If yes: Prize amount, number of winners, drawing date

5. **Marketing:**
   - Landing page mention of FIRST30?
   - Social media announcement?
   - Email to existing users?

## Estimated Effort

- **Database Migration & Functions:** 2 hours
- **Promo Code Hooks:** 2 hours
- **Signup Flow Updates:** 2 hours
- **Header Badge Components:** 1 hour
- **Internship Creation Updates:** 1 hour
- **Feedback System (Email + Form):** 3 hours
- **Testing & Debugging:** 2-3 hours
- **Deployment & Verification:** 1 hour
- **Documentation:** 30 minutes

**Total:** ~14-15 hours of development time

**Breakdown by Developer:**
- **Backend/Database:** ~5 hours (migration, functions, RLS)
- **Frontend:** ~7 hours (components, hooks, forms)
- **Integration:** ~2 hours (edge functions, email service)
- **Testing:** ~2 hours (manual testing, bug fixes)

## Risk Assessment

**Low Risk:**
- Database migration is additive (no existing data changed)
- Access check is enhanced, not replaced
- Can roll back by setting promotional_internships_remaining to 0

**Medium Risk:**
- Need to test race conditions (2 users creating internship simultaneously)
- Edge function changes require careful testing

**High Risk:**
- None identified

## Next Steps

### Phase 1: Review & Planning (30 mins)
1. ✅ Review this summary
2. ✅ Read sections 1-2 of `FIRST30_PROMO_IMPLEMENTATION_GUIDE.md` (Database & Promo Code System)
3. ⬜ Decide on feedback incentive (gift card drawing?)
4. ⬜ Choose email service provider (Resend recommended)
5. ⬜ Set up email service account and get API key

### Phase 2: Backend Implementation (5 hours)
1. ⬜ Apply database migration (Section 1)
2. ⬜ Create promo code hooks (Section 2)
3. ⬜ Update edge function (Section 5)
4. ⬜ Test with SQL queries (Section 7.2)
5. ⬜ Deploy edge functions

### Phase 3: Frontend Implementation (7 hours)
1. ⬜ Update signup form (Section 3)
2. ⬜ Create promotional badge (Section 4)
3. ⬜ Update internship creation (Section 5)
4. ⬜ Create feedback form (Section 6)
5. ⬜ Test entire flow (Section 7.1)

### Phase 4: Email System (3 hours)
1. ⬜ Set up email service (Resend)
2. ⬜ Create feedback email function (Section 6)
3. ⬜ Schedule cron job (Section 8.4)
4. ⬜ Test email sending

### Phase 5: Deployment (2 hours)
1. ⬜ Deploy to staging
2. ⬜ Complete testing checklist (Section 7.1)
3. ⬜ Monitor logs and fix bugs
4. ⬜ Deploy to production on Dec 10, 2025
5. ⬜ Announce FIRST30 campaign

---

**📖 Complete Guide:** `FIRST30_PROMO_IMPLEMENTATION_GUIDE.md` (300+ lines, production-ready code)  
**📊 Monitor Campaign:** Use SQL queries in Section 7.2 of guide  
**🐛 Debugging:** All edge cases covered in Section 7  
**🚀 Launch Date:** December 10, 2025

