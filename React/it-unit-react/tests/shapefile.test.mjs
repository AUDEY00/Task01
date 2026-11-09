import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import shp from 'shpjs';
import { prepareShapefileData } from '../src/utils/shapefileData.js';
import { updateShapefileOverlay } from '../src/utils/mapboxShapefile.js';

const feature = (type, coordinates) => ({ type: 'Feature', properties: {}, geometry: { type, coordinates } });
const collection = (...features) => ({ type: 'FeatureCollection', features });

test('bundled amphibians default parses within preview limits', async () => {
  const buffer = await readFile(new URL('../public/shapefiles/amphibians-priority1.zip', import.meta.url));
  assert.ok(buffer.byteLength < 20 * 1024 * 1024);
  const result = prepareShapefileData(await shp(buffer));
  assert.equal(result.data.features.length, 4742);
  assert.ok(result.data.features.every((feature) => feature.geometry.type === 'Polygon' && Object.hasOwn(feature.properties, 'DN')));
  assert.ok(result.bounds[0][0] > 117 && result.bounds[1][0] < 121);
});

test('reads an actual zipped polygon with projection and attributes', async () => {
  const buffer = await readFile(new URL('./fixtures/palawan-test-polygon.zip', import.meta.url));
  const result = prepareShapefileData(await shp(buffer));
  assert.equal(result.data.features.length, 1);
  assert.equal(result.data.features[0].geometry.type, 'Polygon');
  assert.equal(result.data.features[0].properties.NAME, 'Synthetic test polygon');
  assert.ok(Math.abs(result.bounds[0][0] - 118.70) < 1e-8);
  assert.ok(Math.abs(result.bounds[1][1] - 9.86) < 1e-8);
  await assert.rejects(shp(new Uint8Array([1, 2, 3, 4])));
});

test('merges multiple datasets and computes longitude/latitude bounds', () => {
  const result = prepareShapefileData([
    collection(feature('Polygon', [[[118, 9], [119, 9], [119, 10], [118, 9]]])),
    collection(feature('MultiPoint', [[120, 11], [117, 8]]), feature('LineString', [[118, 9], [119, 10]])),
  ]);
  assert.equal(result.data.features.length, 3);
  assert.deepEqual(result.bounds, [[117, 8], [120, 11]]);
});

test('rejects empty, unsupported and invalid/unconverted coordinates', () => {
  for (const value of [collection(), {}, collection(feature('Point', [Infinity, 9])), collection(feature('Point', [500000, 1000000])), collection(feature('Point', [])), collection(feature('GeometryCollection', []))]) {
    assert.throws(() => prepareShapefileData(value));
  }
  assert.throws(() => prepareShapefileData(collection(feature('MultiPoint', Array(500001).fill([118, 9])))), /coordinate limit/);
});

test('skips null shapes but retains valid records', () => {
  const result = prepareShapefileData(collection({ type: 'Feature', geometry: null }, feature('Point', [118, 9])));
  assert.equal(result.data.features.length, 1);
});

test('overlay replacement and removal preserve unrelated map data', () => {
  const sources = new Map([['existing-source', {}]]);
  const layers = new Map([['existing-layer', {}]]);
  const map = {
    getSource: (id) => sources.get(id), getLayer: (id) => layers.get(id),
    addSource(id, source) { assert.ok(!sources.has(id)); sources.set(id, { ...source, setData(data) { this.data = data; } }); },
    addLayer(layer) { assert.ok(!layers.has(layer.id)); layers.set(layer.id, layer); },
    setPaintProperty(id, property, value) { layers.get(id).paint[property] = value; },
    setFilter(id, filter) { layers.get(id).filter = filter; },
    removeLayer(id) { layers.delete(id); },
    removeSource(id) { assert.ok(![...layers.values()].some((layer) => layer.source === id)); sources.delete(id); },
    fitBounds(bounds) { this.bounds = bounds; this.fitCount = (this.fitCount || 0) + 1; },
  };
  const first = prepareShapefileData(collection(feature('Point', [118, 9])));
  const next = prepareShapefileData(collection(feature('Point', [119, 10])));
  updateShapefileOverlay(map, first);
  assert.equal(layers.size, 4);
  updateShapefileOverlay(map, { ...first, style: { field: 'DN', categories: [{ key: 'number:1', color: '#123456' }] } });
  assert.equal(map.fitCount, 1, 'Color changes must not reset the map position');
  assert.equal(layers.get('uploaded-shapefile-fill').paint['fill-color'][3], '#123456');
  updateShapefileOverlay(map, { ...first, style: { field: 'DN', categories: [{ key: 'number:1', color: '#123456', visible: false }] } });
  for (const id of ['uploaded-shapefile-fill', 'uploaded-shapefile-line', 'uploaded-shapefile-point']) {
    assert.equal(layers.get(id).filter[2], false);
  }
  assert.equal(map.fitCount, 1, 'Visibility changes must not reset the map position');
  assert.equal(sources.get('uploaded-shapefile').data, first.data);   
  updateShapefileOverlay(map, first);
  assert.equal(layers.get('uploaded-shapefile-fill').filter[2], true);
  updateShapefileOverlay(map, next);
  assert.equal(sources.get('uploaded-shapefile').data, next.data);
  assert.deepEqual(map.bounds, next.bounds);
  updateShapefileOverlay(map, null);
  updateShapefileOverlay(map, null);
  assert.deepEqual([...sources.keys()], ['existing-source']);
  assert.deepEqual([...layers.keys()], ['existing-layer']);
});
