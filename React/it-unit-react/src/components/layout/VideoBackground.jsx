import { useEffect, useRef, useState } from "react";
import {
  BACKGROUND_FILES,
  REDUCED_MOTION_QUERY,
  SMALL_SCREEN_QUERY,
  chooseBackground,
} from "../../utils/backgroundVideo";
import "../../styles/video-background.css";

// "videos/x.mp4" -> "/videos/x.mp4" (also works if the app is hosted in a sub-folder)
function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

// Reads what the browser / device allows right now.
function readEnvironment() {
  const connection = navigator.connection;

  return {
    reducedMotion: window.matchMedia(REDUCED_MOTION_QUERY).matches,
    smallScreen: window.matchMedia(SMALL_SCREEN_QUERY).matches,
    saveData: Boolean(connection && connection.saveData),
    connection: (connection && connection.effectiveType) || "",
  };
}

// The Purple Desert video behind the whole app (sidebar, every page and the
// login page). It is created once, in App.jsx, so it keeps playing without a
// restart while you move between pages.
//
// It falls back to the still picture when: the person prefers less motion,
// data-saver is on, the connection is very slow, or the video cannot load.
export default function VideoBackground() {
  const videoRef = useRef(null);

  const [environment, setEnvironment] = useState(readEnvironment);
  const [failed, setFailed] = useState(false);

  // Switch between the large and small video (or the picture) if the window
  // is resized or the motion setting changes while the app is open.
  useEffect(() => {
    const queries = [
      window.matchMedia(REDUCED_MOTION_QUERY),
      window.matchMedia(SMALL_SCREEN_QUERY),
    ];

    function handleChange() {
      setEnvironment(readEnvironment());
    }

    queries.forEach((query) => query.addEventListener("change", handleChange));

    return () => {
      queries.forEach((query) =>
        query.removeEventListener("change", handleChange)
      );
    };
  }, []);

  const choice = chooseBackground(environment, failed);
  const videoUrl =
    choice.mode === "video" ? assetUrl(BACKGROUND_FILES[choice.file]) : null;
  const posterUrl = assetUrl(BACKGROUND_FILES.poster);

  // Make sure it plays (some browsers need an explicit play() even for muted
  // autoplay) and pause it while the tab is hidden, to save battery.
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = true;

    const play = () => {
      const attempt = video.play();

      if (attempt) attempt.catch(() => {});
    };

    function handleVisibilityChange() {
      if (document.hidden) video.pause();
      else play();
    }

    play();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [videoUrl]);

  return (
    <div
      className="video-background"
      style={{ backgroundImage: `url(${posterUrl})` }}
      aria-hidden="true"
    >
      {videoUrl && (
        <video
          key={videoUrl}
          ref={videoRef}
          className="video-background-video"
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        />
      )}

      {/* Slight darkening so text stays readable on every frame */}
      <div className="video-background-shade"></div>
    </div>
  );
}
