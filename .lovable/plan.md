

## Plan: Merge Hero Card with Input Bar

### Concept

Combine the hero welcome card and the ChatGPT-style input into a single unified component. The hero card will contain the greeting text at the top, the search input at the bottom, and three small action chips beneath the input — all within the same gold-bordered card.

### Layout

```text
┌─────────────────────────────────────────────────────┐
│  YOUR LEARNING STUDIO                               │
│  ✨ Welcome back, Name.                      [image]│
│  Pick up where you left off, or start something new.│
│                                                     │
│  ┌───────────────────────────────────────────┐      │
│  │ 🔍 What do you want to learn today?       │      │
│  └───────────────────────────────────────────┘      │
│  [📚 Create Course] [🧠 Assessment] [💼 Interview]  │
└─────────────────────────────────────────────────────┘
```

On mobile: full-bleed background image, white text, input and chips overlaid at the bottom of the card.

### Changes to `src/pages/StudentDashboard.tsx`

1. **Add state**: `inputTopic` string and `activeWizard` (null | 'course' | 'assessment' | 'interview')
2. **Extend hero card content**: Below the subtitle text, add:
   - A text input styled with `bg-white/10 sm:bg-white` border, rounded-full, with a search icon — matching the premium aesthetic
   - Three small action chips in a flex row: "Create Course", "Skill Assessment", "Mock Interview" — styled as pill buttons with `bg-white/20 sm:bg-[#091747]` for mobile/desktop contrast
3. **Input behavior**: On Enter, sets `activeWizard` to `'course'` and passes the topic
4. **Action chip behavior**: Each chip sets `activeWizard` to its type and navigates or triggers wizard
5. **Desktop layout**: Input and chips go inside the left text panel (40% side), below the subtitle, with some top margin
6. **Mobile layout**: Input and chips sit at the bottom of the hero overlay, above the gradient, with white/translucent styling
7. **Wizard takeover**: When `activeWizard` is set, wrap dashboard body in `AnimatePresence` — fade out normal content, fade in the relevant wizard (reuse from `HubPage.tsx` or inline)

### Files Modified

| File | Change |
|------|--------|
| `src/pages/StudentDashboard.tsx` | Add input + action chips inside hero card, add wizard state & transitions |

### What Stays the Same
- Hero card outer styling (gold border, shadow, rounded-2xl)
- Background image and gradient treatment
- Feature cards grid below
- Recent Activity section
- All animations

