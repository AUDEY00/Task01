import { useEffect, useRef, useState } from 'react';
import { Layers, Upload, X, Palette, Table2, Image } from 'lucide-react';
import ShapefileAttributes from './ShapefileAttributes';
import RasterUpload from './RasterUpload';
import '../../styles/shapefile-upload.css';

const DEFAULT_FILE = 'amphibians-priority1.zip';

export default function ShapefileUpload({ overlay, onChange, mapProvider, raster, onRasterChange }) {
  const [busy, setBusy] = useState(true);
  const [defaultRequest, setDefaultRequest] = useState(0);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('layers');
  const dialogRef = useRef(null);
  const active = useRef(null);
  const uploadId = useRef(0);
  useEffect(() => () => active.current?.(), []);

  // Load the bundled dataset on each page visit. Cleanup also handles React
  // Strict Mode's development remount and navigation during a pending load.
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let worker;
    const cleanup = () => {
      cancelled = true;
      controller.abort();
      worker?.terminate();
      clearTimeout(timer);
    };
    const fail = (message) => {
      if (cancelled) return;
      cleanup();
      setError(message);
      setBusy(false);
    };
    const timer = setTimeout(() => fail('Loading the default shapefile timed out. Use Load default to retry.'), 30000);

    async function loadDefault() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}shapefiles/${DEFAULT_FILE}`, { signal: controller.signal });
        if (!response.ok) throw new Error('The default shapefile could not be downloaded.');
        const buffer = await response.arrayBuffer();
        if (cancelled) return;
        worker = new Worker(new URL('../../utils/shapefile.worker.js', import.meta.url), { type: 'module' });
        worker.onmessage = ({ data }) => {
          if (cancelled) return;
          if (data.error) { fail(data.error); return; }
          onChange({ ...data.result, name: DEFAULT_FILE, uploadId: ++uploadId.current });
          cleanup();
          setBusy(false);
        };
        worker.onerror = () => fail('The default shapefile could not be read. Use Load default to retry.');
        worker.postMessage(buffer, [buffer]);
      } catch (error) {
        fail(error.message || 'The default shapefile could not be loaded.');
      }
    }
    loadDefault();
    return cleanup;
  }, [onChange, defaultRequest]);

  function reloadDefault() {
    setError('');
    setBusy(true);
    setDefaultRequest((request) => request + 1);
  }

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    if (!/\.zip$/i.test(file.name) || file.size > 20 * 1024 * 1024 || !file.size) {
      setError('Choose a nonempty shapefile ZIP of 20 MB or less.');
      return;
    }
    setBusy(true);
    let cancelled = false;
    let worker;
    let timer;
    const cleanup = () => {
      cancelled = true;
      worker?.terminate();
      clearTimeout(timer);
    };
    active.current = cleanup;
    const finish = () => { cleanup(); active.current = null; setBusy(false); };
    try {
      const buffer = await file.arrayBuffer();
      if (cancelled) return;
      worker = new Worker(new URL('../../utils/shapefile.worker.js', import.meta.url), { type: 'module' });
      worker.onmessage = ({ data }) => {
        if (data.error) setError(data.error);
        else onChange({ ...data.result, name: file.name, uploadId: ++uploadId.current });
        finish();
      };
      worker.onerror = () => { setError('Unable to read this ZIP. Check that it contains a valid shapefile dataset.'); finish(); };
      timer = setTimeout(() => { setError('Reading timed out. Try a smaller dataset.'); finish(); }, 30000);
      worker.postMessage(buffer, [buffer]);
    } catch {
      if (!cancelled) { setError('The selected file could not be read.'); finish(); }
    }
  }

  return (
    <>
      <button type="button" className="tool-btn shape-explorer-trigger" aria-label="Open GIS explorer" aria-haspopup="dialog" title={error ? 'Shapefile error — open explorer' : busy ? 'Loading shapefile — open explorer' : 'GIS explorer'} onClick={() => dialogRef.current?.showModal()}>
        <Layers size={19} aria-hidden="true" />
        <span className={`shape-trigger-dot ${error ? 'has-error' : busy ? 'is-loading' : ''}`} aria-hidden="true" />
      </button>
      <dialog ref={dialogRef} className="shapefile-upload shape-dialog" aria-labelledby="shape-dialog-title">
      <div className="shape-dialog-heading">
        <div><h2 id="shape-dialog-title">GIS explorer</h2><p>Manage vector layers, raster imagery, and attribute data.</p></div>
        <button type="button" className="tool-btn" aria-label="Close GIS explorer" onClick={() => dialogRef.current?.close()}><X size={19} aria-hidden="true" /></button>
      </div>
      <div className="shape-tabs" role="tablist" aria-label="Explorer sections">
        {[['layers', 'Vector', Palette], ['table', 'Attributes', Table2], ['raster', 'Raster', Image]].map(([id, label, Icon]) => (
          <button key={id} type="button" role="tab" id={`shape-tab-${id}`} aria-controls={`shape-panel-${id}`} aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
              event.preventDefault();
              const tabs = ['layers', 'table', 'raster'];
              const next = event.key === 'Home' ? 'layers' : event.key === 'End' ? 'raster' : tabs[(tabs.indexOf(id) + (event.key === 'ArrowRight' ? 1 : 2)) % 3];
              setTab(next);
              dialogRef.current?.querySelector(`#shape-tab-${next}`)?.focus();
            }
          }}><Icon size={16} aria-hidden="true" />{label}</button>
        ))}
      </div>
      <div className="shape-dialog-body" aria-busy={busy} role="tabpanel" id={`shape-panel-${tab}`} aria-labelledby={`shape-tab-${tab}`}>
      <div hidden={tab !== 'layers'}>
      <div className="shape-upload-header">
        <label className={`shape-upload-button ${busy || mapProvider !== 'mapbox' ? 'is-disabled' : ''}`}><Upload size={16} aria-hidden="true" />{busy ? 'Reading…' : overlay ? 'Replace ZIP' : 'Upload ZIP'}<input id="shapefile-upload" type="file" accept=".zip" onChange={upload} disabled={busy || mapProvider !== 'mapbox'} aria-describedby="shapefile-help" /></label>
        {overlay && <button type="button" className="tool-btn" disabled={busy} onClick={() => { onChange(null); setError(''); }}>Remove overlay</button>}
        <button type="button" className="tool-btn" disabled={busy} onClick={reloadDefault}>Load default</button>
      </div>
      <p id="shapefile-help">ZIP up to 20 MB · Include matching .shp, .shx, .dbf and .prj files. Without .prj, coordinates must already be WGS84 longitude/latitude.</p>
      <p>Amphibians priority loads automatically on each visit. Replacements, colors, and visibility changes last for this page visit only.</p>
      </div>
      <div className="shape-upload-status" role="status" hidden={tab === 'raster'}>
        {busy ? 'Reading shapefile…' : overlay ? `${overlay.name} · ${overlay.data.features.length.toLocaleString()} features loaded` : 'No shapefile loaded. Add a ZIP to get started.'}
        {mapProvider !== 'mapbox' && ' Select Mapbox to upload or view the overlay.'}
      </div>
      {error && <p className="shapefile-error" role="alert" hidden={tab === 'raster'}>{error}</p>}
      <div hidden={tab !== 'table'}>
        {!overlay && <p>Load a shapefile in the Vector tab to see its attributes.</p>}
      </div>
      {overlay && <ShapefileAttributes key={overlay.uploadId ?? overlay.name} overlay={overlay} onChange={onChange} activeTab={tab} />}
      <div hidden={tab !== 'raster'}><RasterUpload raster={raster} onChange={onRasterChange} mapProvider={mapProvider} /></div>
      </div>
      </dialog>
    </>
  );
}
