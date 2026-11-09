export const DEFAULT_RASTER_COLORS = Object.freeze({ low: '#2563eb', lower: '#16a34a', upper: '#facc15', high: '#dc2626' });

export function paintRaster(preview, colors = DEFAULT_RASTER_COLORS) {
  const stops = ['low', 'lower', 'upper', 'high'].map((key) => {
    if (!/^#[0-9a-f]{6}$/i.test(colors[key])) throw new Error('Choose valid raster colors.');
    return [1, 3, 5].map((offset) => parseInt(colors[key].slice(offset, offset + 2), 16));
  });
  const rgba = new Uint8ClampedArray(preview.length * 4);
  for (let index = 0; index < preview.length; index++) {
    const value = preview[index];
    if (!Number.isFinite(value) || value < 0) continue;
    const t = Math.min(1, value);
    const position = t * (stops.length - 1);
    const segment = Math.min(stops.length - 2, Math.floor(position));
    const start = stops[segment];
    const end = stops[segment + 1];
    const mix = position - segment;
    for (let channel = 0; channel < 3; channel++) rgba[index * 4 + channel] = Math.round(start[channel] + (end[channel] - start[channel]) * mix);
    rgba[index * 4 + 3] = 255;
  }
  return rgba;
}
