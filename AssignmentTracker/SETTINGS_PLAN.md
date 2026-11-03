# Settings Page — Implementation Plan

Status: **proposal only**. No source files have been changed, no packages installed, no components created.

Target app: `AssignmentTracker/` (Expo project root — `package.json`, `App.tsx`, `src/`).

---

## 1. Existing architecture (verified by inspection)

### Stack and entry point

- **Expo SDK ~55**, React 19.2, React Native 0.83, TypeScript `strict: true` (`tsconfig.json` extends `expo/tsconfig.base`).
- `index.ts` → `App.tsx`:
  `SafeAreaProvider` → `NavigationContainer` → `AppNavigator` + `<StatusBar style="dark" />`.
- No theme provider, no context API usage, no i18n, no error boundary.

### Navigation (`src/navigation/AppNavigator.tsx`)

- Root **native stack** (`headerShown: false`): `Tabs`, `AddAssignment` (`{ assignmentId? }`), `CompletedAssignments`.
- **Tabs** (`@react-navigation/bottom-tabs`): `Home`, `Rewards` (gated behind `SHOW_REWARDS = false`), `Calendar`.
- Tab bar is a floating pill; `Calendar` currently hides it with a per-screen `tabBarStyle: { display: 'none' }` (existing pattern, not touched).
- Every screen draws its own header (Home uses a navy hero; Add/Completed use a simple row with a back arrow).
- **Important finding:** `HomeScreen.tsx:75-77` already does `navigation.navigate('Settings')`, but **no `Settings` route is registered**. Tapping the gear today produces an unhandled-action warning and nothing happens. The gear icon asset `assets/settings.png` already exists and is wired. So the Settings entry point is already built; the route is the missing piece.

### State and storage

- One Zustand store: `src/store/AssignmentsStore.ts` (`create<AssignmentsStore>`, no middleware).
- Persistence is **manual** per action: `AsyncStorage.setItem('@assignments', JSON.stringify(assignments))` inside `try/catch`, failures only `console.error`.
- `loadAssignments()` reads `@assignments`, `JSON.parse`, `Array.isArray` guard, per-item `hydrateAssignment()` validation (`id`, `title`, valid `deadline`/`createdAt`), invalid items dropped.
- Dates are stored as ISO strings and rehydrated to `Date`.
- `AUTO_PRUNE_COMPLETED = false` + `COMPLETED_LIMIT = 25`, `pruneCompletedAssignments()` exported for tests.
- There is **no settings/preferences store and no preferences key**. The only other non-persisted "user" data is `mockUser` in `src/data/mockData.ts` (`SHOW_REWARDS = false`, gamification inactive).

### UI conventions

- `src/utils/colors.ts` exports a **static** light palette (`background #f8f4ec`, `surface #FFFFFF`, `text`, `primary #6F9CEB`, `border`, `error`, type colors, `accentPink`).
- `StyleSheet.create` per file, `colors.*` referenced at module scope.
- Cards: `colors.surface`, radius 16–20, thin `colors.border`, subtle shadow (`elevation: 2`).
- Chips/pills: `AddAssignmentScreen` type selector (`typeList`, `typeOption`, `typeOptionSelected`).
- Destructive confirmation: `Alert.alert` with `style: 'destructive'` (`CompletedAssignmentsScreen.handleDelete`).
- Screen header for non-tab screens (`CompletedAssignmentsScreen`): back arrow left, centered title, `{ width: 30 }` spacer, `colors.surface` bar with bottom border.
- Screens compose SafeArea with `edges={['top']}` and a `ScrollView` with `contentContainerStyle` padding 20.

### Reusable pieces identified

| Piece | Where | Reuse for Settings |
| --- | --- | --- |
| Simple screen header (back arrow + title) | `CompletedAssignmentsScreen` | Copy the pattern into the Settings screen |
| Card/section styling | `AddAssignmentScreen`, `CompletedAssignmentsScreen` | Same `surface` + `border` + radius |
| Type chip selector | `AddAssignmentScreen:203-223` | Same visual language for "Default assignment type" |
| Completed list + Undo/Remove | `CompletedAssignmentsScreen` | Link to it instead of rebuilding management UI |
| `Alert` confirm + destructive style | `CompletedAssignmentsScreen` | All destructive settings actions |
| `pruneCompletedAssignments` | `AssignmentsStore` | No change; stays behind its flag |
| Gear icon + press handler | `HomeScreen` / `assets/settings.png` | Already works once the route exists |
| Colors, helpers (`formatDuration` etc.) | `src/utils` | Direct use, no new palette |

### Testing baseline (measured, not assumed)

- `npm test`: **4 suites, 25 tests → 23 pass, 2 fail**, and both failures are pre-existing in `HomeScreen.test.tsx`:
  1. `shows empty state when there are no assignments` — test expects `/no assignments yet/i`, screen renders "No assignments/tasks yet".
  2. `marks selected assignments as complete` — `getByText(/test assignment/i)` matches multiple nodes.
  These are **not caused by this plan**, and per project rules they must not be edited just to pass.
- `npx tsc --noEmit`: **5 pre-existing type errors** (duplicate `backgroundColor` in `AssignmentCalendar`, `'cnet'` in `DurationPicker`, duplicate `elevation` in `AddAssignmentScreen`, missing `completeButton`/`completeButtonDisabled` styles in `HomeScreen`). Goal for this work: introduce **no new** errors.
- Jest manual mocks: `__mocks__/@react-native-async-storage/async-storage.js` and `__mocks__/react-native-safe-area-context.js`. Note the AsyncStorage mock's `clear()` reassigns a `const` (would throw) and storage is not reset between tests — new tests should clean up with `removeItem('@settings')`, never `clear()`.

---

## 2. Proposed Settings page layout

```
┌────────────────────────────────────────┐
│  ←          Settings                   │   simple header (matches Completed)
├────────────────────────────────────────┤
│  STUDY PREFERENCES                     │   section caption (uppercase, light)
│  ┌──────────────────────────────────┐  │
│  │ Default assignment type          │  │
│  │ [Homework] [Test] [Task] [Other] │  │   chip row, selected = primary pill
│  │ Used when you create a new       │  │   helper text
│  │ assignment.                      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  COMPLETED ASSIGNMENTS                 │
│  ┌──────────────────────────────────┐  │
│  │ Review completed           12  › │  │   navigates to CompletedAssignments
│  ├──────────────────────────────────┤  │
│  │ Clear completed assignments      │  │   destructive, disabled at 0
│  └──────────────────────────────────┘  │
│                                        │
│  DATA                                  │
│  ┌──────────────────────────────────┐  │
│  │ Delete all assignments           │  │   destructive, confirmed
│  │ Removes pending and completed.   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ABOUT                                 │
│  ┌──────────────────────────────────┐  │
│  │ NoteQuest            v1.0.0      │  │   version row
│  │ About NoteQuest                  │  │   short paragraph
│  │ Credits                          │  │   short paragraph
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

- `SafeAreaView edges={['top']}`, `ScrollView` with `padding: 20`, `paddingBottom: 40`, no tab bar (it is a stack screen, like Add/Completed).
- Sections are local presentational helpers **inside `SettingsScreen.tsx`** (`SectionCard`, `SettingRow`) — no new shared component file, since nothing else uses them.
- No new icon set: text-only rows, the existing `assets/settings.png` stays on Home.

---

## 3. Proposed settings and behavior

### Scope decisions

| Requested idea | Decision | Why |
| --- | --- | --- |
| Default assignment type | **Include** | Cheap, high value, fits existing chip UI; only touches one initial-state line + one effect in `AddAssignmentScreen`. |
| Manage completed assignments | **Include** (link + clear) | `CompletedAssignmentsScreen` already has Undo/Remove; linking is zero duplicated UI. Bulk clear is the missing convenience. |
| Clear completed assignments | **Include** | Reuses existing data model; paired with a count so the user knows the impact. |
| Reset assignment data | **Include** | Needed escape hatch for a local-only prototype; safe once confirmed. |
| App version / About / Credits | **Include** | Static text, no risk, makes Settings feel finished. |
| Dark/light mode toggle | **Defer** | Not supported by the current architecture (details below). |
| Notifications | **Defer** | Requires a new native dependency and permission/native config; out of scope for a no-new-dependency prototype. |
| Auto-prune toggle / theme picker / account | **Not proposed** | `AUTO_PRUNE_COMPLETED` is a compile-time flag inside the store; exposing it would couple stores and add a second code path for little gain. Rewards/themes are explicitly inactive (`SHOW_REWARDS = false`). |

### Why dark mode is deferred (concrete, not vague)

`colors` is imported at module scope in 9 files (`AppNavigator`, 5 screens, 4 components) and baked into each `StyleSheet.create` at load time. `app.json` pins `"userInterfaceStyle": "light"`, and `App.tsx` hardcodes `<StatusBar style="dark" />`. A real toggle would require: a theme provider/hook, converting every `StyleSheet` to memoized/theme-aware styles (touching all existing screens), theming `react-native-calendars` (its theme object is a `const`), a StatusBar switch, `app.json` → `"automatic"`, plus a contrast audit of the hand-picked hex values (`#141B41`, `#f4d35e`, `rgba` overlays). That is a repaint of the whole app and a regression risk on every screen — not a Settings-page-sized change. **Recommendation:** ship Settings without it; revisit as a separate, dedicated theme task.

### Why notifications are deferred

No `expo-notifications` (or any notification package) is installed. Adding it means a new dependency, a config plugin, iOS/Android permission flows, and a rebuild — all disallowed/undesired here. A non-functional toggle would be misleading, so it is intentionally left out.

### Behavior detail

1. **Default assignment type** (`homework` | `test` | `task` | `other`)
   - Persists immediately on tap.
   - `AddAssignmentScreen` starts a **new** assignment on this type. Editing an existing assignment keeps that assignment's stored type, which always wins over the default.
   - If `other` is the default, the existing custom-type input still appears when the user picks `other`.
   - If settings fail to save: revert the selection to the persisted value and show `Alert.alert('Couldn’t save', ...)`. Never show a selection that was not stored.

2. **Review completed** row
   - Shows `assignments.filter(a => a.status === 'completed').length` and navigates to the existing `CompletedAssignments` stack screen on the root stack.
   - Disabled/guarded at 0? No — navigating to the empty state is harmless and already implemented.

3. **Clear completed assignments** row
   - Subtitle: "Permanently removes N completed assignment(s)."
   - Disabled when N = 0 (`opacity` + `disabled`, matching the app's existing disabled convention).
   - `Alert.alert('Clear completed assignments?', 'This permanently removes N completed assignment(s). Pending assignments stay.', [Cancel, { text: 'Clear', style: 'destructive' }])`.
   - On confirm → single store action, single AsyncStorage write.
   - On failure → state restored and `Alert.alert('Couldn’t clear', ...)`.

4. **Delete all assignments** row
   - Subtitle: "Removes all X assignments, including completed."
   - Destructive confirm: `Delete All`. Wording explicitly says pending + completed and that it can't be undone.
   - Does **not** reset the default-type preference. Why: "reset assignment data" should not silently change unrelated preferences; the user can change the chip separately.
   - On failure → state restored and an alert.

5. **App version**
   - `Constants.expoConfig?.version ?? '1.0.0'` from `expo-constants`.
   - `expo-constants@55.0.17` is already present in `node_modules` as a direct dependency of the `expo` package (verified), so **no install is needed** and `app.json` stays the single source of truth. If the team prefers an explicitly declared dependency, note it for the next dependency maintenance pass — not required for this change.

6. **About / Credits**
   - Static copy: what NoteQuest does (track assignments, deadlines, optional rewards) and credits (built with Expo, React Native, React Navigation, Zustand, AsyncStorage, `react-native-calendars`).
   - No links, no `Linking`, no external URLs — avoids new behavior and dead links.

---

## 4. Files to be created

| File | Purpose | Why necessary |
| --- | --- | --- |
| `src/store/SettingsStore.ts` | Preference state, load/save, validation, `@settings` persistence. | No preference store exists; settings must survive app restarts. Separate from `AssignmentsStore` so assignment reset/clear can never wipe preferences (and vice versa). |
| `src/screens/SettingsScreen.tsx` | The screen: header, sections, chips, rows, confirms, about. | The registered route needs a component; existing screens don't cover preferences. |
| `src/screens/__tests__/SettingsStore.test.tsx` | Unit tests for load/validation/save/failure. | Follows the existing pattern (`AssignmentsStore.test.tsx` lives under `src/screens/__tests__`); covers the failure cases the project standard calls for. |
| `src/screens/__tests__/SettingsScreen.test.tsx` | Render/interaction tests for the screen. | Verifies destructive actions are confirmed, defaults are applied, and no crash on bad settings. |
| `src/screens/__tests__/AddAssignmentDefaultType.test.tsx` | Verifies a new assignment starts on the configured default and edits keep their stored type. | The default-type wiring is the only place Settings changes behavior of an existing screen; it needs a regression guard. Separate file so existing test files/mocks are untouched. |

**No** new shared components, theme file, or navigation type module are needed.

---

## 5. Existing files to be modified

| File | Change | Why necessary |
| --- | --- | --- |
| `src/types/index.ts` | Add `export const ASSIGNMENT_TYPES = ['homework','test','task','other'] as const;` and an `AppSettings` interface. | One source of truth for valid types, used by the settings validator and the two chip lists. Prevents the settings store from accepting an arbitrary string, and avoids duplicate literals drifting. |
| `src/screens/AddAssignmentScreen.tsx` | Import `ASSIGNMENT_TYPES` instead of the local `TYPE_OPTIONS`; initialize `selectedType` from `defaultAssignmentType` for **new** assignments only, guarded so a late settings load cannot overwrite a user tap. | This is the entire payoff of the preference: new assignments start where the student works most. The touch-tracking guard prevents a visible "type jumps back" bug. |
| `src/store/AssignmentsStore.ts` | Add two actions: `clearCompletedAssignments()` and `resetAssignments()`. Both update state once, write once, revert on write failure and re-throw. | A reset cannot be expressed with existing actions without N sequential writes and N intermediate renders; bulk clear via `deleteAssignment` loop would be non-atomic. Reverting on failure satisfies the project rule "never swallow errors to look functional" instead of leaving the UI showing data that still exists in storage. |
| `src/screens/index.ts` | `export { SettingsScreen } from './SettingsScreen';` | Matches how every screen is exported; `AppNavigator` imports from this barrel. |
| `src/navigation/AppNavigator.tsx` | Register `<Stack.Screen name="Settings" component={SettingsScreen} />`. | Required for the route Home already navigates to; it is the only navigation change needed. |
| `SETTINGS_PLAN.md` | This document. | Planning deliverable. |

**Not modified:** `App.tsx` (screens own their data loading today; Settings will load its own store on mount), `HomeScreen.tsx` (its settings handler already exists and `navigate('Settings')` bubbles from the tab navigator to the parent stack), `CompletedAssignmentsScreen.tsx`, `CalendarScreen.tsx`, rewards code, `app.json`, `package.json`.

---

## 6. State management and persistence

### Store shape (`src/store/SettingsStore.ts`)

```ts
interface SettingsStore {
  settings: AppSettings;          // { defaultAssignmentType: AssignmentType }
  isLoaded: boolean;              // true once a load attempt finished
  loadError: boolean;             // true if stored data could not be read/parsed
  loadSettings: () => Promise<void>;                       // idempotent
  setDefaultAssignmentType: (type: AssignmentType) => Promise<boolean>;
  clearLoadError: () => void;
}
```

- `STORAGE_KEY = '@settings'`, payload `{"defaultAssignmentType":"homework"}`.
- Separate key from `@assignments` so assignment deletion/reset is orthogonal to preferences.
- Defaults: `{ defaultAssignmentType: 'homework' }` — matches today's hardcoded initial value, so behavior is unchanged for users who never open Settings.
- `loadSettings` is **idempotent** (`if (isLoaded) return`) so Settings and AddAssignment can both call it without extra I/O.

### Validation (why it exists)

Export a pure `parseStoredSettings(raw: unknown): AppSettings` (mirrors the testable `pruneCompletedAssignments` precedent):

- Missing key → defaults.
- Invalid JSON → caught, `loadError = true`, defaults.
- Non-object / array / null → defaults.
- `defaultAssignmentType` not in `ASSIGNMENT_TYPES` → fall back to default (never store an invalid type).
- Unknown extra keys ignored and never spread into state (prevents stale/poisoned payloads).
- `loadError` is shown as a small inline banner on Settings ("Couldn't load preferences — using defaults"), not an Alert on mount, because an alert during navigation is jarring and untestable-fragile. Nothing is swallowed: the user sees it.

### Save semantics (why write-then-set)

`setDefaultAssignmentType` writes to AsyncStorage **first**, then sets state; returns `false` on failure after `console.error`, and the screen shows an alert. This guarantees the highlighted chip always equals the persisted value — no revert logic, no state that looks saved but isn't.

### Bulk assignment actions

```ts
clearCompletedAssignments: async () => { /* filter, single set, single write, revert + throw on failure */ }
resetAssignments:          async () => { /* [], single set, write '[]', revert + throw on failure */ }
```

- One write, one render: avoids N writes and intermediate states with the existing per-item `deleteAssignment`.
- `[]` is written rather than `removeItem` so the storage contract stays "array under `@assignments`" and `loadAssignments` behaves identically.
- Home re-renders automatically after these actions because it subscribes to the Zustand store; no refresh hack needed.
- Settings reads counts from the same store, so the "N completed / X total" numbers update immediately after an action.

---

## 7. Navigation integration

1. Export `SettingsScreen` from `src/screens/index.ts` (pattern parity).
2. Register in `AppNavigator`'s root stack, after `CompletedAssignments`:
   ```tsx
   <Stack.Screen name="Settings" component={SettingsScreen} />
   ```
   Why: the root stack is where `CompletedAssignments` and `AddAssignment` live; Settings is a modal-ish detail screen, not a tab, so it should not appear in the pill tab bar and must not be added to `Tabs` (routes are explicitly not to be extended per project rules).
3. Entry point is already there: `HomeScreen` gear → `navigation.navigate('Settings')`. React Navigation bubbles an unhandled action from the tab navigator up to the parent stack, so no Home change is planned. **Verification step:** open Settings from Home on device; if a "not handled" warning still appears, switch Home's handler to the `getParent().navigate(...)` pattern already used for `AddAssignment`/`CompletedAssignments` — that is the only fallback and it is a 1-line change.
4. Back behavior: `navigation.goBack()` from the Settings header, plus native swipe-back / Android back.
5. Settings → "Review completed" uses a locally typed `useNavigation<NativeStackNavigationProp<{ CompletedAssignments: undefined }>>()` instead of `as any`. Why: complies with the project's no-`any` rule without introducing a global navigation type system that the rest of the app doesn't use yet.

---

## 8. Potential technical challenges

1. **Dark mode is architecturally unsupported** (static palette + `app.json` light + fixed StatusBar). Deferred deliberately; see §3.
2. **Settings load is async vs. AddAssignment's initial state.** Mitigation: idempotent `loadSettings`, apply the default only when `!assignmentId`, and track a `typeTouched` ref so a load resolving after a user tap cannot overwrite their choice.
3. **Default type on edit.** Editing must never apply the preference; the effect is gated on `!assignmentId`, and the existing edit effect sets the assignment's own type.
4. **Failure handling divergence.** Existing store actions only `console.error`; new actions revert + re-throw so the screen can alert. This is a deliberate, documented improvement for new code only — existing actions are left alone (targeted changes).
5. **Test environment leaks.** The AsyncStorage manual mock keeps one module-level object across tests and its `clear()` is broken (`const` reassignment). New tests must `removeItem('@settings')` / `removeItem('@assignments')` in `beforeEach`.
6. **Alert-based tests.** Confirm flows must be tested by mocking `Alert.alert` and invoking the destructive button's `onPress` from `mock.calls`, not by asserting text only.
7. **Pre-existing red baseline.** 2 failing HomeScreen tests and 5 TS errors already exist. They are out of scope; the acceptance bar is "no new failures, no new type errors", and no existing test may be edited to go green.
8. **`expo-constants` is transitive.** It is installed via `expo`, so importing it is zero-install today, but it is not listed in `package.json`. If the team wants strict dependency declarations, either add it explicitly later or replace the version row with a small `APP_VERSION` constant kept in sync with `app.json`. The fallback (`'1.0.0'`) keeps the screen working either way.
9. **Small-screen usability.** Type chips must wrap (`flexWrap: 'wrap'`), labels must not rely on `numberOfLines={1}`, and all tappable rows get ≥44pt height plus `hitSlop` on the back button.
10. **No design tokens for section captions.** New local styles (`sectionCaption`, `row`, `rowDivider`, `rowAction`, `destructiveText`, `helperText`) are defined in `SettingsScreen.tsx` using existing `colors`, rather than expanding `colors.ts` — avoids touching a file every screen imports.

---

## 9. Implementation steps (recommended order)

1. **Types first** — add `ASSIGNMENT_TYPES` and `AppSettings` to `src/types/index.ts`; switch `AddAssignmentScreen` to the shared constant (pure refactor, no behavior change). *Why first: everything downstream needs the type union and the validator's allow-list.*
2. **Settings store** — `src/store/SettingsStore.ts` with `parseStoredSettings`, `loadSettings`, `setDefaultAssignmentType`. *Why before UI: screen and AddAssignment both consume it, and it can be unit-tested in isolation.*
3. **Settings store tests** — empty storage, valid value, bad JSON, unknown type, save write + failure. *Why now: proves persistence/validation before UI exists.*
4. **Assignment bulk actions** — add `clearCompletedAssignments` / `resetAssignments` with revert-on-failure. *Why: the screen's data section depends on them; keeps the store change reviewable on its own.*
5. **Screen skeleton** — header + sections + About (no actions wired). *Why: establishes layout/visual consistency early so review can catch style drift before wiring.*
6. **Wire default type chip** — read/write settings, disabled/loading states, save-failure alert. *Why: isolates preference-writing behavior.*
7. **Wire data actions** — counts, disabled state at 0, confirmations, failure alerts, link to Completed. *Why: highest-risk behavior gets wired after the store is proven and the layout is stable.*
8. **Navigation registration** — `screens/index.ts` + `AppNavigator`. *Why last among code changes: the screen is complete when first reachable; avoids dead half-built routes.*
9. **AddAssignment default wiring** — initial type from settings + `typeTouched` guard. *Why after the store is stable; this is the only existing-screen behavior change.*
10. **Tests** — `SettingsScreen.test.tsx` + `AddAssignmentDefaultType.test.tsx`; run full suite and `tsc --noEmit`; compare against the recorded baseline. *Why final: catches integration regressions without weakening existing tests.*
11. **Manual QA** — iOS + Android: open from Home gear, toggle default, create assignment, kill/relaunch app (preference persists), clear completed (list updates, count → 0), reset data (Home empty state, relaunch stays empty), back/swipe gestures, font scaling, VoiceOver/TalkBack labels.

---

## 10. Testing plan

### Unit — `SettingsStore`

- Defaults when `@settings` is absent.
- Loads a valid persisted type (`test`) and sets `isLoaded`.
- Invalid JSON → defaults + `loadError: true`, no throw.
- Stored value is an array / null / number → defaults.
- Unknown type string (`'essay'`) → defaults.
- `setDefaultAssignmentType('task')` writes `@settings` with the correct JSON and updates state, returning `true`.
- `setItem` rejection → returns `false`, state unchanged (no fake success).
- `getItem` rejection → defaults + `loadError: true`.
- `loadSettings` called twice performs one read (idempotence).

### Component — `SettingsScreen`

- Renders all section titles, the default-type chips, the version, and both destructive rows.
- Displays the completed count; "Clear completed" is disabled when the count is 0.
- Tapping a type chip calls the setter with that type.
- Clear flow: `Alert.alert` is called with a destructive action; invoking it calls `clearCompletedAssignments` once.
- Cancel path: no store call.
- Reset flow: confirmation wording mentions pending + completed; confirm calls `resetAssignments`.
- Store action rejection → alert shown, no crash.
- "Review completed" navigates to `CompletedAssignments`.
- Load error banner appears when `loadError` is true.

### Integration — `AddAssignmentScreen`

- New assignment initializes with the persisted default type.
- Edit mode (`assignmentId` present) keeps the assignment's stored type even when a different default is set.
- Settings load failure still leaves `homework` selected (no crash, no invalid type).

### Regression

- `npm test` must keep **23/25 passing** and add all new tests as passing. The two pre-existing HomeScreen failures stay untouched and are reported as known.
- `npx tsc --noEmit` must not add errors beyond the 5 baseline ones.
- Manual: assignment create/edit/complete/undo/delete paths, Calendar dots, rewards flag off, tab bar behavior, pull-to-refresh on Home.

### Accessibility checks

- Chips expose selected state (`accessibilityState={{ selected: true }}`, `accessibilityRole="button"`) and readable labels.
- Back button has `accessibilityLabel="Go back"` + `hitSlop`.
- Destructive rows have labels/hints and are reachable by screen reader; native `Alert` handles focus.
- Text respects system font scaling (wrapping rows, no fixed-height labels).

---

## Assumptions and open questions (for approval)

1. Settings belongs in the **root stack** (no new tab), opened from the existing Home gear. Confirmed by the existing dead `navigate('Settings')` call.
2. Dark mode and notifications are **out of scope for v1** for the architectural reasons above. Say the word if you want a dedicated dark-mode plan instead — it should be its own task.
3. "Reset assignment data" deletes assignments only, **not** preferences.
4. No new packages: chips are `TouchableOpacity`, confirmations are `Alert`, version comes from the already-installed `expo-constants`.
