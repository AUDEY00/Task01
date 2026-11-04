import Swal from "sweetalert2";

// Replaces Angular Material's $mdToast (bottom right, 2 seconds).
const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 2000,
});

export function showToast(message) {
  Toast.fire({ title: message });
}
