# OpenIQ v0.13 — Administration and timing specification

**Status:** proposed engineering and study protocol; not yet implemented or psychometrically approved. Do not claim standardization until the frozen production build passes the checks below.

## Freeze before a pilot

Archive and hash the exact HTML, CSS, JS, question bank, scoring rules, instructions, and analysis code. Assign a release ID and fixed form ID. Do not mix exports from different versions or forms in one calibration analysis unless an explicit linking design exists.

## Standard instruction text (candidate)

“You will answer a series of practice tasks. Read each instruction before beginning. Select the answer you think is best. Unless a task says otherwise, you may change your answer before moving forward. Work independently and do not use a calculator, notes, search, or outside help. If a task is unclear or the session is interrupted, use the study contact procedure rather than guessing what to do. This prototype does not provide a validated IQ score.”

The final instructions must be adapted and approved for the actual language, population, task formats, accommodations, and study design. Never imply the same rule applies to tasks whose timing differs.

## Timing policy requirements

- Use a monotonic clock (`performance.now()` where supported) for elapsed intervals; use wall-clock timestamps only for audit metadata.
- Store separate fields for stimulus exposure, response latency, time after answer selection, navigation/transition time, pauses, and total session duration.
- Start response latency only when the complete answer UI is visible and enabled; stop on the first answer selection. Store subsequent answer changes separately.
- A back-navigation event must not silently add time from one question to another. Define whether a revisit is a new exposure and store attempt number per item.
- A countdown must derive remaining time from a deadline, not decrement a counter per timer callback. Browser throttling can delay callbacks.
- Choose and freeze a visibility policy: recommended research default is to pause and mark the item/session interrupted when the page becomes hidden, then require a documented resume path. If uninterrupted timing is the research target, terminate/flag hidden-tab intervals rather than pretending browser timing is exact.
- For timed stimulus tasks, freeze stimulus duration, transition interval, response window, and timeout scoring. Log actual observed durations and mark technical deviations.
- Do not call a speed score standardized while device, display, input, refresh/rendering, and accessibility conditions remain uncontrolled.

## Required timing regression tests

1. Timer starts only after consent and explicit Start.
2. Timer does not run on intro screen or between sessions.
3. Delayed/throttled callback still calculates remaining time from deadline.
4. Background tab / screen lock follows the declared pause-or-flag policy.
5. Double taps and rapid next/back do not create duplicate timers or negative durations.
6. Changing an answer does not reset first-response latency.
7. Stimulus is hidden at the configured deadline within an explicitly set engineering tolerance; actual exposure is logged.
8. Reload/close/return behavior is defined and consistent; incomplete sessions are marked incomplete.
9. Exported durations are finite, nonnegative, and internally reconcilable within documented transition overhead.
10. Repeat on supported Android browsers and desktop browsers; report OS/browser/device classes.

## Release gate

The current user report says “Navigation and timing: Fail” without enough detail to identify the defect. Do not claim the timer is fixed until the actual deployed code is inspected, the failure is reproduced, a correction is made, and the regression suite passes on the target devices. This package specifies the work but does not claim that fix has been made.
