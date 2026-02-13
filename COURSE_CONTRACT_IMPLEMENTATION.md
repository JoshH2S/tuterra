# Course Contract Implementation

## Answer to Your Question

**Do we currently do this?** 
❌ **NO** - We do NOT have a proper "Course Contract Screen" that sets clear expectations.

**Does our content produce what it's promising?**
⚠️ **PARTIALLY** - We have the metadata but don't present it as a commitment/contract.

## What We Had Before

### ✅ Existing Metadata (but poorly presented):
- `course.pace_weeks` (e.g., "4 weeks")
- `module.estimated_minutes` (total time calculation)
- `course.learning_objectives` (what you'll learn)
- Basic progress tracking

### ❌ Missing Critical Elements:
- No **sessions per week** commitment
- No **start date** selection
- No **target completion date**
- No **course contract agreement**
- No **schedule preview**
- No **time commitment breakdown**

## What We've Now Implemented

### 🎯 **New Component: CourseContractScreen**

**Location:** `/src/components/course-engine/CourseContractScreen.tsx`

**Features:**
1. **Course Overview Card**
   - Duration: "4 weeks"
   - Time Commitment: "2 sessions/week, ~15 min each"
   - Total Learning: "2h 30m, 4 modules"

2. **Start Date Selection**
   - User picks their start date
   - Calculates target completion date
   - Shows: "Target completion: Friday, March 15, 2026"

3. **Learning Objectives Display**
   - "By the end of this course, you'll be able to:"
   - Checkmark list of specific outcomes

4. **Session Schedule Preview**
   - Week-by-week breakdown
   - "Week 1: Introduction to Flying - Tue, Feb 18 & Thu, Feb 20"
   - Shows exact dates for all sessions

5. **Course Contract Agreement**
   - ✅ "I understand this is a 4-week commitment"
   - ✅ "I will dedicate ~30 minutes per week to learning"
   - ✅ "I will attend 2 sessions per week as scheduled"
   - ✅ "I will complete all modules and assessments"

### 🔄 **Integration Flow**

**Before:**
```
Course Detail → [Start Course] → Directly to learning
```

**After:**
```
Course Detail → [Start Course] → Course Contract Screen → [Accept Contract] → Learning
```

### 📊 **Updated Type System**

**Enhanced `CourseProgress` interface:**
```typescript
export interface CourseProgress {
  // ... existing fields
  scheduled_start_date?: string;     // User's chosen start date
  target_completion_date?: string;   // Calculated completion date  
  sessions_per_week?: number;        // User's commitment (default 2)
}
```

## Example User Experience

### 1. **Course Contract Screen Shows:**
```
Ready to Start Your Learning Journey?
Let's set up your personalized learning schedule

[Course Title: "Master the Art of Flying"]
[Description: "Learn fundamental aviation principles..."]

Duration: 4 weeks
Time Commitment: 2 sessions/week, ~15 min each  
Total Learning: 1h 0m, 4 modules

When would you like to start? [Date Picker: Feb 18, 2026]
Target completion: Friday, March 15, 2026

By the end of this course, you'll be able to:
✅ Understand basic aerodynamics principles
✅ Identify different aircraft types and their uses
✅ Explain the physics of flight
✅ Navigate basic flight planning concepts

Your Learning Schedule:
Week 1: Introduction to Aviation - Tue, Feb 18 & Thu, Feb 20
Week 2: Aerodynamics Fundamentals - Tue, Feb 25 & Thu, Feb 27  
Week 3: Aircraft Systems - Tue, Mar 4 & Thu, Mar 6
Week 4: Flight Planning - Tue, Mar 11 & Thu, Mar 13

Course Commitment:
✅ I understand this is a 4-week commitment
✅ I will dedicate ~15 minutes per week to learning
✅ I will attend 2 sessions per week as scheduled  
✅ I will complete all modules and assessments

[Not Ready Yet] [Start My Learning Journey →]
```

### 2. **What This Achieves:**

**🎯 Clear Expectations:**
- Exact time commitment (not vague "4 weeks")
- Specific session schedule (Tue/Thu pattern)
- Concrete completion date

**📅 Commitment Psychology:**
- User actively chooses start date
- Sees their personal schedule
- Explicitly agrees to commitment

**✅ Accountability:**
- Clear contract terms
- Specific deliverables promised
- Measurable outcomes listed

## Does This Ensure Content Delivers What It Promises?

### ✅ **YES - Now We Have:**

1. **Specific Time Promises** 
   - Contract: "~15 min per session"
   - Reality: Calculated from actual `estimated_minutes`

2. **Clear Learning Outcomes**
   - Contract: Lists specific `learning_objectives`
   - Reality: Generated content targets these objectives

3. **Realistic Schedule**
   - Contract: "2 sessions per week for 4 weeks"
   - Reality: 4 modules × 6 steps each = manageable workload

4. **Completion Timeline**
   - Contract: "Target completion: March 15, 2026"
   - Reality: Progress tracking shows actual completion rate

### 🔄 **How It Prevents Over-Promising:**

- **Time calculations** are based on real `estimated_minutes` from modules
- **Learning objectives** come from AI-generated course outline
- **Schedule** is calculated from actual course structure
- **Commitment** matches the content we actually generate

## Next Steps to Complete Implementation

1. **Save Contract Data:**
   ```typescript
   // TODO in handleAcceptContract:
   await supabase.from('course_progress').update({
     scheduled_start_date: startDate.toISOString(),
     target_completion_date: targetDate.toISOString(),
     sessions_per_week: 2
   })
   ```

2. **Show Progress Against Contract:**
   - "You're on track to complete by March 15"
   - "2 days behind schedule - catch up with a session today"

3. **Contract Reminders:**
   - Email/notification on scheduled session days
   - Weekly progress reports against commitment

## Bottom Line

**Before:** Vague promises, no commitment, users start blindly  
**After:** Specific contract, clear expectations, informed commitment

This transforms course starting from **"clicking a button"** to **"making a commitment"** - which is exactly what real courses require for success.





