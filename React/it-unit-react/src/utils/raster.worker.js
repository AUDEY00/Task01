import { readRaster } from './rasterData.js';

self.onmessage = async ({ data }) => {
  try {
    const result = await readRaster(data);
    self.postMessage({ result }, [result.rgba.buffer, result.preview.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || 'Unable to read this GeoTIFF.' });
  }
};
