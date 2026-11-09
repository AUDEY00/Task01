import { useMemo, useState } from 'react';
import { Palette, Table2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { attributeCategories, attributeFields, displayAttribute } from '../../utils/shapefileAttributes';

const PAGE_SIZE = 25;

export default function ShapefileAttributes({ overlay, onChange, activeTab = 'layers' }) {
  const fields = useMemo(() => attributeFields(overlay.data), [overlay.data]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryPage, setCategoryPage] = useState(0);
  const rows = useMemo(() => overlay.data.features.map((feature, index) => ({ feature, index })).filter(({ feature }) =>
    Object.values(feature.properties || {}).some((value) => displayAttribute(value).toLowerCase().includes(search.toLowerCase())) || !search
  ), [overlay.data, search]);
  const categories = overlay.style?.categories || [];
  const visibleCategories = categories.filter(({ label }) => label.toLowerCase().includes(categorySearch.toLowerCase()));

  function chooseField(field, mode = field.toUpperCase() === 'DN' ? 'ranges10' : 'individual') {
    setCategorySearch('');
    setCategoryPage(0);
    onChange({ ...overlay, style: field ? { field, mode, categories: attributeCategories(overlay.data, field, mode) } : null });
  }

  function changeColor(key, color) {
    onChange({ ...overlay, style: { ...overlay.style, categories: categories.map((category) => category.key === key ? { ...category, color } : category) } });
  }

  function changeVisibility(key, visible) {
    onChange({ ...overlay, style: { ...overlay.style, categories: categories.map((category) => key === null || category.key === key ? { ...category, visible } : category) } });
  }

  function resetColors() {
    const defaults = new Map(attributeCategories(overlay.data, overlay.style.field, overlay.style.mode).map((category) => [category.key, category.color]));
    onChange({ ...overlay, style: { ...overlay.style, categories: categories.map((category) => ({ ...category, color: defaults.get(category.key) })) } });
  }

  return (
    <div className="shape-explorer">
      <div className="shape-explorer-grid">
        <section className="shape-colors" aria-label="Colors by attribute" hidden={activeTab !== 'layers'}>
          <h3><Palette size={17} aria-hidden="true" /> Color by value</h3>
          <p>Choose a field, then pick a color for each value. Changes appear on the map immediately.</p>
          <label htmlFor="shape-color-field">Attribute field</label>
          <select id="shape-color-field" value={overlay.style?.field || ''} onChange={(event) => chooseField(event.target.value)}>
            <option value="">Single color (purple)</option>
            {fields.map((field) => <option key={field} value={field}>{field}</option>)}
          </select>
          {overlay.style?.field && <>
            <label htmlFor="shape-color-grouping">Group colors</label>
            <select id="shape-color-grouping" value={overlay.style.mode || 'individual'} onChange={(event) => chooseField(overlay.style.field, event.target.value)}>
              <option value="individual">Individual values</option>
              <option value="ranges10">Ranges of 10 (0–9, 10–19, …)</option>
            </select>
            <p>{overlay.style.mode === 'ranges10' ? 'One color per range, anchored at 0. Only ranges present in your data are shown; missing or non-numeric values are separate.' : 'One color per distinct value.'} Changing grouping resets the palette and shows all groups.</p>
          </>}
          {!fields.length && <p>No attributes found. Include the matching .dbf file in your ZIP.</p>}
          {!!categories.length && <>
            <div className="shape-legend-heading"><strong>Legend · {categories.length} {overlay.style.mode === 'ranges10' ? 'groups' : 'values'}</strong><button type="button" onClick={resetColors}>Reset colors</button></div>
            <div className="shape-visibility-actions"><button type="button" onClick={() => changeVisibility(null, true)}>Select all</button><button type="button" onClick={() => changeVisibility(null, false)}>Clear all</button><span role="status">{categories.filter((category) => category.visible !== false).length} / {categories.length} shown</span></div>
            <p>Uncheck to hide shapes. Select all / Clear all affects every group, including search results on other pages. The table keeps all records.</p>
            <input type="search" aria-label="Find an attribute value" placeholder="Find a value…" value={categorySearch} onChange={(event) => { setCategorySearch(event.target.value); setCategoryPage(0); }} />
            <div className="shape-category-list">
              {visibleCategories.slice(categoryPage * PAGE_SIZE, (categoryPage + 1) * PAGE_SIZE).map((category) => <div className={`shape-category${category.visible === false ? ' shape-category-hidden' : ''}`} key={category.key}>
                <input type="checkbox" checked={category.visible !== false} aria-label={`Show ${category.label} (${category.type})`} onChange={(event) => changeVisibility(category.key, event.target.checked)} />
                <input type="color" value={category.color} aria-label={`Color for ${category.label} (${category.type})`} onChange={(event) => changeColor(category.key, event.target.value)} />
                <span className="shape-category-text"><strong title={category.label}>{category.label}</strong><small>{category.type} · {category.color.toUpperCase()}{category.visible === false ? ' · Hidden' : ''}</small></span>
                <span className="shape-count" title="Feature count">{category.count.toLocaleString()}</span>
              </div>)}
              {!visibleCategories.length && <p>No matching values.</p>}
            </div>
            <Pagination page={categoryPage} count={visibleCategories.length} onChange={setCategoryPage} label="values" />
          </>}
        </section>
        <section className="shape-data" aria-label="Shapefile attribute table" hidden={activeTab !== 'table'}>
          <div className="shape-table-heading"><h3><Table2 size={17} aria-hidden="true" /> Attribute table</h3><span>Read only</span></div>
          <label className="shape-search"><Search size={16} aria-hidden="true" /><input type="search" aria-label="Search attribute records" placeholder="Search all values…" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} /></label>
          <div className="shape-table-scroll" tabIndex={0} role="region" aria-label="Scrollable attribute records">
            <table><thead><tr><th scope="col">Feature</th><th scope="col">Geometry</th>{fields.map((field) => <th scope="col" key={field} className={overlay.style?.field === field ? 'shape-active-field' : ''}>{field}</th>)}</tr></thead>
              <tbody>{rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(({ feature, index }) => <tr key={index}><th scope="row">{index + 1}</th><td>{feature.geometry.type}</td>{fields.map((field) => <td key={field} title={displayAttribute(feature.properties?.[field])} className={overlay.style?.field === field ? 'shape-active-field' : ''}>{displayAttribute(feature.properties?.[field])}</td>)}</tr>)}</tbody>
            </table>
            {!rows.length && <p className="shape-empty">No matching records.</p>}
          </div>
          <Pagination page={page} count={rows.length} onChange={setPage} label="records" />
          <p>Colors apply to features sharing the selected value. Data and colors are temporary and clear when you leave this page.</p>
        </section>
      </div>
    </div>
  );
}

function Pagination({ page, count, onChange, label }) {
  return <div className="shape-pagination"><span>{count ? page * PAGE_SIZE + 1 : 0}–{Math.min((page + 1) * PAGE_SIZE, count)} of {count.toLocaleString()} {label}</span><div><button type="button" aria-label={`Previous ${label}`} disabled={page === 0} onClick={() => onChange(page - 1)}><ChevronLeft size={16} /></button><button type="button" aria-label={`Next ${label}`} disabled={(page + 1) * PAGE_SIZE >= count} onClick={() => onChange(page + 1)}><ChevronRight size={16} /></button></div></div>;
}
