const pointer = parts => `/${parts.map(x => String(x).replace(/~/g, '~0').replace(/\//g, '~1')).join('/')}`;
const candidateName = path => /(?:^|[/_.-])(time|timestamp|date|created|updated|deleted|expires|issued|occurred)(?:$|[/_.-]|at$)/i.test(path);
export function epochUnit(value) {
  if ((typeof value !== 'number' && typeof value !== 'string') || !/^-?\d+(?:\.\d+)?$/.test(String(value))) return null;
  const n = Math.abs(Number(value));
  if (!Number.isFinite(n)) return 'implausible';
  if (n >= 1e8 && n < 1e11) return 'seconds';
  if (n >= 1e11 && n < 1e14) return 'milliseconds';
  if (n >= 1e14 && n < 1e17) return 'microseconds';
  if (n >= 1e17 && n < 1e20) return 'nanoseconds';
  return 'implausible';
}
function visit(value, parts, out, all) {
  if (Array.isArray(value)) return value.forEach(item => visit(item, [...parts, '*'], out, all));
  if (value && typeof value === 'object') return Object.entries(value).forEach(([key, item]) => visit(item, [...parts, key], out, all));
  const path = pointer(parts);
  if (all || candidateName(path)) {
    const unit = epochUnit(value);
    if (unit) out.push({ path, unit });
  }
}
export function analyze(rows, { all = false, paths = [] } = {}) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('at least one JSON record is required');
  const wanted = new Set(paths), stats = new Map();
  for (const row of rows) {
    const found = [];
    visit(row, [], found, all);
    for (const item of found) {
      if (wanted.size && !wanted.has(item.path)) continue;
      const s = stats.get(item.path) || { path: item.path, observations: 0, units: {} };
      s.observations++;
      s.units[item.unit] = (s.units[item.unit] || 0) + 1;
      stats.set(item.path, s);
    }
  }
  const fields = [...stats.values()].map(s => {
    const realUnits = Object.keys(s.units).filter(x => x !== 'implausible');
    const classification = realUnits.length > 1 ? 'mixed-units' : s.units.implausible ? 'contains-implausible' : 'consistent';
    return { ...s, classification };
  }).sort((a, b) => a.path.localeCompare(b.path));
  return { recordCount: rows.length, fieldCount: fields.length, findingCount: fields.filter(x => x.classification !== 'consistent').length, fields };
}
