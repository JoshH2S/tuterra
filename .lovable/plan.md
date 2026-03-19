

# Plan: Route AI Course mode to the dedicated courses page

## What This Does

Same pattern as assessments and interviews — when a user types a topic in the Spotlight Hero under "AI Course" mode and hits Enter, they'll be navigated to `/courses/generated` (the GeneratedCourseDashboard) with the `CourseCreateWizard` dialog auto-opened and the topic pre-filled. The large `InlineCourseWizard` component (~100 lines) in StudentDashboard gets replaced with a thin redirect.

## Changes

### 1. `src/pages/StudentDashboard.tsx`

Replace `InlineCourseWizard` with a redirect component (same pattern as assessment/interview):
```tsx
function InlineCourseWizard({ initialTopic }: { onBack: () => void; initialTopic: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/courses/generated", {
      state: { topic: initialTopic, autoCreate: true },
      replace: true,
    });
  }, [navigate, initialTopic]);
  return null;
}
```

This removes ~100 lines of duplicated wizard UI. Also clean up unused imports (`Input`, `Textarea`, `CourseLevel`, `FormatPreferences`, `useGeneratedCourses`, `Gauge`, `Clock`, `Loader2`, `Target`).

### 2. `src/pages/GeneratedCourseDashboard.tsx`

- Import `useLocation`
- Read `location.state?.topic` and `location.state?.autoCreate`
- If `autoCreate`, set `showWizard = true` on mount
- Pass `initialTopic={location.state?.topic}` to `CourseCreateWizard`

### 3. `src/components/course-engine/CourseCreateWizard.tsx`

- Add optional `initialTopic?: string` prop
- Use it to initialize the `topic` state: `useState(initialTopic || "")`
- No other changes needed — the wizard already has the full 3-step flow

## What Stays the Same

- The `CourseCreateWizard` component's UI and logic
- All generation/API calls
- Assessment and interview redirect flows (already done)

