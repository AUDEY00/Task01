import { fromArrayBuffer } from 'geotiff';
import { paintRaster } from './rasterColors.js';

const MAX_LAT = 85.05112878;
const mercatorY = (lat) => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const latitude = (y) => (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180 / Math.PI;

export function rasterBounds(image) {
  const keys = image.getGeoKeys();
  const crs = keys?.ProjectedCSTypeGeoKey || keys?.GeographicTypeGeoKey;
  if (![4326, 3857].includes(crs)) throw new Error('Supported coordinate systems are WGS84 (EPSG:4326) and Web Mercator (EPSG:3857). Reproject this file in your GIS software first.');
  const directory = image.getFileDirectory();
  if (keys?.GTRasterTypeGeoKey === 2) throw new Error('Point-sampled rasters need to be exported as a pixel-area GeoTIFF first.');
  if (directory.ModelTransformation) throw new Error('Rotated or transformed rasters need to be exported as a north-up GeoTIFF first.');
  const resolution = image.getResolution();
  if (!(resolution[0] > 0 && resolution[1] < 0)) throw new Error('Please export a north-up GeoTIFF with positive eastward pixel spacing.');
  const raw = image.getBoundingBox();
  let [west, south, east, north] = raw;
  if (crs === 3857) {
    west = west / 6378137 * 180 / Math.PI;
    east = east / 6378137 * 180 / Math.PI;
    south = latitude(south / 6378137);
    north = latitude(north / 6378137);
  }
  if (![west, south, east, north].every(Number.isFinite) || west < -180 || east > 180 || south < -MAX_LAT || north > MAX_LAT || west >= east || south >= north) {
    throw new Error('Raster bounds are invalid or outside the supported Mercator extent.');
  }
  return { crs, bounds: [[west, south], [east, north]], coordinates: [[west, north], [east, north], [east, south], [west, south]] };
}

export function colorizeRaster(values, width, height, noData, crs, bounds) {
  const valid = (value) => Number.isFinite(value) && (noData === null || value !== noData);
  let min = Infinity;
  let max = -Infinity;
  let validPixels = 0;
  for (const value of values) {
    if (!valid(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
    validPixels++;
  }
  if (!validPixels) throw new Error('The first band contains no valid pixel values.');
  // Cache normalized, projected preview values for recoloring without decoding again.
  const preview = new Float32Array(width * height).fill(-1);
  const south = bounds[0][1];
  const north = bounds[1][1];
  const topY = mercatorY(north);
  const bottomY = mercatorY(south);
  for (let y = 0; y < height; y++) {
    // An image source is laid out in Mercator. Warp geographic rows rather
    // than stretching latitude linearly between the four corner coordinates.
    const lat = latitude(topY + (bottomY - topY) * (y + 0.5) / height);
    const sourceY = crs === 4326 ? Math.max(0, Math.min(height - 1, Math.floor((north - lat) / (north - south) * height))) : y;
    for (let x = 0; x < width; x++) {
      const value = values[sourceY * width + x];
      if (!valid(value)) continue;
      preview[y * width + x] = max === min ? 0.5 : (value - min) / (max - min);
    }
  }
  return { rgba: paintRaster(preview), preview, min, max, validPixels };
}

export async function readRaster(buffer) {
  if (!buffer.byteLength || buffer.byteLength > 20 * 1024 * 1024) throw new Error('Choose a GeoTIFF of 20 MB or less.');
  const tiff = await fromArrayBuffer(buffer);
  const image = await tiff.getImage();
  const originalWidth = image.getWidth();
  const originalHeight = image.getHeight();
  if (originalWidth * originalHeight > 8000000 || image.getSamplesPerPixel() > 16) throw new Error('This preview supports up to 8 million source pixels and 16 bands. Use a smaller or tiled raster.');
  const bits = image.getFileDirectory().BitsPerSample;
  const bytesPerPixel = Array.from(bits || [8]).reduce((sum, value) => sum + value / 8, 0);
  if (originalWidth * originalHeight * bytesPerPixel > 128 * 1024 * 1024) throw new Error('This raster exceeds the 128 MB decoded preview limit. Export a smaller raster or fewer bands.');
  const geo = rasterBounds(image);
  const scale = Math.min(1, 1024 / Math.max(originalWidth, originalHeight));
  const width = Math.max(1, Math.round(originalWidth * scale));
  const height = Math.max(1, Math.round(originalHeight * scale));
  const values = await image.readRasters({ samples: [0], width, height, interleave: true, resampleMethod: 'nearest' });
  const noData = image.getGDALNoData();
  const pixels = colorizeRaster(values, width, height, noData, geo.crs, geo.bounds);
  return { ...geo, ...pixels, width, height, originalWidth, originalHeight, bands: image.getSamplesPerPixel(), noData };
}
