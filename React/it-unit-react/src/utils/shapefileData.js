// Validate converted data before handing it to Mapbox.
export function prepareShapefileData(result) {
  const collections = Array.isArray(result) ? result : [result];
  const features = [];
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  let vertices = 0;
  const depths = { Point: 0, MultiPoint: 1, LineString: 1, MultiLineString: 2, Polygon: 2, MultiPolygon: 3 };

  function coordinates(value, depth) {
    if (!Array.isArray(value) || !value.length) throw new Error('The shapefile contains empty coordinates.');
    if (depth > 0) {
      value.forEach((child) => coordinates(child, depth - 1));
      return;
    }
    const [x, y] = value;
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 180 || Math.abs(y) > 90) {
      throw new Error('Coordinates are invalid. Include the matching .prj file so the coordinate system can be converted.');
    }
    if (++vertices > 500000) throw new Error('This dataset is too detailed for this preview (500,000 coordinate limit).');
    bounds[0] = Math.min(bounds[0], x);
    bounds[1] = Math.min(bounds[1], y);
    bounds[2] = Math.max(bounds[2], x);
    bounds[3] = Math.max(bounds[3], y);
  }

  for (const collection of collections) {
    if (collection?.type !== 'FeatureCollection' || !Array.isArray(collection.features)) throw new Error('No valid shapefile features were found.');
    for (const feature of collection.features) {
      if (!feature.geometry) continue; // Null shapes are valid shapefile records.
      const depth = depths[feature.geometry.type];
      if (depth === undefined) throw new Error('This dataset contains an unsupported geometry type.');
      coordinates(feature.geometry.coordinates, depth);
      features.push(feature);
      if (features.length > 50000) throw new Error('This preview supports up to 50,000 features.');
    }
  }
  if (!features.length) throw new Error('The shapefile contains no drawable features.');
  return { data: { type: 'FeatureCollection', features }, bounds: [[bounds[0], bounds[1]], [bounds[2], bounds[3]]] };
}
