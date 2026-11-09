# Raster preview

On the map page, select Mapbox, open the layers icon (GIS explorer), choose
Raster, then Load Agathis sample. Alternatively, upload a `.tif` or `.tiff`.
The sample is bundled at `public/rasters/Agathis_sp_GEE.tif`; it is available
on every visit but loads only when requested. Uploaded files are decoded
locally and are not saved to Firebase or uploaded to Mapbox.

## Supported scope

- One raster overlay alongside the existing shapefile overlay. Uploading
  another TIFF replaces the current raster after successful decoding.
- North-up, pixel-area GeoTIFFs using EPSG:4326 or EPSG:3857. Other projections
  and rotated or point-sampled grids receive an actionable error.
- First numeric band, with a blue/green/yellow/red preview scale. Low, lower-middle, upper-middle and
  high color pickers are applied with Apply colors; Reset colors restores
  the defaults. The four stops sit at 0%, 33.33%, 66.67%, and 100% of the
  preview value range, with smooth interpolation between them.
  Recoloring uses cached normalized preview pixels in a worker,
  without rereading the TIFF or refitting the map. The cache uses at most
  4 MiB per raster preview. Color choices last for the page visit.
  This does not
  implement RGB imagery, raster attribute tables, pixel inspection, or
  arbitrary GIS format support.
- NoData and nonfinite values are transparent. The legend uses the valid
  preview pixel range, which can differ from the full-resolution range.
- Maximum 20 MB file, 8 million source pixels, 16 bands and 128 MB estimated
  decoded sample data. Preview is at most 1024 pixels per side. Decoding runs
  in a worker with a 60-second timeout; compressed files still require
  decoding work before a preview can be produced.
- Geographic raster rows are resampled into Mercator for image-source placement.
- Opacity and visibility changes reuse the source and do not refit the map.
- Raster state lasts for the page visit. Leaflet does not render the raster;
  switching back to Mapbox restores it.

## Automated verification

Run `node --test tests/*.test.mjs`, `npm run lint`, and `npm run build`.
Tests decode the actual bundled TIFF, check NoData transparency and metadata,
check supported and rejected georeferencing, and exercise overlay replacement,
visibility, opacity, removal and isolation from vector layers with a map mock.

## Browser acceptance checks

These require the running app and a signed-in user; automated unit tests do
not validate the real Mapbox renderer or the final browser layout.

1. Load the sample: map should fit Palawan, show colored valid pixels, and
   leave the rest transparent. Metadata should report 529 x 620, EPSG:4326,
   one band, and NoData -9999.
2. Hide vector DN groups if necessary to see raster pixels beneath them.
3. Toggle Show raster and adjust opacity. The map should stay in place and
   vector features, their colors, markers and location selection should work.
4. Upload the original TIFF, then try an invalid TIFF. A failed replacement
   should show an error and preserve the previous raster.
5. Remove the raster. Vector features and saved markers should remain.
6. Switch to Leaflet and back, and navigate away while decoding. Check that
   restoring the provider works and no stale worker updates appear.
7. Check narrow-screen layout, keyboard tab navigation, Escape dismissal,
   and focus restoration to the explorer icon.
8. Change each color picker: the map and applied legend should stay unchanged
   until Apply colors. Apply, then reset; both should update the map and legend,
   preserve transparency, opacity and visibility, and keep the camera in place.
   Replacing the file should restore the default colors. A failed replacement
   should preserve the existing colors and raster.
