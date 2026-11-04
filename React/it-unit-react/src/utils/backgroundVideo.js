// Files live in  public/videos/  (see components/layout/VideoBackground.jsx)
export const BACKGROUND_FILES = {
  large: "videos/purple-desert-1080.mp4", // computers and tablets (about 3 MB)
  small: "videos/purple-desert-720.mp4", // phones and small windows (about 1 MB)
  poster: "videos/purple-desert-poster.jpg", // still picture (about 140 KB)
};

export const SMALL_SCREEN_QUERY = "(max-width: 700px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Connections too slow for a video background.
const SLOW_CONNECTIONS = ["slow-2g", "2g"];

// Returns { mode: "video", file: "large" | "small" }  or  { mode: "poster" }.
export function chooseBackground(environment, failed = false) {
  const { reducedMotion, saveData, connection, smallScreen } = environment;

  if (failed) return { mode: "poster" };
  if (reducedMotion) return { mode: "poster" };
  if (saveData) return { mode: "poster" };
  if (SLOW_CONNECTIONS.includes(connection)) return { mode: "poster" };

  return { mode: "video", file: smallScreen ? "small" : "large" };
}
