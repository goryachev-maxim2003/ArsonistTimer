# Arsonist v2.0 — Full Product Technical Specification

## 0. Product Summary

**Arsonist** is a completely free, local-first productivity app that combines:

- task management;
- Pomodoro/focus sessions;
- projects;
- subtasks;
- recurring tasks;
- daily planning;
- statistics;
- streaks;
- focus history;
- calendar view;
- themes;
- sounds;
- browser notifications;
- Markdown/JSON export;
- optional local AI features;
- optional Obsidian-friendly export.

The product is inspired by apps like Focus To-Do, Todoist, Forest, Notion task systems, and productivity dashboards, but it should feel more modern, personal, fast, and visually distinct.

The core metaphor is:

> Ignite focus. Burn procrastination. Turn tasks into ashes.

Important: the name **Arsonist** is only a productivity metaphor. The app must not promote real-world fire, harm, danger, violence, or illegal activity.

---

## 1. Product Philosophy

Arsonist should be a **complete free productivity system**, not a limited demo.

There must be:

- no paid plan;
- no Pro tier;
- no ads;
- no locked features;
- no account requirement;
- no backend requirement;
- no telemetry by default;
- no forced cloud sync;
- no artificial limitations.

The app should be useful even if the user is offline forever.

Main goals:

1. Help users start tasks.
2. Help users stay focused.
3. Help users break large work into small sessions.
4. Help users see real progress.
5. Help users review their productivity.
6. Help users keep all data locally.
7. Help users export their data freely.

---

## 2. Version Target

This specification is for **Arsonist v2.0**, meaning the app should be built as a full product from the start, not just an MVP.

The app should include all core features expected from a mature productivity tool:

- task management;
- projects;
- subtasks;
- tags;
- recurring tasks;
- Pomodoro timer;
- focus history;
- daily/weekly/monthly statistics;
- calendar view;
- streak system;
- settings;
- themes;
- notification support;
- export/import;
- Markdown export;
- optional AI helpers;
- responsive UI;
- local-first persistence.

---

## 3. Target Users

Arsonist is designed for:

- students;
- programmers;
- freelancers;
- creators;
- researchers;
- people with many small tasks;
- people who procrastinate;
- people who use Pomodoro;
- people who want a beautiful local productivity dashboard;
- people who use Obsidian/Markdown;
- people who dislike subscription-based productivity tools.

---

## 4. Core User Stories

### 4.1 Task Management

As a user, I want to create tasks so I can organize my work.

As a user, I want to add priority, due date, subtasks, tags, notes, and Pomodoro estimates to each task.

As a user, I want to mark tasks complete and see my progress.

As a user, I want recurring tasks so repeated habits and routines are automatic.

---

### 4.2 Focus Sessions

As a user, I want to choose a task and start a focus session.

As a user, I want to pause, resume, stop, and complete a timer.

As a user, I want my completed focus sessions to be saved automatically.

As a user, I want short and long breaks after focus sessions.

As a user, I want the timer to stay accurate even when the browser tab is inactive.

---

### 4.3 Planning

As a user, I want to plan my day by selecting tasks.

As a user, I want to see whether my day is overloaded.

As a user, I want an estimated workload in hours and Pomodoro sessions.

As a user, I want to drag tasks into a suggested order.

---

### 4.4 Statistics

As a user, I want to see how much I focused today.

As a user, I want weekly and monthly charts.

As a user, I want to see which projects receive the most focus.

As a user, I want to see my streak and best productivity days.

---

### 4.5 Local Ownership

As a user, I want all data stored locally.

As a user, I want to export my data as JSON and Markdown.

As a user, I want to import my data again later.

As a user, I want to reset the app if needed.

---

## 5. Technology Stack

Use the following stack:

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- IndexedDB
- localStorage for lightweight settings only
- Framer Motion for small UI animations
- Recharts or lightweight custom charts
- Lucide React for icons
- date-fns for date utilities
- optional PWA support

Do not require a backend.

---

## 6. Suggested Project Setup

Create a Vite project:

```bash
npm create vite@latest arsonist -- --template react-ts
cd arsonist
npm install
npm install zustand date-fns lucide-react framer-motion recharts idb
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## 7. File Structure

Use this structure:

```txt
src/
  app/
    App.tsx
    routes.tsx
    providers.tsx

  pages/
    DashboardPage.tsx
    TasksPage.tsx
    FocusPage.tsx
    ProjectsPage.tsx
    CalendarPage.tsx
    StatsPage.tsx
    HistoryPage.tsx
    SettingsPage.tsx

  components/
    layout/
      AppLayout.tsx
      Sidebar.tsx
      Header.tsx
      MobileNav.tsx
      CommandBar.tsx

    ui/
      Button.tsx
      Card.tsx
      Input.tsx
      Textarea.tsx
      Select.tsx
      Modal.tsx
      Drawer.tsx
      Badge.tsx
      Tabs.tsx
      Toggle.tsx
      ProgressRing.tsx
      ConfirmDialog.tsx
      EmptyState.tsx

    tasks/
      TaskCard.tsx
      TaskList.tsx
      TaskEditor.tsx
      TaskFilters.tsx
      TaskQuickAdd.tsx
      SubtaskList.tsx
      TagPicker.tsx
      PriorityBadge.tsx
      RecurrenceBadge.tsx

    timer/
      FocusTimer.tsx
      TimerControls.tsx
      TimerProgressRing.tsx
      SessionCompleteModal.tsx
      BreakPrompt.tsx
      FocusTaskSelector.tsx

    projects/
      ProjectCard.tsx
      ProjectEditor.tsx
      ProjectList.tsx
      ProjectStats.tsx

    stats/
      DailyStatsCards.tsx
      WeeklyFocusChart.tsx
      MonthlyHeatmap.tsx
      ProjectBreakdownChart.tsx
      StreakCard.tsx
      ProductivitySummary.tsx

    calendar/
      CalendarMonth.tsx
      CalendarDay.tsx
      CalendarTaskList.tsx

    history/
      FocusSessionList.tsx
      SessionFilters.tsx
      SessionCard.tsx

    settings/
      TimerSettings.tsx
      ThemeSettings.tsx
      DataSettings.tsx
      NotificationSettings.tsx
      AiSettings.tsx
      ObsidianExportSettings.tsx

  hooks/
    useTimer.ts
    useTasks.ts
    useProjects.ts
    useStats.ts
    useCalendar.ts
    useKeyboardShortcuts.ts
    useNotifications.ts
    useLocalSettings.ts

  store/
    taskStore.ts
    projectStore.ts
    timerStore.ts
    settingsStore.ts
    statsStore.ts
    uiStore.ts

  types/
    task.ts
    project.ts
    session.ts
    settings.ts
    stats.ts
    calendar.ts
    export.ts

  db/
    schema.ts
    indexedDb.ts
    repositories/
      taskRepository.ts
      projectRepository.ts
      sessionRepository.ts
      settingsRepository.ts

  utils/
    date.ts
    timer.ts
    recurrence.ts
    stats.ts
    exportJson.ts
    exportMarkdown.ts
    importData.ts
    validation.ts
    ids.ts
    formatting.ts

  styles/
    globals.css
```

---

## 8. Branding

### 8.1 Name

Product name:

```txt
Arsonist
```

### 8.2 Brand Meaning

The app uses fire as a metaphor for:

- energy;
- action;
- momentum;
- focus;
- transformation;
- burning through tasks.

It must not use real dangerous imagery.

Avoid visuals of:

- real buildings on fire;
- weapons;
- violence;
- crime;
- harm.

Prefer visuals of:

- small flame;
- ember;
- spark;
- matchstick;
- controlled campfire-style symbol;
- glowing progress ring.

---

## 9. Visual Style

### 9.1 Main Theme: Dark Ember

```txt
Background:       #0D0D0F
Surface:          #17171A
Surface Light:    #222226
Border:           #2F2F35
Primary:          #FF6A00
Primary Soft:     #FF9A3C
Ember Red:        #E6391A
Amber:            #FFC857
Text:             #F5F2EB
Muted Text:       #A3A3A3
Success:          #3DDC84
Danger:           #FF4D4D
```

### 9.2 Optional Themes

Include several free themes:

1. **Dark Ember**
2. **Charcoal**
3. **Midnight**
4. **Ash Light**
5. **Forest Focus**
6. **Deep Ocean**

No theme should be paid.

### 9.3 UI Mood

The UI should feel:

- dark;
- clean;
- premium;
- fast;
- slightly cyber/productivity dashboard;
- calm, not noisy;
- focused on tasks and data.

Use subtle orange glow only for important elements.

---

## 10. Navigation

Main pages:

```txt
Dashboard
Tasks
Focus
Projects
Calendar
Stats
History
Settings
```

Desktop:

- left sidebar;
- top header;
- main content area.

Mobile:

- bottom navigation or drawer;
- compact header;
- timer should remain easy to access.

---

## 11. Dashboard Page

Dashboard is the main home screen.

It must show:

1. Greeting.
2. Current date.
3. Daily goal progress.
4. Active focus timer card.
5. Today’s tasks.
6. Quick add task.
7. Mini statistics.
8. Streak card.
9. Weekly focus preview.
10. Overdue tasks warning.
11. Suggested next task.

Example layout:

```txt
----------------------------------------------------
| Sidebar | Good evening. Ready to ignite focus?    |
|         |------------------------------------------|
|         | [Focus Timer Card] [Daily Goal Card]     |
|         |------------------------------------------|
|         | [Quick Add Task]                         |
|         |------------------------------------------|
|         | Today’s Tasks                            |
|         | - Finish lab report                      |
|         | - Review lecture slides                  |
|         |------------------------------------------|
|         | [Streak] [Focus Today] [Tasks Done]      |
----------------------------------------------------
```

---

## 12. Tasks Page

The Tasks page should be a powerful task manager.

### 12.1 Features

Users can:

- create tasks;
- edit tasks;
- delete tasks;
- complete tasks;
- archive tasks;
- duplicate tasks;
- search tasks;
- filter tasks;
- sort tasks;
- assign project;
- assign tags;
- add subtasks;
- set priority;
- set due date;
- set recurrence;
- estimate Pomodoros;
- start focus directly from a task.

### 12.2 Views

Provide multiple views:

```txt
List View
Today View
Upcoming View
Project View
Completed View
Archived View
```

Optional:

```txt
Kanban View
```

---

## 13. Task Model

```ts
export type TaskStatus =
  | "todo"
  | "in_progress"
  | "completed"
  | "archived";

export type Priority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  notes?: string;

  projectId?: string;
  tagIds: string[];

  status: TaskStatus;
  priority: Priority;

  dueDate?: string;
  scheduledDate?: string;

  estimatedPomodoros: number;
  completedPomodoros: number;

  estimatedMinutes?: number;
  actualFocusMinutes: number;

  subtasks: Subtask[];

  recurrence?: RecurrenceRule;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  archivedAt?: string;
}
```

---

## 14. Recurring Tasks

Support recurring tasks in v2.0.

### 14.1 Recurrence Types

```ts
export type RecurrenceFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
}
```

### 14.2 Behavior

When a recurring task is completed:

1. Mark current instance completed.
2. Create the next occurrence.
3. Preserve project, tags, priority, estimate, and notes.
4. Reset subtasks unless user chooses otherwise.

Example:

```txt
Task: Review flashcards
Recurrence: Daily
When completed on Monday, next task is created for Tuesday.
```

---

## 15. Tags

Tags allow cross-project grouping.

### Tag Model

```ts
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}
```

Examples:

```txt
exam
coding
urgent
reading
writing
admin
health
```

---

## 16. Projects Page

Projects organize work.

### 16.1 Project Features

Users can:

- create project;
- rename project;
- choose project color;
- choose icon;
- archive project;
- delete project;
- view tasks by project;
- view project focus statistics.

### 16.2 Project Model

```ts
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}
```

---

## 17. Focus Page

The Focus page is dedicated to the timer.

### 17.1 Timer Modes

```ts
export type TimerMode =
  | "focus"
  | "short_break"
  | "long_break";
```

### 17.2 Timer Status

```ts
export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed";
```

### 17.3 Default Timer Settings

```txt
Focus: 25 minutes
Short break: 5 minutes
Long break: 15 minutes
Long break interval: every 4 focus sessions
```

Users can change all values.

### 17.4 Controls

The timer must support:

```txt
Start
Pause
Resume
Stop
Skip
Complete manually
Reset
```

### 17.5 Branded Button Labels

Main CTA:

```txt
Ignite Focus
```

Other optional branded labels:

```txt
Pause Flame
Resume Burn
Extinguish
Start Break
Skip Break
```

Add a setting to use neutral labels instead:

```txt
Start Focus
Pause
Resume
Stop
Start Break
Skip Break
```

---

## 18. Accurate Timer Requirement

The timer must remain accurate even if:

- the tab is inactive;
- the browser throttles intervals;
- the user switches apps;
- the computer sleeps and wakes later.

Do not rely only on decrementing seconds with `setInterval`.

Use:

```ts
plannedEndAt = startedAt + duration
remainingSeconds = plannedEndAt - Date.now()
```

Persist active timer state.

Runtime state:

```ts
export interface TimerRuntimeState {
  mode: TimerMode;
  status: TimerStatus;

  selectedTaskId?: string;
  selectedProjectId?: string;

  durationSeconds: number;
  remainingSeconds: number;

  startedAt?: string;
  pausedAt?: string;
  plannedEndAt?: string;

  totalPausedSeconds: number;
  completedFocusSessionsInCycle: number;
}
```

---

## 19. Focus Session Model

```ts
export type FocusSessionStatus =
  | "completed"
  | "cancelled"
  | "partial";

export interface FocusSession {
  id: string;

  taskId?: string;
  projectId?: string;

  mode: TimerMode;

  plannedDurationMinutes: number;
  actualDurationMinutes: number;

  status: FocusSessionStatus;

  startedAt: string;
  endedAt?: string;

  createdAt: string;
}
```

---

## 20. Session Completion Logic

When a focus session completes:

1. Save FocusSession.
2. Add actual minutes to task.
3. Increase completedPomodoros if full session.
4. Update daily stats.
5. Update streak if daily goal is reached.
6. Offer short break or long break.
7. If task estimatedPomodoros is reached, suggest marking task complete.

If user stops early:

- under 50% completed: mark as cancelled by default;
- over 50% completed: ask whether to save as partial.

---

## 21. Break Logic

After each completed focus session:

- if session count in cycle is less than longBreakInterval, offer short break;
- if session count reaches longBreakInterval, offer long break and reset cycle.

Example:

```txt
Focus 1 → Short break
Focus 2 → Short break
Focus 3 → Short break
Focus 4 → Long break
```

---

## 22. Calendar Page

The Calendar page should show tasks by date.

### 22.1 Views

Required:

```txt
Month View
Day View
```

Optional:

```txt
Week View
```

### 22.2 Calendar Features

Users can:

- see tasks due on each day;
- see completed tasks;
- see focus minutes per day;
- click a day to view tasks;
- move task date;
- create task for selected day.

### 22.3 Calendar Day Cell

Each day should show:

- date number;
- number of tasks;
- completed count;
- focus minutes;
- small color markers for projects.

---

## 23. Statistics Page

The Stats page should provide a full productivity overview.

### 23.1 Required Stats

Show:

- focus time today;
- focus time this week;
- focus time this month;
- completed sessions;
- completed tasks;
- average focus per day;
- longest session;
- best day;
- most active project;
- current streak;
- longest streak;
- completion rate.

### 23.2 Charts

Required charts:

```txt
Daily focus bar chart
Weekly focus chart
Monthly heatmap
Project breakdown chart
Task completion trend
```

### 23.3 Stats Filters

Users can filter by:

```txt
Today
Last 7 days
Last 30 days
This month
Custom range
Project
Tag
```

---

## 24. Daily Stats Model

```ts
export interface DailyStats {
  date: string;

  totalFocusMinutes: number;
  completedSessions: number;
  partialSessions: number;
  cancelledSessions: number;

  completedTasks: number;
  createdTasks: number;

  projectBreakdown: Record<string, number>;
  tagBreakdown: Record<string, number>;

  dailyGoalCompleted: boolean;
}
```

---

## 25. Streak System

### 25.1 Streak Rule

A streak day is counted if the user meets their daily goal.

Daily goal can be based on:

```txt
Focus minutes
Pomodoro count
Completed tasks
```

Default:

```txt
1 completed Pomodoro per day
```

### 25.2 Streak Model

```ts
export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
  frozenDates?: string[];
}
```

### 25.3 Streak Freeze

Because the product is fully free, streak freeze is also free.

Users may enable:

```txt
Streak grace mode
```

Grace mode can allow one missed day per week.

No paid streak freeze.

---

## 26. History Page

The History page shows all focus sessions.

### 26.1 Features

Users can:

- see all sessions;
- filter by date;
- filter by task;
- filter by project;
- filter by session status;
- delete incorrect sessions;
- edit session notes;
- export session history.

### 26.2 Session Card

Show:

```txt
Task name
Project
Date
Start time
Duration
Status
Mode
```

---

## 27. Settings Page

Settings should include:

1. Timer settings.
2. Appearance settings.
3. Daily goal settings.
4. Notification settings.
5. Sound settings.
6. Data settings.
7. AI settings.
8. Obsidian/Markdown export settings.
9. Keyboard shortcuts.
10. About page.

---

## 28. Timer Settings

Users can configure:

```txt
Focus duration
Short break duration
Long break duration
Long break interval
Auto-start breaks
Auto-start next focus
Allow manual session completion
Save partial sessions
Show timer in page title
```

---

## 29. Appearance Settings

Users can configure:

```txt
Theme
Accent color
Compact mode
Reduced motion
Brand tone
```

Brand tone:

```txt
Neutral
Arsonist
```

Neutral labels:

```txt
Start Focus
Pause
Resume
Stop
Complete
```

Arsonist labels:

```txt
Ignite Focus
Pause Flame
Resume Burn
Extinguish
Burn Complete
```

---

## 30. Notification Settings

Support browser notifications.

Notify when:

```txt
Focus session ends
Break ends
Daily goal completed
Task is due soon
Task is overdue
Streak is at risk
```

If notification permission is blocked, show a clear message:

```txt
Notifications are blocked in your browser. Enable them in browser settings if you want reminders.
```

---

## 31. Sound Settings

Include optional sound support.

Users can enable/disable:

```txt
Focus complete sound
Break complete sound
Task complete sound
Daily goal sound
Streak sound
```

For v2.0, simple browser-generated tones are acceptable. Real audio files are optional.

---

## 32. Data Settings

Users can:

```txt
Export all data as JSON
Import data from JSON
Export daily log as Markdown
Export weekly report as Markdown
Export focus history as CSV
Reset app
```

Reset must require confirmation.

---

## 33. JSON Export Format

```json
{
  "app": "Arsonist",
  "version": "2.0.0",
  "exportedAt": "2026-04-30T00:00:00.000Z",
  "tasks": [],
  "projects": [],
  "tags": [],
  "sessions": [],
  "settings": {},
  "streak": {},
  "stats": []
}
```

---

## 34. Markdown Export

### 34.1 Daily Log Example

```md
# Arsonist Daily Log — 2026-04-30

## Summary

- Focus time: 2h 30m
- Sessions completed: 6
- Tasks completed: 4
- Daily goal: completed
- Streak: 5 days

## Completed Tasks

- Study enzyme kinetics
- Finish coding lab
- Review lecture slides

## Focus Sessions

| Time | Task | Project | Duration |
|---|---|---|---|
| 10:00 | Study enzyme kinetics | University | 25m |
| 10:35 | Study enzyme kinetics | University | 25m |

## Reflection

Today’s strongest focus block was in the morning.
```

### 34.2 Weekly Report Example

```md
# Arsonist Weekly Report

## Summary

- Total focus: 12h 15m
- Sessions: 31
- Tasks completed: 18
- Best day: Wednesday
- Top project: University

## Project Breakdown

| Project | Focus Time |
|---|---|
| University | 8h 30m |
| Coding | 3h 45m |
```

---

## 35. Obsidian-Friendly Export

The app should support exports that work well in Obsidian.

Features:

- daily note export;
- weekly report export;
- task list export;
- focus log export;
- Markdown tables;
- optional frontmatter.

Example frontmatter:

```md
---
app: Arsonist
date: 2026-04-30
focus_minutes: 150
sessions: 6
tasks_completed: 4
---
```

---

## 36. Optional AI Features

AI features must be optional and free.

Do not require cloud AI.

AI can be connected later to:

- local LLM endpoint;
- OpenAI-compatible local server;
- Ollama;
- llama.cpp server;
- LM Studio server.

Do not hardcode a paid provider.

### 36.1 AI Settings

Allow user to configure:

```txt
Enable AI features
Provider type
Base URL
Model name
API key optional
```

Provider types:

```txt
Disabled
OpenAI-compatible local endpoint
Ollama
llama.cpp
LM Studio
Manual/custom
```

### 36.2 AI Features

AI can help with:

1. Task breakdown.
2. Pomodoro estimation.
3. Daily planning.
4. Productivity reflection.
5. Rewriting messy tasks.
6. Creating study plans.
7. Suggesting next task.

### 36.3 AI Safety

AI output must be suggestions only.

The user must confirm before AI changes tasks.

---

## 37. Local AI Endpoint Format

For OpenAI-compatible servers:

```txt
Base URL: http://127.0.0.1:8080/v1
Model: local-model-name
API Key: optional/dummy
```

Example request:

```ts
POST /chat/completions
```

The app should support local-only mode without AI.

---

## 38. Command Bar

Add a command bar for fast actions.

Shortcut:

```txt
Ctrl + K
```

Actions:

```txt
Add task
Start focus
Open today
Open stats
Open settings
Create project
Export data
```

---

## 39. Keyboard Shortcuts

Required shortcuts:

```txt
Ctrl + K        Open command bar
N               New task
Space           Start/pause timer when on Focus page
Esc             Close modal
T               Go to Tasks
F               Go to Focus
D               Go to Dashboard
S               Go to Stats
```

Shortcuts should not interfere with typing in inputs.

---

## 40. Quick Add Syntax

Support simple quick add text.

Examples:

```txt
Finish lab report tomorrow high 3p #university
Review slides today medium 2p #biology
Gym session every monday low 1p #health
```

Parsing can support:

```txt
today
tomorrow
high
medium
low
urgent
1p, 2p, 3p
#tag
```

If parsing fails, save the full text as title.

---

## 41. Search

Global search should search:

- tasks;
- projects;
- tags;
- notes;
- focus history.

Search should be fast and local.

---

## 42. Filters and Sorting

Task filters:

```txt
All
Today
Tomorrow
Upcoming
Overdue
Completed
Archived
No date
High priority
By project
By tag
Recurring
```

Sort options:

```txt
Due date
Priority
Created date
Updated date
Estimated Pomodoros
Completed status
Manual order
```

---

## 43. Data Persistence

Use IndexedDB for main data.

Store:

```txt
tasks
projects
tags
sessions
settings
stats
streak
```

Use localStorage only for:

```txt
theme
last opened page
sidebar collapsed
lightweight UI preferences
```

All data must survive page refresh.

---

## 44. Database Schema

Suggested IndexedDB stores:

```txt
arsonist_tasks
arsonist_projects
arsonist_tags
arsonist_sessions
arsonist_settings
arsonist_stats
arsonist_streak
```

Each record should include timestamps.

---

## 45. Validation

Validate:

- task title cannot be empty;
- focus duration must be at least 1 minute;
- break duration must be at least 1 minute;
- estimated Pomodoros cannot be negative;
- import JSON must match expected schema;
- due date must be valid;
- project name cannot be empty.

---

## 46. Error Messages

Examples:

```txt
Task title cannot be empty.
Project name cannot be empty.
Focus duration must be at least 1 minute.
Could not import this file. The format is invalid.
Could not save data locally.
Notifications are blocked in your browser.
```

---

## 47. Empty States

Examples:

No tasks:

```txt
No tasks yet.
Create your first spark.
```

No focus sessions:

```txt
No focus history yet.
Complete your first session to see it here.
```

No projects:

```txt
No projects yet.
Create a project to organize your focus.
```

No stats:

```txt
No data yet.
Your charts will appear after your first focus session.
```

---

## 48. Accessibility Requirements

The app must:

- have good color contrast;
- support keyboard navigation;
- use semantic HTML;
- provide labels for inputs;
- support reduced motion;
- not rely only on color;
- allow Escape to close modals;
- provide aria labels for icon buttons;
- keep focus trapped inside modals.

---

## 49. Responsive Requirements

Desktop:

- sidebar layout;
- multi-column dashboard;
- large timer.

Tablet:

- collapsible sidebar;
- two-column dashboard.

Mobile:

- bottom nav or drawer;
- single-column layout;
- large touch targets;
- timer remains readable.

---

## 50. Performance Requirements

The app should:

- start quickly;
- avoid heavy dependencies;
- avoid unnecessary rerenders;
- handle at least 5,000 tasks;
- handle at least 20,000 focus sessions;
- debounce search;
- calculate stats efficiently;
- cache derived stats where useful.

---

## 51. PWA Support

Optional but recommended:

- installable app;
- app icon;
- offline support;
- service worker;
- manifest file.

PWA must not require account or server.

---

## 52. Security and Privacy

Because the app is local-first:

- do not send user data anywhere by default;
- no analytics by default;
- no tracking;
- no external requests unless the user enables AI integration or imports/exports manually;
- AI endpoint must be user-configured.

Show privacy note in settings:

```txt
Arsonist stores your productivity data locally on your device. No account or cloud sync is required.
```

---

## 53. About Page

Include:

```txt
Arsonist v2.0
A free local-first focus and task management app.
No ads. No subscriptions. No locked features.
```

---

## 54. Core Acceptance Criteria

The product is complete when all of the following work.

### 54.1 Tasks

- User can create a task.
- User can edit a task.
- User can delete a task.
- User can complete a task.
- User can archive a task.
- User can add subtasks.
- User can add tags.
- User can set priority.
- User can set due date.
- User can set recurring rule.
- User can estimate Pomodoros.
- User can start focus from a task.

### 54.2 Projects

- User can create projects.
- User can edit projects.
- User can archive projects.
- User can delete projects.
- User can view tasks by project.
- User can see project statistics.

### 54.3 Timer

- User can start focus session.
- User can pause timer.
- User can resume timer.
- User can stop timer.
- User can skip break.
- User can complete timer.
- Timer remains accurate when tab is inactive.
- Completed sessions are saved.
- Partial sessions can be saved.
- Breaks work correctly.
- Long break appears after configured number of sessions.

### 54.4 Stats

- User can see today’s focus time.
- User can see weekly focus.
- User can see monthly focus.
- User can see project breakdown.
- User can see task completion trend.
- User can see current and longest streak.
- User can filter stats by date/project/tag.

### 54.5 Calendar

- User can see tasks on calendar.
- User can select a date.
- User can create task for date.
- User can view focus minutes per day.

### 54.6 History

- User can see all focus sessions.
- User can filter sessions.
- User can delete incorrect session.
- User can export session history.

### 54.7 Settings

- User can change timer durations.
- User can change theme.
- User can change daily goal.
- User can enable/disable notifications.
- User can enable/disable sounds.
- User can export/import data.
- User can reset app.

### 54.8 Data

- All data persists after refresh.
- JSON export works.
- JSON import works.
- Markdown export works.
- No backend is required.

---

## 55. Non-Goals

Do not build:

- paid subscriptions;
- locked Pro features;
- server backend;
- forced login;
- ads;
- social feed;
- real-time collaboration;
- cloud sync by default;
- crypto/web3 features.

---

## 56. Suggested Implementation Order

Build in this order:

1. Project setup.
2. Theme and layout.
3. Routing.
4. IndexedDB layer.
5. Types.
6. Zustand stores.
7. Task CRUD.
8. Project CRUD.
9. Tags.
10. Subtasks.
11. Recurring tasks.
12. Timer core.
13. Session saving.
14. Break logic.
15. Daily stats.
16. Streak.
17. Dashboard.
18. Stats page.
19. Calendar page.
20. History page.
21. Settings.
22. Export/import.
23. Markdown export.
24. Notifications.
25. Sounds.
26. Command bar.
27. Keyboard shortcuts.
28. Optional AI integration.
29. Responsive polish.
30. Accessibility polish.
31. Testing and bug fixing.

---

## 57. Full Codex Build Prompt

Copy this prompt into Codex if you want it to build the app.

```txt
Build a full free local-first productivity app called Arsonist v2.0.

Arsonist is a Pomodoro + task management + productivity dashboard app. It must be completely free with no paid plan, no ads, no backend requirement, no login requirement, no locked features, and no subscription system.

Use:
- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- IndexedDB
- date-fns
- lucide-react
- framer-motion
- recharts or lightweight custom charts

The app must work offline and store all main data locally.

Main pages:
- Dashboard
- Tasks
- Focus
- Projects
- Calendar
- Stats
- History
- Settings

Core features:
1. Task CRUD.
2. Project CRUD.
3. Tags.
4. Subtasks.
5. Recurring tasks.
6. Task priorities.
7. Due dates.
8. Pomodoro estimates.
9. Focus timer.
10. Short breaks.
11. Long breaks.
12. Focus session history.
13. Daily, weekly, and monthly stats.
14. Project breakdown.
15. Streak system.
16. Calendar view.
17. Settings.
18. Themes.
19. Browser notifications.
20. Optional sounds.
21. JSON export/import.
22. Markdown export.
23. Obsidian-friendly daily and weekly reports.
24. Command bar.
25. Keyboard shortcuts.
26. Optional local AI integration.

Important timer requirement:
Do not rely only on setInterval decrementing seconds. Store startedAt and plannedEndAt, then calculate remaining time from Date.now(). The timer must remain accurate when the browser tab is inactive.

Visual style:
Dark Ember theme:
- background #0D0D0F
- surface #17171A
- surface light #222226
- border #2F2F35
- primary #FF6A00
- primary soft #FF9A3C
- ember red #E6391A
- amber #FFC857
- text #F5F2EB
- muted #A3A3A3
- success #3DDC84

UI style:
- dark minimal dashboard
- rounded cards
- subtle orange glow
- clean typography
- responsive layout
- desktop sidebar
- mobile navigation
- accessible components
- reduced motion option

Data models:
Implement Task, Subtask, Project, Tag, FocusSession, DailyStats, Streak, UserSettings, RecurrenceRule.

Required behavior:
- All data persists after refresh.
- Completed focus sessions update task progress.
- Completing a recurring task creates the next occurrence.
- Daily goal updates streak.
- JSON export/import preserves all user data.
- Markdown export creates useful daily and weekly reports.
- The app does not contact any external server unless the user manually enables optional local AI integration.

No paid features. Everything is free.
```

---

## 58. Development Notes for Codex

When implementing, prefer clean, maintainable code over one huge file.

Rules:

1. Do not put all logic inside App.tsx.
2. Keep timer logic in hooks/store.
3. Keep persistence in db/repositories.
4. Keep types in types/.
5. Keep UI reusable.
6. Keep business logic testable.
7. Avoid magic strings where possible.
8. Use clear names.
9. Handle empty/error/loading states.
10. Make the app pleasant to use.

---

## 59. Final Product Definition

Arsonist v2.0 is complete when it feels like a real free alternative to Focus To-Do, but with:

- stronger local ownership;
- better design;
- better export;
- better statistics;
- better task structure;
- better customization;
- no subscriptions;
- no artificial limits;
- optional local AI support.

The final app should be something a student, coder, or freelancer could use every day as their main task and focus system.
