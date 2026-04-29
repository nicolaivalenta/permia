# Permia Lightweight Design System

## Product Surface

Permia is a runtime control plane for agent tool calls. Product UI should feel operational, evidence-first, and compact. Do not turn workflows into decorative card grids. Put the primary artifact first, then supporting evidence and developer actions.

## Layout Rules

- Use a priority stack: outcome/status, primary artifact, evidence, actions.
- On wide screens, primary artifacts take the largest column; secondary panels sit beside them.
- On small screens, stack in that same priority order.
- Prefer bordered panels, rows, lists, timelines, tables, and command surfaces over marketing-style cards.
- Keep radii at `8px` or lower; the current product default is square or near-square.

## Color And Type

- Base background: `#040406`.
- Primary panel: `#080a0d`.
- Secondary panel: `#0d1117`.
- Text: `#f7f8fb`; muted text: `#9da8b8`.
- Accent: `#7fb0ff`.
- Semantic states must include text labels, not color alone.
- Use DM Sans for product text and JetBrains Mono for identifiers, command snippets, and compact labels.

## Interaction

- Buttons and link-controls should be at least `44px` tall where they act as controls.
- Every interactive element needs a visible label and focus style.
- If a client component is needed for reveal/playback, provide skip controls and respect reduced motion.
- Server-owned pages should render useful empty, loading, error, success, and partial states whenever the data model allows it.

## Replay UI

- The timeline is the primary artifact.
- Evidence panels explain why a gate was returned.
- Developer actions expose the JSON replay, playground path, and fixture command.
- Replay outcomes are status-first: success means expected and actual gates matched; partial means the replay completed but diverged from the expected gate.
