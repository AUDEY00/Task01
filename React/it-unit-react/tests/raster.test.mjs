import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { rasterBounds, colorizeRaster, readRaster } from '../src/utils/rasterData.js';
import { updateRasterOverlay } from '../src/utils/mapboxRaster.js';
import { paintRaster, DEFAULT_RASTER_COLORS } from '../src/utils/rasterColors.js';

test('actual Agathis GeoTIFF has positioned, transparent numeric pixels', async () => {
  const file = await readFile(new URL('../public/rasters/Agathis_sp_GEE.tif', import.meta.url));
  const result = await readRaster(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
  assert.equal(result.width, 529);
  assert.equal(result.height, 620);
  assert.equal(result.bands, 1);
  assert.equal(result.crs, 4326);
  assert.equal(result.noData, -9999);
  assert.equal(result.validPixels, 13469);
  assert.ok(result.min >= 0 && result.max < 1);
  assert.ok(Math.abs(result.bounds[0][0] - 116.92486) < 0.00001);
  assert.ok(Math.abs(result.bounds[1][1] - 12.67486) < 0.00001);
  const alpha = result.rgba.filter((_, index) => index % 4 === 3);
  assert.ok(alpha.includes(0) && alpha.includes(255));
});

test('NoData and nonfinite pixels stay transparent, constant values remain visible', () => {
  const result = colorizeRaster([5, -9999, NaN, 5], 2, 2, -9999, 3857, [[0, 0], [1, 1]]);
  assert.deepEqual(Array.from(result.rgba), [136, 184, 48, 255, 0, 0, 0, 0, 0, 0, 0, 0, 136, 184, 48, 255]);
  assert.equal(result.min, 5);
  assert.equal(result.max, 5);
  assert.throws(() => colorizeRaster([-9999], 1, 1, -9999, 4326, [[0, 0], [1, 1]]), /no valid/);
});

test('default and custom palettes preserve cached values and transparent pixels', () => {
  const preview = new Float32Array([0, 0.25, 0.5, 0.75, 1, -1, NaN]);
  const original = preview.slice();
  const defaults = paintRaster(preview);
  assert.deepEqual(Array.from(defaults.slice(0, 4)), [37, 99, 235, 255]);
  assert.deepEqual(Array.from(defaults.slice(8, 12)), [136, 184, 48, 255]);
  assert.deepEqual(Array.from(defaults.slice(16, 20)), [220, 38, 38, 255]);
  assert.deepEqual(Array.from(paintRaster([1 / 3, 2 / 3])), [22, 163, 74, 255, 250, 204, 21, 255]);
  const custom = paintRaster(preview, { low: '#000000', lower: '#555555', upper: '#aaaaaa', high: '#ffffff' });
  assert.deepEqual(Array.from(custom.slice(4, 8)), [64, 64, 64, 255]);
  assert.deepEqual(Array.from(custom.slice(12, 16)), [191, 191, 191, 255]);
  assert.deepEqual(Array.from(custom.slice(20)), [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(preview, original);
  assert.deepEqual(paintRaster(preview, DEFAULT_RASTER_COLORS), defaults);
  assert.throws(() => paintRaster(preview, { low: 'invalid' }), /valid raster colors/);
});

const fakeImage = (keys = { GeographicTypeGeoKey: 4326 }, bounds = [118, 9, 119, 10], directory = {}) => ({
  getGeoKeys: () => keys, getBoundingBox: () => bounds,
  getFileDirectory: () => directory, getResolution: () => [1, -1],
});

test('georeferencing converts Web Mercator and rejects unsupported placement', () => {
  assert.deepEqual(rasterBounds(fakeImage()).coordinates, [[118, 10], [119, 10], [119, 9], [118, 9]]);
  const mercator = rasterBounds(fakeImage({ ProjectedCSTypeGeoKey: 3857 }, [0, 0, 111319.490793, 111325.142866]));
  assert.ok(Math.abs(mercator.bounds[1][0] - 1) < 1e-8);
  assert.ok(Math.abs(mercator.bounds[1][1] - 1) < 1e-8);
  assert.throws(() => rasterBounds(fakeImage({ ProjectedCSTypeGeoKey: 32651 })), /Reproject/);
  assert.throws(() => rasterBounds(fakeImage({}, [0, 0, 1, 1])), /coordinate systems/);
  assert.throws(() => rasterBounds(fakeImage(undefined, [118, 9, 119, 90])), /bounds/);
  assert.throws(() => rasterBounds(fakeImage(undefined, undefined, { ModelTransformation: [1] })), /north-up/);
  assert.throws(() => rasterBounds(fakeImage({ GeographicTypeGeoKey: 4326, GTRasterTypeGeoKey: 2 })), /pixel-area/);
});

test('invalid and oversized TIFF inputs fail', async () => {
  await assert.rejects(readRaster(new ArrayBuffer(0)), /20 MB/);
  await assert.rejects(readRaster(new ArrayBuffer(21 * 1024 * 1024)), /20 MB/);
  await assert.rejects(readRaster(new Uint8Array([1, 2, 3, 4]).buffer));
});

test('raster controls preserve vectors and avoid refitting; replacement updates georeferencing', () => {
  const sources = new Map([['vector', {}]]);
  const layers = new Map([['vector', {}]]);
  let fits = 0, updates = 0;
  const map = {
    getSource: (id) => sources.get(id), getLayer: (id) => layers.get(id),
    addSource: (id, source) => sources.set(id, { ...source, updateImage: () => updates++ }),
    addLayer: (layer) => layers.set(layer.id, layer),
    removeSource: (id) => sources.delete(id), removeLayer: (id) => layers.delete(id),
    setPaintProperty: (id, key, value) => { layers.get(id)[key] = value; },
    setLayoutProperty: (id, key, value) => { layers.get(id)[key] = value; },
    fitBounds: () => fits++,
  };
  const raster = { url: 'same-pixels', coordinates: [[0, 1], [1, 1], [1, 0], [0, 0]], bounds: [[0, 0], [1, 1]] };
  updateRasterOverlay(map, raster);
  updateRasterOverlay(map, { ...raster, opacity: 0.3, visible: false });
  assert.equal(fits, 1);
  assert.equal(updates, 0);
  assert.equal(layers.get('gis-raster-layer').visibility, 'none');
  assert.equal(layers.get('gis-raster-layer')['raster-opacity'], 0.3);
  updateRasterOverlay(map, { ...raster, coordinates: [[2, 1], [3, 1], [3, 0], [2, 0]], bounds: [[2, 0], [3, 1]] });
  assert.equal(updates, 1);
  assert.equal(fits, 2);
  const preview = new Float32Array([0, 1]);
  updateRasterOverlay(map, { ...raster, preview });
  const fitsBeforeColors = fits;
  const updatesBeforeColors = updates;
  updateRasterOverlay(map, { ...raster, preview, url: 'recolored-pixels' });
  assert.equal(fits, fitsBeforeColors);
  assert.equal(updates, updatesBeforeColors + 1);
  assert.ok(sources.has('vector') && layers.has('vector'));
  updateRasterOverlay(map, null);
  assert.deepEqual([...sources.keys()], ['vector']);
  assert.deepEqual([...layers.keys()], ['vector']);
});
