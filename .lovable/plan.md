

# Plan: Pre-fill Topic on Dedicated Pages from Spotlight Hero

## What This Does

When a user types a topic in the Spotlight Hero (e.g. "JavaScript fundamentals" in Assessment mode) and hits Enter, instead of showing a placeholder wizard on the dashboard, they'll be navigated directly to the dedicated page (`/assessments` or `/assessments/job-interview-simulator`) with the creation form already open and the topic pre-filled. Courses already work inline — no change needed there.

## Complexity: Low

This is a routing `state` pass-through. ~4 small edits, no new components, no API changes.

## Changes

### 1. `src/pages/StudentDashboard.tsx` — Navigate instead of showing placeholder wizards

**InlineAssessmentWizard**: Replace the placeholder card with a `navigate('/assessments', { state: { topic: initialTopic, autoCreate: true } })` call on mount (via `useEffect`).

**InlineInterviewWizard**: Same pattern — `navigate('/assessments/job-interview-simulator', { state: { topic: initialTopic } })` on mount.

Both components become thin redirectors. The `onBack` button becomes unnecessary since we're leaving the page.

### 2. `src/pages/SkillAssessments.tsx` — Receive topic and auto-open form

- Import `useLocation`
- Read `location.state?.topic` and `location.state?.autoCreate`
- If `autoCreate` is true, set `isCreating = true` on mount
- Pass `initialTopic={location.state?.topic}` to `MultiStepAssessmentForm`

### 3. `src/components/skill-assessment/MultiStepAssessmentForm.tsx` — Accept and use `initialTopic`

- Add optional `initialTopic?: string` prop
- If provided, pre-fill the `industry` field in the initial `formData` state (the topic from the hero maps best to "industry" as the first step)
- The user lands on step 1 with the field already filled and can proceed immediately

### 4. `src/pages/JobInterviewSimulator.tsx` — Receive topic and pre-fill form

- Already imports `useLocation` and reads `locationState`
- Add check: if `locationState.topic` exists and no `interviewId`, pre-fill the job title field
- Pass `initialTopic={locationState.topic}` to `MultiStepInterviewForm`

### 5. `src/components/interview/MultiStepInterviewForm.tsx` — Accept and use `initialTopic`

- Add optional `initialTopic?: string` prop
- Pre-fill `jobTitle` in the initial `formData` state if provided

## What Stays the Same

- `InlineCourseWizard` — unchanged, already works inline on the dashboard
- All form validation, generation logic, and API calls
- The multi-step form UIs themselves (just pre-filled)
- All existing routes

