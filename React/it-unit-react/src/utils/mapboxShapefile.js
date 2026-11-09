import { categoryColorExpression, categoryVisibilityExpression } from './shapefileAttributes.js';

const SOURCE = 'uploaded-shapefile';
const LAYERS = ['uploaded-shapefile-fill', 'uploaded-shapefile-line', 'uploaded-shapefile-point'];
const displayedData = new WeakMap();

export function updateShapefileOverlay(map, overlay) {
  if (!overlay) {
    for (const id of LAYERS) if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(SOURCE)) map.removeSource(SOURCE);
    displayedData.delete(map);
    return;
  }
  const dataChanged = displayedData.get(map) !== overlay.data || !map.getSource(SOURCE);
  if (map.getSource(SOURCE)) {
    if (dataChanged) map.getSource(SOURCE).setData(overlay.data);
  }
  else {
    map.addSource(SOURCE, { type: 'geojson', data: overlay.data });
    map.addLayer({ id: LAYERS[0], type: 'fill', source: SOURCE, slot: 'middle', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': '#7c3aed', 'fill-opacity': 0.3 } });
    map.addLayer({ id: LAYERS[1], type: 'line', source: SOURCE, slot: 'middle', filter: ['match', ['geometry-type'], ['Polygon', 'LineString'], true, false], paint: { 'line-color': '#6d28d9', 'line-width': 2 } });
    map.addLayer({ id: LAYERS[2], type: 'circle', source: SOURCE, slot: 'middle', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-color': '#7c3aed', 'circle-radius': 6, 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1 } });
  }
  const color = categoryColorExpression(overlay.style);
  map.setPaintProperty(LAYERS[0], 'fill-color', color);
  map.setPaintProperty(LAYERS[1], 'line-color', color);
  map.setPaintProperty(LAYERS[2], 'circle-color', color);
  const visible = categoryVisibilityExpression(overlay.style);
  map.setFilter(LAYERS[0], ['all', ['==', ['geometry-type'], 'Polygon'], visible]);
  map.setFilter(LAYERS[1], ['all', ['match', ['geometry-type'], ['Polygon', 'LineString'], true, false], visible]);
  map.setFilter(LAYERS[2], ['all', ['==', ['geometry-type'], 'Point'], visible]);
  if (dataChanged) map.fitBounds(overlay.bounds, { padding: 55, maxZoom: 14, duration: 800 });
  displayedData.set(map, overlay.data);
}
