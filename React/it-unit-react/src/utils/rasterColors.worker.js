import { paintRaster } from './rasterColors.js';

self.onmessage = ({ data }) => {
  try {
    const rgba = paintRaster(data.preview, data.colors);
    self.postMessage({ rgba }, [rgba.buffer]);
  } catch (error) {
    self.postMessage({ error: error.message || 'Unable to update raster colors.' });
  }
};
