import { useEffect, useRef, useState } from 'react';
import { DEFAULT_RASTER_COLORS } from '../../utils/rasterColors.js';

function rasterImage(rgba, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Your browser could not create the raster preview.');
  context.putImageData(new ImageData(rgba, width, height), 0, 0);
  return canvas.toDataURL('image/png');
}

export default function RasterUpload({ raster, onChange, mapProvider }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [colors, setColors] = useState(DEFAULT_RASTER_COLORS);
  const [colorBusy, setColorBusy] = useState(false);
  const working = busy || colorBusy;
  const active = useRef(null);
  useEffect(() => () => active.current?.(), []);

  async function load(file) {
    if (working) return;
    setError('');
    if (file && (!/\.tiff?$/i.test(file.name) || !file.size || file.size > 20 * 1024 * 1024)) {
      setError('Choose a nonempty .tif or .tiff file of 20 MB or less.');
      return;
    }
    setBusy(true);
    let cancelled = false;
    let worker;
    const controller = new AbortController();
    const cleanup = () => { cancelled = true; worker?.terminate(); controller.abort(); clearTimeout(timer); };
    const finish = () => { cleanup(); active.current = null; setBusy(false); };
    const timer = setTimeout(() => { setError('Raster reading timed out. Try a smaller file.'); finish(); }, 60000);
    active.current = cleanup;
    try {
      let buffer;
      if (file) buffer = await file.arrayBuffer();
      else {
        const response = await fetch(`${import.meta.env.BASE_URL}rasters/Agathis_sp_GEE.tif`, { signal: controller.signal });
        if (!response.ok) throw new Error('The bundled raster could not be downloaded.');
        buffer = await response.arrayBuffer();
      }
      if (cancelled) return;
      worker = new Worker(new URL('../../utils/raster.worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => {
        if (cancelled) return;
        if (data.error) { setError(data.error); finish(); return; }
        try {
          const { rgba, ...metadata } = data.result;
          const url = rasterImage(rgba, metadata.width, metadata.height);
          onChange({ ...metadata, url, colors: DEFAULT_RASTER_COLORS, name: file?.name || 'Agathis_sp_GEE.tif', opacity: 0.8, visible: true });
          setColors(DEFAULT_RASTER_COLORS);
        } catch (failure) { setError(failure.message); }
        finish();
      };
      worker.onerror = () => { if (!cancelled) { setError('Unable to decode this GeoTIFF.'); finish(); } };
      worker.postMessage(buffer, [buffer]);
    } catch (failure) {
      if (!cancelled) { setError(failure.message || 'The raster could not be loaded.'); finish(); }
    }
  }

  function applyColors(nextColors) {
    if (working || !raster) return;
    setError('');
    setColorBusy(true);
    let worker;
    let cancelled = false;
    const cleanup = () => { cancelled = true; worker?.terminate(); clearTimeout(timer); };
    const finish = () => { cleanup(); active.current = null; setColorBusy(false); };
    const timer = setTimeout(() => { setError('Updating colors timed out. Please try again.'); finish(); }, 30000);
    active.current = cleanup;
    try {
      worker = new Worker(new URL('../../utils/rasterColors.worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => {
        if (cancelled) return;
        try {
          if (data.error) throw new Error(data.error);
          const url = rasterImage(data.rgba, raster.width, raster.height);
          onChange({ ...raster, url, colors: nextColors });
          setColors(nextColors);
        } catch (failure) { setError(failure.message); }
        finish();
      };
      worker.onerror = () => { if (!cancelled) { setError('Unable to update raster colors.'); finish(); } };
      // Copy only the small preview; keep the original cached for future changes.
      worker.postMessage({ preview: raster.preview, colors: nextColors });
    } catch (failure) { setError(failure.message); finish(); }
  }

  const appliedColors = raster?.colors || DEFAULT_RASTER_COLORS;
  const colorsChanged = Object.keys(DEFAULT_RASTER_COLORS).some((key) => colors[key] !== appliedColors[key]);

  return (
    <section className="raster-controls" aria-label="Raster layers" aria-busy={working}>
      <h3>GeoTIFF raster</h3>
      <p>Display a numeric raster alongside your vector layer. The first band is shown with a value-based color scale; empty pixels are transparent.</p>
      <div className="shape-upload-header">
        <label className={`shape-upload-button ${working || mapProvider !== 'mapbox' ? 'is-disabled' : ''}`}>
          {busy ? 'Reading raster…' : raster ? 'Replace TIFF' : 'Upload TIFF'}
          <input type="file" accept=".tif,.tiff" aria-label="Upload GeoTIFF raster" disabled={working || mapProvider !== 'mapbox'} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; if (file) load(file); }} />
        </label>
        <button type="button" className="tool-btn" disabled={working || mapProvider !== 'mapbox'} onClick={() => load(null)}>Load Agathis sample</button>
        {raster && <button type="button" className="tool-btn" disabled={working} onClick={() => { onChange(null); setError(''); }}>Remove raster</button>}
      </div>
      <p>North-up EPSG:4326 / EPSG:3857 GeoTIFFs, up to 20 MB and 8 million source pixels. Other coordinate systems need reprojection first. Preview resolution is limited to 1,024 pixels per side.</p>
      {mapProvider !== 'mapbox' && <p>Select Mapbox to load or view the raster. Your existing raster is retained while using Leaflet.</p>}
      <div role="status" className="shape-upload-status">{colorBusy ? 'Applying raster colors…' : busy ? 'Decoding and positioning raster…' : raster ? raster.name : 'No raster loaded. Upload a TIFF or load the sample.'}</div>
      {error && <p role="alert" className="shapefile-error">{error}</p>}
      {raster && <>
        <div className="raster-options">
          <label><input type="checkbox" disabled={working} checked={raster.visible} onChange={(event) => onChange({ ...raster, visible: event.target.checked })} /> Show raster</label>
          <label htmlFor="raster-opacity">Opacity: {Math.round(raster.opacity * 100)}%</label>
          <input id="raster-opacity" type="range" disabled={working} min="0" max="1" step="0.05" value={raster.opacity} onChange={(event) => onChange({ ...raster, opacity: Number(event.target.value) })} />
        </div>
        <fieldset className="raster-color-settings" disabled={working}>
          <legend>Raster colors</legend>
          <div className="raster-color-pickers">
            {[['low', 'Low'], ['lower', 'Lower middle'], ['upper', 'Upper middle'], ['high', 'High']].map(([key, label]) => (
              <label key={key}><input type="color" aria-label={`${label} raster color`} value={colors[key]} onChange={(event) => setColors({ ...colors, [key]: event.target.value })} />{label}</label>
            ))}
          </div>
          <div className="shape-upload-header">
            <button type="button" className="tool-btn" disabled={!colorsChanged} onClick={() => applyColors(colors)}>Apply colors</button>
            <button type="button" className="tool-btn" onClick={() => applyColors(DEFAULT_RASTER_COLORS)}>Reset colors</button>
          </div>
          <p>{colorsChanged ? 'Color changes are pending. Select Apply colors to update the map.' : 'Default: blue → green → yellow → red, from low to high values. Colors are evenly spaced across the value range.'}</p>
        </fieldset>
        <div className="raster-legend" aria-label="Applied raster color scale"><div style={{ background: `linear-gradient(90deg, ${appliedColors.low}, ${appliedColors.lower}, ${appliedColors.upper}, ${appliedColors.high})` }} /><span>Low: {raster.min.toPrecision(5)}</span><span>High: {raster.max.toPrecision(5)}</span></div>
        <p>The range comes from preview pixels. Colors change the display only; higher values indicate higher priority only if your dataset defines them that way.</p>
        <dl className="raster-metadata">
          <dt>Source size</dt><dd>{raster.originalWidth} × {raster.originalHeight} pixels</dd>
          <dt>Preview size</dt><dd>{raster.width} × {raster.height} pixels</dd>
          <dt>Coordinate system</dt><dd>EPSG:{raster.crs}</dd>
          <dt>Band shown</dt><dd>1 of {raster.bands}</dd>
          <dt>NoData</dt><dd>{raster.noData === null ? 'Not specified' : String(raster.noData)}</dd>
        </dl>
        <p>The raster is drawn below the vector overlay. Hide vector DN groups if they obscure it. Uploaded rasters are temporary; the bundled sample remains available on your next visit.</p>
      </>}
    </section>
  );
}
