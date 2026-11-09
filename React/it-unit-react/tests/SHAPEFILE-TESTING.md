# Shapefile preview testing

## Compact explorer layout

The layers icon beside Guided tour opens the explorer dialog. Confirm the bundled dataset loads while it is closed. Layers & colors contains upload/default/remove, DN grouping, colors, and visibility; Attribute table contains search and pagination. Switch tabs and close/reopen to confirm settings remain intact. Close with X or Escape; keyboard focus should return to the launcher. Use arrow keys to switch tabs. The dialog scrolls internally and fills the screen on phones. The map page fits the viewport, with the location side panel scrolling internally (below the map on narrow screens). Check short and narrow windows, map resizing, and access to the add-location form and list.

## Bundled default layer

`public/shapefiles/amphibians-priority1.zip` is included with the website and loads automatically on each Map page visit. It contains 4,742 polygons with `fid` and `DN` attributes. No Firestore or Firebase Storage setup is needed. The file is public when the website is deployed.

Verify a fresh map visit loads this layer and Mapbox fits its bounds. Remove overlay hides it for the current visit; Load default restores it. Replace ZIP still replaces the current layer. Refreshing or revisiting restores the bundled default. Colors and visibility are not saved between visits. A failed load should show an error, retain any existing overlay, and allow Load default to retry. Test navigating away during loading and switching map providers.

## Attribute colors and DN ranges

Each legend value/range has a visibility checkbox. Uncheck to hide its polygons, outlines, lines, and points; check again to restore its chosen color. **Select all / Clear all** affects all categories, including other pages and categories excluded by the legend search. The attribute table retains all records. Reset colors preserves visibility; changing field/grouping resets visibility to all shown.

Verify hiding one group leaves other groups and saved location markers visible, Clear all removes only the shapefile shapes, and Select all restores them. Visibility changes must not move the map. Switch Mapbox → Leaflet → Mapbox and verify the chosen visibility persists for this page visit.

Run `node --test tests/shapefile*.test.mjs` for parsing, overlay lifecycle, and attribute grouping tests.

After uploading a ZIP with a DN attribute, select DN in **Attribute field**. It defaults to **Ranges of 10**: 0–9, 10–19, 20–29, etc. Each visible group has its own color picker and feature count. Only occupied ranges appear. Missing or non-numeric values appear separately. Fractional datasets use explicit lower-inclusive, upper-exclusive labels.

Change a group's color and confirm all its shapes change without moving the map. Switch to **Individual values** to style values separately. Changing field/grouping or resetting colors restores the palette. The original attribute values remain unchanged.

Check attribute search, category search, pagination, the collapsible explorer, and narrow-screen layout. Colors should survive Mapbox → Leaflet → Mapbox switching during the same page visit. Browser verification is still required with your authenticated map session.

Run `node --test tests/shapefile.test.mjs`, `npm run lint`, and `npm run build` from the React project.

For browser testing, start `npm run dev`, sign in, open Location Map, and select Mapbox. Upload `tests/fixtures/palawan-test-polygon.zip`. This is a synthetic rectangle near Puerto Princesa, not an official boundary. Expect one purple polygon with an outline and automatic zoom to it.

- Upload your own ZIP containing matching .shp, .shx, .dbf, and .prj files; include .cpg when available. Without .prj, the parser assumes WGS84 longitude/latitude. Range checking cannot detect every incorrect coordinate system.
- Test point and line datasets as well as polygons. Multiple shapefiles in one ZIP appear as one combined overlay.
- Upload a replacement ZIP; only the new overlay should remain. Invalid or oversized uploads must show an error and retain the previous overlay.
- Remove the overlay; saved location markers should remain.
- Switch to Leaflet: the overlay is hidden and uploading is disabled. Switch back to Mapbox: the existing overlay returns and fits to view.
- Check map clicks still fill the location form, location rows still focus markers, popups still open, and the three view choices still work. Test location add/edit/delete only with disposable records in your test environment.
- Check the upload controls at narrow screen widths. Leave the page and return: the temporary overlay should be cleared.

The preview has limits of 20 MB compressed input, 50,000 features, 500,000 coordinates, and 30 seconds parsing time. Parsing uses a worker; no uploaded dataset is saved to Firebase. Very large GIS datasets should be simplified before use.

Automated tests cover parsing a real ZIP, geometry validation, bounds, and isolated Mapbox source/layer replacement/removal. They do not replace a browser check with a working Mapbox token and an authenticated session.
