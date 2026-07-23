# Task Manager App

A React Native task management application focused on robust offline caching, clean state management, and separation of concerns.

## Project Structure

```text
src/
├── assets/          # Fonts, icons, and image assets
├── components/      # Reusable UI components
│   └── common/      # Shared components (Buttons, Inputs, Modals, etc.)
├── constants/       # Global constants (Colors, Typography, Strings)
├── providers/       # Global provider wrappers (UIProvider, etc.)
├── hooks/           # Custom React hooks
├── lib/             # Third-party library initializations (e.g., Supabase)
├── navigation/      # React Navigation setup and config
├── screens/         # App screens
│   ├── categories/  # Category-related screens
│   └── tasks/       # Task-related screens
├── store/           # Redux store setup and slices
├── types/           # TypeScript type definitions
└── utils/           # Helper utilities and functions
```
## Architectural Decisions & Rationale

Here is a breakdown of the key architectural choices made for this project:

### 1. Why not `redux-persist`?
While `redux-persist` is an easy way to persist the Redux store to `AsyncStorage`, we decided to **build a custom Redux middleware** instead. 
- **Rationale:** `redux-persist` adds a third-party dependency, acts as a "black box" serializer, and can complicate debugging. By writing a custom middleware, we have explicit, fine-grained control over exactly when our tasks are serialized to `AsyncStorage`. This ensures a robust offline cache with zero bloat.

### 2. Why not SQLite (e.g., WatermelonDB or `react-native-sqlite-storage`)?
- **Rationale:** SQLite is fantastic for large-scale datasets (10,000+ items) requiring complex relational queries or full bidirectional sync. However, for a simple Task Manager that handles hundreds of tasks, SQLite introduces unnecessary overhead (schema setups, migrations, query layers). `AsyncStorage` paired with our custom Redux caching middleware is faster to implement, perfectly adequate for the data scale, and maintains a single source of truth (Redux). It's always easy to migrate the middleware to SQLite later if the userbase/data grows exponentially.

### 3. How the Custom Cache Middleware Works
We use a Redux Toolkit Listener (or a custom middleware) that intercepts successful actions (like fetching, adding, or editing tasks). When the task list updates, the middleware explicitly calls `AsyncStorage.setItem()` in the background. On app startup, the root component calls `AsyncStorage.getItem()` and dispatches an initialization action to populate the Redux store before triggering the background Supabase refresh.

### 4. How the Local-Only `starred` Field Survives a Refresh

Tasks fetched from the backend don't include the `starred` flag — it exists only on the device. The merge logic lives in `src/store/tasksSlice.ts` inside `fetchTasksSuccess`:

```ts
const currentStarredMap: Record<string, boolean> = {};
state.items.forEach(t => {
  if (t.starred) currentStarredMap[t.id] = true;
});
state.items = fetchedTasks.map(t => ({
  ...t,
  starred: currentStarredMap[t.id] || false,
}));
```

Before overwriting the task list with backend data, we snapshot any `starred: true` entries into a map keyed by task ID. After the refresh data lands, we re-apply the flag. If a task was deleted on the backend, its `starred` value is naturally dropped (no matching ID in the fresh payload). This approach is O(n + m) — one pass over current items, one map lookup per fetched task.

---

## Testing Approach

Three test files cover different layers of the application:

| Test file | What it tests | Why |
|---|---|---|
| `src/utils/__tests__/taskUtils.test.ts` | `filterAndSortTasks` — search by title, filter by category/status, sort by created_at and due_date | This is the core business logic for the Task List. It's pure (no mocks needed), cheap to run, and any regression here directly breaks the main screen. |
| `src/utils/__tests__/categoryUtils.test.ts` | `getCategoryStyle` — keyword-to-icon mapping and hash-based color assignment | Demonstrates the mapper pattern. Validates that new category names get reasonable visual defaults without crashing, and that the return shape (`icon`, `colors.bg`, `colors.text`) matches what the component expects. |
| `src/store/__tests__/tasksSlice.test.ts` | Redux reducer — `setInitialCache`, `addTask`, `updateTask`, `deleteTask`, `toggleStar` | Covers the cache merge logic and CRUD reducer actions. The `toggleStar` test also double-fires to verify toggle idempotency. |

All tests use real reducer/function imports rather than shallow mocks, so they exercise actual TypeScript types and runtime paths.

---

## What We Could Do (Out of Scope)

These are not in the requirements, but each would be straightforward to add:

1. **Error recovery toast on write failures** — Replace `Alert.alert` with a dismissible inline toast.
2. **Cursor-based pagination** — Wire `onEndReached` to cursor-based Supabase queries for task lists beyond 2,000 items.
3. **Pull-to-refresh debounce** — Add a 2-second throttle to prevent redundant `refreshTasks` calls on rapid pulls.
4. **Category rename/delete** — Extend the categories screen and add a confirmation modal for tasks referencing a deleted category.
5. **Integration tests** — Wire the `useTasks` hook to a mock Supabase client and add component tests for `TaskItem` rendering.

---


## Setup & Execution

### Prerequisites
- Node.js >= 20
- Supabase Project

### Installation
```bash
npm install
```

### Environment Config
Create a `.env` file in the root:
```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
```

### Backend Setup (Supabase)

#### Schema
Run the following in your Supabase SQL Editor:
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'in_review', 'reopen', 'done')),
  due_date TIMESTAMP WITH TIME ZONE,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Seed Data
```sql
INSERT INTO categories (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'Work'),
('22222222-2222-2222-2222-222222222222', 'Personal'),
('33333333-3333-3333-3333-333333333333', 'Errands');

INSERT INTO tasks (title, status, category_id) VALUES 
('Finish quarterly report', 'open', '11111111-1111-1111-1111-111111111111'),
('Buy groceries', 'done', '33333333-3333-3333-3333-333333333333'),
('Call mom', 'open', '22222222-2222-2222-2222-222222222222'),
('Pay electricity bill', 'open', '33333333-3333-3333-3333-333333333333'),
('Read new tech blog', 'done', '22222222-2222-2222-2222-222222222222'),
('Update resume', 'open', '11111111-1111-1111-1111-111111111111'),
('Schedule dentist appointment', 'open', '22222222-2222-2222-2222-222222222222'),
('Drop off dry cleaning', 'done', '33333333-3333-3333-3333-333333333333');
```

## Running the App

```bash
# Android
npx react-native run-android

# iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

## Known Limitations & Future Work
- **Conflict Resolution:** If a user edits a task offline and the backend has changed concurrently, the offline change forcefully overwrites the backend. A proper sync queue with last-write-wins (or vector clocks) would be needed for complex offline scenarios.
- **Pagination:** Currently fetches all tasks. If tasks grow >2,000, we would implement cursor-based pagination.
