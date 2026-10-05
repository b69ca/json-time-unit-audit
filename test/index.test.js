import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, epochUnit } from '../src/index.js';
test('classifies common epoch units', () => { assert.equal(epochUnit(1_700_000_000), 'seconds'); assert.equal(epochUnit(1_700_000_000_000), 'milliseconds'); assert.equal(epochUnit('1700000000000000'), 'microseconds'); });
test('finds mixed units at the same path', () => { const r = analyze([{ createdAt: 1_700_000_000 }, { createdAt: 1_700_000_000_000 }]); assert.equal(r.fields[0].classification, 'mixed-units'); });
test('normalizes array indexes', () => { const r = analyze([{ events: [{ timestamp: 1_700_000_000 }] }, { events: [{ timestamp: 1_700_000_001 }] }]); assert.equal(r.fields[0].path, '/events/*/timestamp'); });
test('ignores unrelated numbers unless all is set', () => { assert.equal(analyze([{ count: 1_700_000_000 }]).fieldCount, 0); assert.equal(analyze([{ count: 1_700_000_000 }], { all: true }).fieldCount, 1); });
