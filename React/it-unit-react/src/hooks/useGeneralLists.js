import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { subscribeToLists } from "../services/generalListService";

// Live list of General Lists from Firestore.
// "loading" is true until the first answer (or error) arrives.
export function useGeneralLists() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToLists(
      (updatedLists) => {
        setLists(updatedLists);
        setLoading(false);
      },
      (error) => {
        console.error("Error loading General Lists:", error);
        setLoading(false);

        Swal.fire({
          icon: "error",
          title: "Unable to Load Lists",
          text: "There was a problem loading the General Lists.",
        });
      }
    );

    // Stop listening when the page is closed.
    return unsubscribe;
  }, []);

  return { lists, loading };
}
