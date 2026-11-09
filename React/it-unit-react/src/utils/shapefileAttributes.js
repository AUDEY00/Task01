export const DEFAULT_COLOR = '#7c3aed';
const PALETTE = ['#7c3aed', '#0d9488', '#e87924', '#2563eb', '#db2777', '#65a30d', '#0891b2', '#b45309'];

export function displayAttribute(value) {
  if (value == null) return '(No value)';
  if (value === '') return '(Empty text)';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

export function attributeKey(value) {
  return value == null ? 'null:' : `${typeof value}:${typeof value === 'object' ? JSON.stringify(value) : String(value)}`;
}

export function attributeFields(data) {
  return [...new Set(data.features.flatMap((feature) => Object.keys(feature.properties || {})))].sort();
}

export function attributeCategories(data, field, mode = 'individual') {
  if (mode === 'ranges10') return rangeCategories(data, field);
  const values = new Map();
  for (const feature of data.features) {
    const value = feature.properties?.[field];
    const key = attributeKey(value);
    if (!values.has(key)) values.set(key, { key, label: displayAttribute(value), type: value == null ? 'missing' : typeof value, count: 0, color: PALETTE[values.size % PALETTE.length] });
    values.get(key).count++;
  }
  return [...values.values()];
}

function rangeCategories(data, field) {
  const groups = new Map();
  let integersOnly = true;
  for (const feature of data.features) {
    const value = feature.properties?.[field];
    const numeric = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    const valid = Number.isFinite(numeric);
    if (valid && !Number.isInteger(numeric)) integersOnly = false;
    const start = valid ? Math.floor(numeric / 10) * 10 : null;
    const key = valid ? `range:${start}` : 'range:missing';
    if (!groups.has(key)) groups.set(key, { key, start, count: 0, keys: new Set() });
    const group = groups.get(key);
    group.count++;
    group.keys.add(attributeKey(value));
  }
  return [...groups.values()].sort((a, b) => a.start === null ? 1 : b.start === null ? -1 : a.start - b.start).map((group, index) => ({
    key: group.key,
    keys: [...group.keys],
    label: group.start === null ? '(Missing or non-numeric)' : integersOnly ? `${group.start}–${group.start + 9}` : `${group.start} ≤ value < ${group.start + 10}`,
    type: group.start === null ? 'missing / non-numeric' : 'range of 10',
    count: group.count,
    color: group.start === null ? '#64748b' : PALETTE[index % PALETTE.length],
  }));
}

export function categoryColorExpression(style) {
  if (!style?.field || !style.categories?.length) return DEFAULT_COLOR;
  const get = ['get', style.field];
  return ['match', ['concat', ['typeof', get], ':', ['to-string', get]],
    ...style.categories.flatMap(({ key, keys, color }) => [keys || key, /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_COLOR]), DEFAULT_COLOR];
}

export function categoryVisibilityExpression(style) {
  const hidden = style?.categories?.filter((category) => category.visible === false) || [];
  if (!style?.field || !hidden.length) return true;
  if (hidden.length === style.categories.length) return false;
  const get = ['get', style.field];
  return ['match', ['concat', ['typeof', get], ':', ['to-string', get]],
    hidden.flatMap(({ key, keys }) => keys || [key]), false, true];
}
