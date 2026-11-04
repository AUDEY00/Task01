import { useEffect, useState } from "react";
import { subscribeToStaff } from "../services/staffService";

// Live list of staff from Firestore (replaces db.collection("staff").onSnapshot).
export function useStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToStaff(
      (list) => {
        setStaffList(list);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore read error:", error);
        setLoading(false);
      }
    );

    // Stop listening when the page is closed.
    return unsubscribe;
  }, []);

  return { staffList, loading };
}
