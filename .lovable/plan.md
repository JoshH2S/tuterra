

## Plan: Update Price to $5.99 and Remove Free Plan

### 1. Edge Function — Swap Stripe Price ID
**File:** `supabase/functions/create-checkout/index.ts` (line 205)
- Replace `price_1RG6bhG3AK2xXjO3wCUouYYh` with `price_1TBnwtG3AK2xXjO39wbyT739`

### 2. Landing Page Pricing (`src/components/landing/PricingSection.tsx`)
- Remove the Free plan object from `tuteeraPricing` array (lines 5-20)
- Update Pro price from `$9.99` → `$5.99`, yearly from `$7.99` → `$4.79` (20% discount)
- Update description to remove "free plan" reference

### 3. Landing Pricing Component (`src/components/ui/pricing.tsx`)
- Remove the promotional internships badge logic for the Free plan
- Change grid from `md:grid-cols-3` to `md:grid-cols-2`

### 4. In-App Pricing Page (`src/pages/PricingPage.tsx`)
- Remove `tierFeatures.free` and the Free `SubscriptionCard`
- Update Pro price strings: `$9.99` → `$5.99`, `$7.99` → `$4.79`
- Remove `free_plan` case in `handleSelectPlan`
- Remove `handlePlanDowngrade` and related downgrade logic
- Change grid from `lg:grid-cols-3` to `lg:grid-cols-2`

### 5. Pricing Plans Component (`src/components/pricing/PricingPlans.tsx`)
- Remove Free card and features
- Update Pro price strings
- Change grid to 2-column

### 6. Pricing Hook (`src/hooks/usePricingPage.ts`)
- Remove `free_plan` routing in `handleSelectPlan`
- Remove `handlePlanDowngrade`

### 7. Deploy
- Redeploy `create-checkout` edge function with new price ID

