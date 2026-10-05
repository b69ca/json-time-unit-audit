#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { analyze } from './index.js';
const args = process.argv.slice(2), takes = new Set(['--path']), file = args.find((x, i) => !x.startsWith('--') && !takes.has(args[i - 1])) || '-';
const values = name => args.flatMap((x, i) => x === name ? [args[i + 1]] : []);
if (args.includes('--help')) { console.log('Usage: json-time-unit-audit [FILE|-] [--path /pointer]... [--all] [--json] [--fail]'); process.exit(0); }
try {
  const input = file === '-' ? process.stdin : createReadStream(file), rl = createInterface({ input, crlfDelay: Infinity }), rows = [];
  let lineNumber = 0;
  for await (const line of rl) { lineNumber++; if (!line.trim()) continue; try { rows.push(JSON.parse(line)); } catch (error) { throw new Error(`line ${lineNumber}: ${error.message}`); } }
  const report = analyze(rows, { all: args.includes('--all'), paths: values('--path') });
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else { console.log(`${report.recordCount} records, ${report.fieldCount} timestamp fields, ${report.findingCount} findings`); for (const f of report.fields) console.log(`${f.path}\t${f.classification}\t${Object.entries(f.units).map(([u, n]) => `${u}:${n}`).join(',')}`); }
  if (args.includes('--fail') && report.findingCount) process.exitCode = 1;
} catch (error) { console.error(`json-time-unit-audit: ${error.message}`); process.exitCode = 2; }
