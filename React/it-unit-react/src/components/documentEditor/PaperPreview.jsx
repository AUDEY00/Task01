import { useEffect, useRef, useState } from "react";
import {
  computePageCount,
  computeScale,
  describePaper,
  getPageMetrics,
} from "../../utils/paper";

const COLUMN_GAP = 40; // space between the page "columns" (hidden by clipping)
const SHEET_GAP = 24; // space between sheets on screen
const MAX_PAGES = 100; // safety limit for huge documents

export default function PaperPreview({ html, settings }) {
  const areaRef = useRef(null);
  const measureRef = useRef(null);

  const [areaWidth, setAreaWidth] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const { widthPx, heightPx, marginPx, contentWidthPx, contentHeightPx } =
    getPageMetrics(settings);

  // Width available on screen (so a wide sheet can shrink on a small screen)
  useEffect(() => {
    const area = areaRef.current;

    if (!area) return;

    const observer = new ResizeObserver((entries) => {
      setAreaWidth(entries[0].contentRect.width);
    });

    observer.observe(area);

    return () => observer.disconnect();
  }, []);

  // Count the pages: measure the hidden copy after it has been drawn, and
  // again when the fonts have finished loading (they change the line breaks).
  useEffect(() => {
    let cancelled = false;

    function measure() {
      const element = measureRef.current;

      if (cancelled || !element) return;

      setPageCount(
        computePageCount(element.scrollWidth, contentWidthPx, COLUMN_GAP)
      );
    }

    const frame = requestAnimationFrame(measure);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measure);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [html, contentWidthPx, contentHeightPx]);

  const scale = computeScale(areaWidth, widthPx);
  const shownPages = Math.min(pageCount, MAX_PAGES);
  const stageHeight = shownPages * heightPx + (shownPages - 1) * SHEET_GAP;

  // The text container: one column per page.
  const flowStyle = {
    width: contentWidthPx,
    height: contentHeightPx,
    columnWidth: `${contentWidthPx}px`,
    columnGap: `${COLUMN_GAP}px`,
    columnFill: "auto",
  };

  return (
    <div className="paper-area" ref={areaRef}>
      <p className="paper-info">
        {describePaper(settings)} · {pageCount} {pageCount === 1 ? "page" : "pages"}
        {pageCount > MAX_PAGES ? ` (showing the first ${MAX_PAGES})` : ""}
      </p>

      {/* Hidden copy, only used to count the pages */}
      <div className="paper-measure" aria-hidden="true">
        <div className="ql-snow">
          <div
            ref={measureRef}
            className="ql-editor paper-flow"
            style={flowStyle}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <div
        className="paper-stage"
        style={{ width: widthPx * scale, height: stageHeight * scale }}
      >
        <div
          className="paper-scaler"
          style={{ width: widthPx, transform: `scale(${scale})` }}
        >
          {Array.from({ length: shownPages }, (_, index) => (
            <div
              className="paper-sheet"
              key={index}
              style={{
                width: widthPx,
                height: heightPx,
                padding: marginPx,
                marginBottom: index < shownPages - 1 ? SHEET_GAP : 0,
              }}
            >
              {/* Every sheet holds the same text; screen readers only get the first copy */}
              <div
                className="paper-window"
                style={{ width: contentWidthPx, height: contentHeightPx }}
                aria-hidden={index > 0}
              >
                <div className="ql-snow">
                  <div
                    className="ql-editor paper-flow"
                    style={{
                      ...flowStyle,
                      transform: `translateX(-${index * (contentWidthPx + COLUMN_GAP)}px)`,
                    }}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </div>

              <div
                className="paper-footer"
                style={{ bottom: Math.max(4, Math.round(marginPx / 2 - 7)) }}
              >
                Page {index + 1} of {pageCount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
