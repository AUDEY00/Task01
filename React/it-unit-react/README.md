# IT Unit Management System (React)

A web app for an IT unit. It keeps a **staff directory**, a **map of locations**,
**custom lists (tables)** and a **rich-text document editor**, all saved in
Firebase.

This project is the React version of an older AngularJS app. Everything the old
app did is here, and a few bugs from the old app were fixed (see
[Improvements over the old app](#improvements-over-the-old-app)).

---

## Contents

1. [What is inside](#what-is-inside)
2. [Pages and functions](#pages-and-functions)
3. [Tools used](#tools-used)
4. [Getting started](#getting-started)
5. [Settings (.env file)](#settings-env-file)
6. [Where the data is stored](#where-the-data-is-stored)
7. [Project folders](#project-folders)
8. [Improvements over the old app](#improvements-over-the-old-app)
9. [Limits to know about](#limits-to-know-about)
10. [Troubleshooting](#troubleshooting)
11. [Credits](#credits)

---

## What is inside

| Page | Address | What it is for |
|------|---------|----------------|
| Login | `/login` | Sign in with email and password |
| Staff Directory (Dashboard) | `/` | Add, edit and manage staff |
| Location Map | `/map` | Pin places on a map and keep a list of them |
| General Lists | `/general-lists` | Make your own tables with your own columns |
| Document Editor | `/document-editor` | Write and format documents, preview them on paper |

Every page except Login needs you to be signed in. If you are not signed in, the
app sends you to the login page. A sidebar on the left moves you between the
pages.

---

## Pages and functions

### Login

- Sign in with an **email and password** (Firebase Authentication).
- Shows a clear message if something is missing or wrong.
- The form floats over a looping **Purple Desert video** background. People who
  have "reduce motion" turned on, data-saver on, or a very slow connection see a
  still picture instead. Phones get a smaller video file.
- There is no sign-up page. Create the user accounts in the Firebase console
  (see [Getting started](#getting-started)).

### Sidebar (on every page after login)

- Dark purple panel with a **glowing light on the page you are on**. The light
  slides to the new page when you change page.
- Shows who is signed in, and a **Logout** button.
- On phones it shrinks to a column of **icon tiles**. Hover or tap a tile to see
  its name.
- With "reduce motion" turned on, nothing slides.

### Staff Directory (Dashboard)

- **Active / Inactive tabs** with a count on each. New staff start as *Inactive*.
- **Search** by name or role.
- **Add staff**: full name, role and an optional profile photo. The photo is
  uploaded to Cloudinary and its link is saved with the staff member.
- **View details**: change the name, role or photo. The status can be changed
  with the activate / deactivate button.
- **Activate / Deactivate** a staff member (moves them between the two tabs).
- **Delete** a staff member (asks first).
- **Import** staff from an Excel or CSV file. The file needs a **Full Name** and a
  **Role** column on the same row. The app tells you exactly what is wrong if it
  cannot read the file. Imported staff start as *Inactive*.
- **Export** all staff to **Excel**, **CSV** or **PDF**.
- Staff without a photo show their **initials**.
- **Guided Tour** button that explains the page step by step.

### Location Map

- Two map engines you can switch between: **Mapbox** and **Leaflet**. Both show
  the same saved locations. Your choice is remembered.
- With Mapbox you can jump between **Palawan**, **Philippines** and **World**
  views. This is remembered too.
- **Click (or tap) the map** to pick a point. A temporary marker appears and the
  latitude and longitude are filled in for you. You can also type them.
- **Add a location**: name, latitude, longitude. The app checks the values
  (latitude between -90 and 90, longitude between -180 and 180, nothing empty).
- **Locations list** in the side panel: newest first, with **search** (by name or
  coordinates) and a **Show more** button (50 at a time), so it stays fast with
  many locations.
- **Click a location** in the list and the map flies to it and opens its popup.
- **Edit** (name and coordinates) and **Delete** (asks first).
- Markers show a popup with the name and coordinates.
- On phones the list moves under the map. After picking a point, a small bar on
  the map takes you to the form.
- **Guided Tour** button.

### General Lists

Your own tables. Each list has a **name**, **columns** and **records** (rows).

- **List switcher** at the top: shows the open list, and opens a menu with a
  search box listing every list. The list you used last is opened again next time.
- **New list**: give it a name and add columns. Each column has a name and a type:
  **Text**, **Number**, **Date** or **Yes/No** (boolean). Column names must be
  different from each other.
- **Edit list**: rename the list, rename columns, add columns, delete columns,
  change types. The records are carried over safely: each column keeps its own
  data.
- **Delete list** (in the **...** menu, asks first, removes its records too).
- **Add record**: the form is built from the columns (text box, number box, date
  picker, checkbox).
- **Edit record** and **Delete record** (asks first).
- **Search records** across all columns, and **paging** (10, 25, 50 or 100 rows
  per page).
- Column headers show a small icon for the type. Yes/No values show a check or a
  dash. Dates read like *Mar 4, 2021*.
- **Guided Tour** button.

### Document Editor

- A rich-text editor (**Quill**) on a white page. Tools: bold, italic, underline,
  headings 1 to 3, numbered and bullet lists, text colour, and alignment (left,
  centre, right, justify).
- **Auto-save**: 10 seconds after you stop typing, the document is saved to
  Firebase. A status at the bottom shows *Unsaved changes*, *Saving draft...*,
  *Saved at 3:45 PM* or *Couldn't save draft*. If you type without pausing, it
  still saves at least once a minute. A failed auto-save is tried again.
- **One document, one record**: editing again after an auto-save updates the
  same document. It never creates a copy (see the improvements list).
- **Save** (manual), **New** (starts a fresh document; your current one stays
  saved, and your last few seconds of typing are saved first).
- Leaving the page saves what is still waiting. Closing the browser tab with
  unsaved changes asks you first.
- **Word and character count** at the bottom.
- **Preview** switch (Edit | Preview): shows the document on paper, **split into
  real pages** ("Page 1 of 3") with lines never cut in half.
  - Paper: **A3, A4, A5, Letter, Legal, Folio, Tabloid, Executive** or **Custom**
    (30 to 1500 mm, or inches).
  - **Portrait** or **Landscape**.
  - Margins: **Narrow, Normal, Wide**.
  - Your paper choices are remembered. On a small screen the page shrinks to fit.
  - The first 100 pages are shown for very long documents.

---

## Tools used

| Tool | What it does here |
|------|-------------------|
| React + Vite | The app and the dev server |
| react-router-dom | Moves between pages |
| firebase | Sign-in (Authentication) and the database (Firestore) |
| Cloudinary | Stores staff profile photos (uploaded from the browser) |
| mapbox-gl | The Mapbox map |
| leaflet | The Leaflet map (OpenStreetMap tiles) |
| quill (2.0.3) | The document editor |
| sweetalert2 | Pop-up messages and confirmations |
| driver.js | The Guided Tours |
| xlsx | Excel / CSV import and export |
| jspdf + jspdf-autotable | PDF export |
| lucide-react | Icons |
| @fontsource-variable/inter, @fontsource-variable/plus-jakarta-sans | Fonts (login page and sidebar) |

---

## Getting started

You need **Node.js 20 or newer**.

1. **Install the packages** (inside the project folder):

   ```bash
   npm install
   ```

   If a package is ever missing, this installs everything the app uses:

   ```bash
   npm install firebase react-router-dom sweetalert2 xlsx jspdf jspdf-autotable driver.js lucide-react mapbox-gl@3 leaflet@1.9.4 quill@2.0.3 @fontsource-variable/inter @fontsource-variable/plus-jakarta-sans
   ```

2. **Create your settings file.** Copy `.env.example` to a new file named `.env`
   and fill in the values (see [Settings](#settings-env-file)).

3. **Create at least one user** in Firebase: *Firebase console > Authentication >
   Sign-in method > turn on Email/Password*, then *Users > Add user*.

4. **Make sure the video files are in place**: `public/videos/` must contain
   `purple-desert-1080.mp4`, `purple-desert-720.mp4` and
   `purple-desert-poster.jpg`.

5. **Start the app:**

   ```bash
   npm run dev
   ```

   Open the address it prints (usually `http://localhost:5173`).

Other commands:

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the app for development |
| `npm run build` | Makes the finished app in the `dist` folder |
| `npm run preview` | Tries the finished app on your computer |

**Publishing:** upload the `dist` folder to any web host. Because the app uses
page addresses like `/map`, set the host to open `index.html` for every address
(called a "single-page app" or "rewrite" setting). Otherwise refreshing on `/map`
shows "not found".

---

## Settings (.env file)

The `.env` file holds your keys. **Never share it or upload it to GitHub** (keep
`.env` in `.gitignore`). After you change it, **stop and start `npm run dev`
again**.

| Setting | Where to find it |
|---------|------------------|
| `VITE_FIREBASE_API_KEY` | Firebase console > Project settings > Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | same place |
| `VITE_FIREBASE_PROJECT_ID` | same place |
| `VITE_FIREBASE_STORAGE_BUCKET` | same place |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same place |
| `VITE_FIREBASE_APP_ID` | same place |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary > Settings > Upload > Upload presets (must be an **unsigned** preset) |
| `VITE_MAPBOX_ACCESS_TOKEN` | Mapbox account > Tokens (the public `pk.` token) |

**Protect your data:** the app's pages need a signed-in user, but the real
protection is the **Firestore rules**. A simple, safe starting point is to allow
only signed-in users:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Where the data is stored

Everything is in **Firestore**, in four collections:

| Collection | One document is... | Main fields |
|------------|--------------------|-------------|
| `staff` | one staff member | `id`, `name`, `role`, `status` ("Active" or "Inactive"), `profileUrl`, `cloudinaryPublicId` |
| `locations` | one place on the map | `id` (like `loc_1700000000000`), `name`, `latitude`, `longitude`, `dateCreated`, `dateModified` |
| `generalLists` | one list | `name`, `columns` (each has `name` and `type`), `records` (each record is a set of values by column name) |
| `documents` | one document | `content` (the formatted text as HTML), `dateCreated`, `dateModified` |

The document ids look like `doc_...` and `list_...`. Profile photos are not in
Firestore: only their link is.

The app also remembers a few choices in the browser (not in Firebase): the map
engine and view, the last open list, and the paper settings.

---

## Project folders

```
it-unit-react/
├── index.html
├── .env.example                  Copy to .env and fill in
├── public/
│   └── videos/                   Login background (video x2 + still picture)
└── src/
    ├── main.jsx                  Starts the app
    ├── App.jsx                   The list of pages (routes)
    ├── firebase/config.js        Connects to Firebase
    ├── context/                  Remembers who is signed in
    ├── hooks/                    Live data and the document saver
    │   ├── useAuth.js
    │   ├── useStaff.js
    │   ├── useLocations.js
    │   ├── useGeneralLists.js
    │   └── useDocumentSaver.js
    ├── pages/                    One file per page
    │   ├── LoginPage.jsx
    │   ├── StaffDirectoryPage.jsx
    │   ├── MapPage.jsx
    │   ├── GeneralListPage.jsx
    │   └── DocumentEditorPage.jsx
    ├── components/               The pieces the pages are made of
    │   ├── layout/               Sidebar, page frame, login check, video background
    │   ├── staff/                Staff toolbar, table and dialogs
    │   ├── map/                  Mapbox, Leaflet, location list, add form, edit dialog
    │   ├── generalList/          List switcher, records table, list and record dialogs
    │   └── documentEditor/       Editor, paper preview, paper controls, save status
    ├── services/                 Talks to Firebase, Cloudinary and Excel/PDF
    │   ├── staffService.js, locationService.js, generalListService.js, documentService.js
    │   ├── cloudinaryService.js
    │   ├── importService.js, exportService.js
    │   └── documentSaver.js      The auto-save logic (see below)
    ├── utils/                    Small helper functions (no Firebase, no screen)
    └── styles/                   One style sheet per page, plus the shared ones
```

**How the pieces fit together:** a **page** shows **components**, gets its live
data from a **hook**, and the hook asks a **service** to read or write Firebase.
The rules (checks, search, paging, paper sizes, auto-save) live in **utils** and
**documentSaver.js**, away from the screen, which makes them easy to test.

**Where do I change...?**

| I want to change | Look in |
|------------------|---------|
| A collection name or how data is saved | `src/services/` |
| A page's layout | `src/pages/` and `src/components/<page name>/` |
| Colours and spacing of a page | `src/styles/` (one file per page) |
| The sidebar | `src/components/layout/Sidebar.jsx` and `src/styles/sidebar.css` |
| The login background | `src/components/layout/VideoBackground.jsx`, `src/styles/login-video.css` and `public/videos/` |
| The auto-save timing | `src/services/documentSaver.js` (`delay`, `maxWait`, `maxRetries`) |
| The paper sizes | `src/utils/paper.js` |
| The map start position and views | `src/components/map/MapboxMap.jsx`, `LeafletMap.jsx` |

---

## Improvements over the old app

While moving to React, these problems in the old app were found and fixed:

- **Document editor made duplicate documents.** The old app only remembered a new
  document's id after Firebase replied, so on a slow connection the next
  auto-save (or a click on Save) created another document. Now the id is chosen
  the moment the first save starts and never changes, every save goes to that
  same document, and saves run one at a time.
- **General Lists: deleting a column scrambled the other columns' data.** The old
  app matched columns by position. Now each column is tracked by its own name, so
  deleting, renaming and even swapping columns is safe.
- **General Lists: an unticked Yes/No box could not be saved.** Unticked now means
  "no".
- **General Lists: duplicate column names** were allowed when creating a list.
  Now they are not.
- **Map: an empty latitude and longitude was saved as 0, 0.** Now the app asks
  for real coordinates.
- **Map: location names could inject HTML into the popup.** Popups now show the
  name as plain text.
- **Staff import: ids could repeat** during a big import and overwrite records.
  Ids are now always unique.
- **Document preview** now uses the editor's own styles, so lists and alignment
  look the same as in the editor, and it adds paper sizes.
- Pop-up dialogs, the tours, the sidebar, fonts and the login video are new or
  rebuilt to match the dark purple look.

---

## Limits to know about

- **General Lists keep all of a list's records inside one Firebase document.**
  Firebase allows about 1 MB per document, which is roughly several thousand short
  records per list. It is plenty for normal use. A list that grows far beyond that
  would need its records moved into their own collection.
- **The map shows every location as a marker.** A few hundred is fine. Many
  thousands would be slow and would need marker clustering.
- **Saved documents cannot be reopened yet.** The editor saves them, but there is
  no "open a saved document" list. A refresh starts a blank document.
- **Only Firestore is used.** Firebase Storage is not needed (photos are in
  Cloudinary).
- **The video background is on the login page only.** The other pages keep their
  light background.
- The paper preview's page breaks are made by the browser. They are very close to
  a printed page but not guaranteed to be identical to a word processor.

---

## Troubleshooting

| Problem | Try this |
|---------|----------|
| Everything is blank or Firebase errors appear | Check the `VITE_FIREBASE_*` values in `.env`, then restart `npm run dev` |
| "Missing or insufficient permissions" | You are not signed in, or the Firestore rules do not allow your user |
| Cannot sign in | Turn on *Email/Password* in Firebase Authentication and create the user there |
| The Mapbox map is empty | Check `VITE_MAPBOX_ACCESS_TOKEN`, then restart `npm run dev` |
| Marker pictures are missing on the Leaflet map | Make sure `leaflet` is installed at version 1.9.4 |
| Staff photo upload fails | Check the Cloudinary cloud name, and that the upload preset is **unsigned** |
| The login video does not play | Check the three files are in `public/videos/` with the exact names. The still picture shows if "reduce motion" or data-saver is on |
| Fonts look plain | Run `npm install @fontsource-variable/inter @fontsource-variable/plus-jakarta-sans` and restart |
| Refreshing on `/map` says "not found" after publishing | Set your host to open `index.html` for every address |
| Changes to `.env` do nothing | Stop and start `npm run dev` again |

---

## Credits

- Login background: **Purple Desert** from [GetLayers](https://www.getlayers.ai/layer/purple-desert).
  At the time of writing, their terms allow commercial use with no credit
  required. Check their terms again before publishing.
- Maps: Mapbox, and Leaflet with OpenStreetMap (map data by OpenStreetMap
  contributors).
- Editor: [Quill](https://quilljs.com).
- Icons: [Lucide](https://lucide.dev).
- Fonts: [Inter](https://rsms.me/inter/) and
  [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans),
  through Fontsource.