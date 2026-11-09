import shp from 'shpjs';
import { prepareShapefileData } from './shapefileData';

self.onmessage = async ({ data }) => {
  try {
    self.postMessage({ result: prepareShapefileData(await shp(data)) });
  } catch (error) {
    self.postMessage({ error: error.message || 'Unable to read this shapefile ZIP.' });
  }
};
