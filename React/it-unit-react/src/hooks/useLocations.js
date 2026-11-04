import { useEffect, useState } from "react";
import { subscribeToLocations } from "../services/locationService";

// Live list of locations from Firestore (replaces loadLocations / onSnapshot).
export function useLocations() {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToLocations(
      (list) => setLocations(list),
      (error) => console.error("Firestore location error:", error)
    );

    // Stop listening when the page is closed.
    return unsubscribe;
  }, []);

  return { locations };
}
