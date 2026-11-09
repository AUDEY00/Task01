const SOURCE = 'gis-raster-source';
const LAYER = 'gis-raster-layer';
const displayed = new WeakMap();

export function updateRasterOverlay(map, raster) {
  if (!raster) {
    if (map.getLayer(LAYER)) map.removeLayer(LAYER);
    if (map.getSource(SOURCE)) map.removeSource(SOURCE);
    displayed.delete(map);
    return;
  }
  const previous = displayed.get(map);
  const coordinates = JSON.stringify(raster.coordinates);
  const changed = previous?.url !== raster.url || previous?.coordinates !== coordinates || !map.getSource(SOURCE);
  const newDataset = !previous || previous.coordinates !== coordinates || (raster.preview ? previous.preview !== raster.preview : previous.url !== raster.url);
  if (!map.getSource(SOURCE)) {
    map.addSource(SOURCE, { type: 'image', url: raster.url, coordinates: raster.coordinates });
    map.addLayer({ id: LAYER, type: 'raster', source: SOURCE, slot: 'bottom', paint: { 'raster-fade-duration': 0, 'raster-resampling': 'nearest' } });
  } else if (changed) {
    map.getSource(SOURCE).updateImage({ url: raster.url, coordinates: raster.coordinates });
  }
  map.setPaintProperty(LAYER, 'raster-opacity', raster.opacity ?? 0.8);
  map.setLayoutProperty(LAYER, 'visibility', raster.visible === false ? 'none' : 'visible');
  if (newDataset) map.fitBounds(raster.bounds, { padding: 55, maxZoom: 14, duration: 800 });
  displayed.set(map, { url: raster.url, coordinates, preview: raster.preview });
}
