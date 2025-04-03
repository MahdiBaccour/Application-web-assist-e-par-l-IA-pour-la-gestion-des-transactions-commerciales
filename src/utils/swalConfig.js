import Swal from "sweetalert2";

// Function to get theme-based styles
const getSwalTheme = (theme) => {
  const themes = {
    light: {
      background: "#FFFFFF",
      color: "#000000",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      border: "border-gray-300",
    },
    dark: {
      background: "#1E1E1E",
      color: "#FFFFFF",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      border: "border-gray-700",
    },
    cupcake: {
      background: "#FCE7F3",
      color: "#6B7280",
      confirmButtonColor: "#D946EF",
      cancelButtonColor: "#9333EA",
      border: "border-pink-300",
    },
    abyss: {
      background: "#121C32",
      color: "#D1D5DB",
      confirmButtonColor: "#2563EB",
      cancelButtonColor: "#EF4444",
      border: "border-blue-900",
    },
    valentine: {
      background: "#FFD1DC",
      color: "#6B7280",
      confirmButtonColor: "#FF69B4",
      cancelButtonColor: "#D61C4E",
      border: "border-pink-500",
    },
    night: {
      background: "#0F172A",
      color: "#E2E8F0",
      confirmButtonColor: "#2563EB",
      cancelButtonColor: "#DC2626",
      border: "border-gray-800",
    },
    synthwave: {
      background: "#2D0634",
      color: "#FF00FF",
      confirmButtonColor: "#FF00FF",
      cancelButtonColor: "#FF4500",
      border: "border-purple-500",
    },
  };

  return themes[theme] || themes.light; // Default to light theme
};

// Function to get a configured SweetAlert instance
export const getSwalInstance = (theme) => {
  const themeStyles = getSwalTheme(theme);

  return Swal.mixin({
    background: themeStyles.background,
    color: themeStyles.color,
    confirmButtonColor: themeStyles.confirmButtonColor,
    cancelButtonColor: themeStyles.cancelButtonColor,
    customClass: {
      popup: `rounded-xl shadow-2xl border ${themeStyles.border}`,
      confirmButton: "px-4 py-2 rounded-lg font-medium",
      cancelButton: "px-4 py-2 rounded-lg font-medium",
    },
  });
};

// Success Alert
export const showSuccessAlert = (theme, message = "Operation completed successfully!") => {
  return getSwalInstance(theme).fire({
    title: "Success",
    text: message,
    icon: "success",
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
  });
};

// Error Alert
export const showErrorAlert = (theme, message = "An error occurred!") => {
  return getSwalInstance(theme).fire({
    title: "Error",
    text: message,
    icon: "error",
    confirmButtonText: "OK",
  });
};

// Confirmation Dialog
export const showConfirmationDialog = (theme, options = {}) => {
  return getSwalInstance(theme).fire({
    title: options.title || "Are you sure?",
    text: options.text || "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: options.confirmText || "Yes, proceed",
    cancelButtonText: options.cancelText || "Cancel",
    reverseButtons: true,
    focusConfirm: false,
    focusCancel: true,
    ...options,
  });
};