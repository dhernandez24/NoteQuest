---
name: test-validation
description: Review the assignment tracker's tests for meaningful coverage of important behavior and failure cases. Use when auditing tests, planning test additions, or checking whether changes preserve the project's testing requirements.
---

# Test Validation

Review the project's tests against its behavior and documented requirements. Identify meaningful coverage gaps without changing code or tests.

## Rules

- Treat this as a read-only review. Do not create, edit, or delete files.
- Do not change tests just to make them pass.
- Inspect the relevant implementation and existing tests before judging coverage.
- Prefer behavior-based evidence over searching for keywords. A matching test name or phrase alone does not prove a behavior is tested.
- Do not claim a case is missing if an existing test covers it under a different name or in a broader scenario.
- Distinguish confirmed gaps from uncertain coverage, and explain the evidence for each finding.
- Follow the project's existing test conventions. The app uses Jest and React Native Testing Library; check current test files before recommending a new test location.
- Keep recommendations focused on the requested change. Do not turn a test review into an unrelated refactor.

## Review Workflow

1. Read the applicable project guidance (`AGENTS.md` or `agents.md`) and relevant implementation files, such as the assignment store, screens, components, and date utilities.
2. Inspect existing tests, especially `AssignmentTracker/src/screens/__tests__` if that directory exists.
3. Identify which behaviors are relevant to the code being reviewed.
4. Compare the existing tests with those behaviors. Check whether tests exercise the behavior and assert an observable result.
5. Report uncovered or weakly covered scenarios, with file references where possible.
6. If useful, suggest a concise test case or assertion in prose. Do not implement it unless separately asked.

## Project-Specific Coverage Checklist

Consider these scenarios when relevant to the code under review:

### Assignment completion

- Completing an active assignment updates it as expected.
- Completing an already-completed assignment is safe and does not produce an unintended second transition or duplicate side effect.

### Loading persisted assignments

- Storage data that is not an array is handled safely.
- Malformed individual items are rejected or handled without crashing the app.
- Invalid or unparsable date values are detected and result in the documented fallback behavior.
- A storage read failure is surfaced according to the project's error-handling guidance.

### Saving persisted assignments

- A storage write failure is surfaced through the expected logging and user-facing alert behavior.
- Persisted dates use the expected ISO string representation, where applicable.


## Running Tests

If asked to verify the test suite, use the project's documented test command (`npm test`) from `AssignmentTracker`. Report whether it passed, failed, or could not run. Do not modify tests to resolve failures unless explicitly asked to make code changes.

## Report Format

Start with a brief assessment, then list findings by importance. For each finding, include:

- **Status**: Covered, gap, or uncertain.
- **Behavior**: What the test does or does not establish.
- **Evidence**: Relevant test and implementation file paths.
- **Recommendation**: The smallest useful test to add, if needed.

Do not report a checklist item as a failure merely because no test has an exact matching name. Explain what behavior is actually missing.
