import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Search, Table as TableIcon } from "lucide-react";
import { pluralize } from "../../utils/generalList";

// The button at the top that shows the open list. Clicking it opens a menu
// with a search box and every list, so it still works with many lists.
export default function ListSwitcher({
  lists,
  selectedList,
  loading,
  onSelect,
  onCreate,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const rootRef = useRef(null);
  const searchRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
  }, []);

  // Close when clicking outside or pressing Escape; focus the search box.
  useEffect(() => {
    if (!open) return;

    function handleMouseDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) close();
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") close();
    }

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    searchRef.current?.focus();

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  const filteredLists = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (term === "") return lists;

    return lists.filter((list) =>
      String(list.name || "").toLowerCase().includes(term)
    );
  }, [lists, search]);

  function handleSelect(list) {
    onSelect(list);
    close();
  }

  function handleCreate() {
    close();
    onCreate();
  }

  return (
    <div className="list-switcher" id="tour-list-panel" ref={rootRef}>
      <button
        type="button"
        className="switcher-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={loading}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="switcher-icon">
          <TableIcon size={17} aria-hidden="true" />
        </span>

        <span className="switcher-text">
          <span className="switcher-name">
            {selectedList ? selectedList.name : "Select a list"}
          </span>

          <span className="switcher-meta">
            {selectedList
              ? `${pluralize(selectedList.columns.length, "column")} · ${pluralize(selectedList.records.length, "record")}`
              : pluralize(lists.length, "list")}
          </span>
        </span>

        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className="switcher-menu">
          <div className="search-box">
            <Search size={15} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search lists"
              aria-label="Search lists"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchRef}
            />
          </div>

          <div className="switcher-options" role="listbox">
            {filteredLists.map((list) => {
              const isSelected = selectedList && list.id === selectedList.id;

              return (
                <button
                  type="button"
                  key={list.id}
                  role="option"
                  aria-selected={Boolean(isSelected)}
                  className={
                    isSelected ? "switcher-option selected" : "switcher-option"
                  }
                  onClick={() => handleSelect(list)}
                >
                  <span className="option-name">{list.name}</span>

                  <span className="option-meta">
                    {pluralize(list.columns.length, "column")} ·{" "}
                    {pluralize(list.records.length, "record")}
                  </span>
                </button>
              );
            })}

            {filteredLists.length === 0 && (
              <p className="switcher-empty">
                {lists.length === 0
                  ? "No lists yet."
                  : "No lists match your search."}
              </p>
            )}
          </div>

          <div className="switcher-footer">
            <button type="button" className="switcher-new" onClick={handleCreate}>
              <Plus size={15} aria-hidden="true" />
              New list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
