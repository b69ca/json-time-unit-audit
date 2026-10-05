# json-time-unit-audit

Find timestamp fields that silently mix epoch seconds, milliseconds, microseconds, or nanoseconds across a JSONL stream.

It reports field paths and unit counts, never the original timestamp values. Array indexes are normalized to `*`, so equivalent event shapes stay together.

## Run

```bash
npx --yes github:b69ca/json-time-unit-audit events.jsonl
cat events.jsonl | npx --yes github:b69ca/json-time-unit-audit - --fail
```

By default, likely timestamp field names are inspected. Use `--all` for every numeric field or repeat `--path /pointer` to select exact JSON Pointer paths.

## Options

```text
--path /pointer  inspect an exact normalized path (repeatable)
--all            inspect every numeric value
--json           emit machine-readable JSON
--fail           exit 1 when mixed or implausible units are found
```

Inputs are processed locally. Nothing is sent over the network.

## Why this exists

Schema validators usually confirm that a timestamp is numeric, not whether one producer emitted seconds while another emitted milliseconds. This utility focuses on that narrow operational failure.

## Requirements

Node.js 20 or newer. No runtime dependencies.

## License

MIT
