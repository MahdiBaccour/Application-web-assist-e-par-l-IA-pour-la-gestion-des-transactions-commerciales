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
  bumblebee: {
    background: "#FDE68A",
    color: "#1F2937",
    confirmButtonColor: "#F59E0B",
    cancelButtonColor: "#B91C1C",
    border: "border-yellow-400",
  },
  emerald: {
    background: "#D1FAE5",
    color: "#065F46",
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#B91C1C",
    border: "border-green-300",
  },
  corporate: {
    background: "#E5E7EB",
    color: "#1F2937",
    confirmButtonColor: "#3B82F6",
    cancelButtonColor: "#EF4444",
    border: "border-gray-400",
  },
  retro: {
    background: "#FAF089",
    color: "#1A202C",
    confirmButtonColor: "#F6AD55",
    cancelButtonColor: "#E53E3E",
    border: "border-yellow-500",
  },
  cyberpunk: {
    background: "#FF00FF",
    color: "#00FFFF",
    confirmButtonColor: "#00FFFF",
    cancelButtonColor: "#FF5555",
    border: "border-pink-500",
  },
  halloween: {
    background: "#1A202C",
    color: "#FBBF24",
    confirmButtonColor: "#F59E0B",
    cancelButtonColor: "#DC2626",
    border: "border-orange-600",
  },
  garden: {
    background: "#DEF7EC",
    color: "#1F2937",
    confirmButtonColor: "#34D399",
    cancelButtonColor: "#EF4444",
    border: "border-green-200",
  },
  forest: {
    background: "#064E3B",
    color: "#D1FAE5",
    confirmButtonColor: "#059669",
    cancelButtonColor: "#DC2626",
    border: "border-green-800",
  },
  aqua: {
    background: "#E0F2FE",
    color: "#0369A1",
    confirmButtonColor: "#06B6D4",
    cancelButtonColor: "#EF4444",
    border: "border-blue-200",
  },
  lofi: {
    background: "#F3F4F6",
    color: "#111827",
    confirmButtonColor: "#4B5563",
    cancelButtonColor: "#9CA3AF",
    border: "border-gray-400",
  },
  pastel: {
    background: "#FFE4E6",
    color: "#1E293B",
    confirmButtonColor: "#F472B6",
    cancelButtonColor: "#EF4444",
    border: "border-pink-300",
  },
  fantasy: {
    background: "#F0E7FF",
    color: "#6B21A8",
    confirmButtonColor: "#9333EA",
    cancelButtonColor: "#E11D48",
    border: "border-purple-300",
  },
  wireframe: {
    background: "#FFFFFF",
    color: "#000000",
    confirmButtonColor: "#4B5563",
    cancelButtonColor: "#9CA3AF",
    border: "border-black",
  },
  black: {
    background: "#000000",
    color: "#FFFFFF",
    confirmButtonColor: "#FACC15",
    cancelButtonColor: "#F87171",
    border: "border-gray-900",
  },
  luxury: {
    background: "#1F2937",
    color: "#D1D5DB",
    confirmButtonColor: "#FFD700",
    cancelButtonColor: "#DC2626",
    border: "border-yellow-600",
  },
  dracula: {
    background: "#282A36",
    color: "#F8F8F2",
    confirmButtonColor: "#BD93F9",
    cancelButtonColor: "#FF5555",
    border: "border-purple-700",
  },
  cmyk: {
    background: "#FAFAFA",
    color: "#333333",
    confirmButtonColor: "#00ADEF",
    cancelButtonColor: "#EC008C",
    border: "border-gray-300",
  },
  autumn: {
    background: "#FFF7ED",
    color: "#7C2D12",
    confirmButtonColor: "#EA580C",
    cancelButtonColor: "#DC2626",
    border: "border-orange-300",
  },
  business: {
    background: "#F3F4F6",
    color: "#111827",
    confirmButtonColor: "#2563EB",
    cancelButtonColor: "#B91C1C",
    border: "border-gray-500",
  },
  acid: {
    background: "#D1FAE5",
    color: "#065F46",
    confirmButtonColor: "#84CC16",
    cancelButtonColor: "#DC2626",
    border: "border-lime-500",
  },
  lemonade: {
    background: "#FEF9C3",
    color: "#92400E",
    confirmButtonColor: "#FBBF24",
    cancelButtonColor: "#DC2626",
    border: "border-yellow-400",
  },
  coffee: {
    background: "#C7A17A",
    color: "#3E2C1C",
    confirmButtonColor: "#6B4226",
    cancelButtonColor: "#D97706",
    border: "border-yellow-900",
  },
  winter: {
    background: "#E0F2FE",
    color: "#0C4A6E",
    confirmButtonColor: "#3B82F6",
    cancelButtonColor: "#EF4444",
    border: "border-blue-300",
  },
  dim: {
    background: "#1F2937",
    color: "#D1D5DB",
    confirmButtonColor: "#6366F1",
    cancelButtonColor: "#EF4444",
    border: "border-gray-700",
  },
  nord: {
    background: "#2E3440",
    color: "#D8DEE9",
    confirmButtonColor: "#88C0D0",
    cancelButtonColor: "#BF616A",
    border: "border-blue-900",
  },
  sunset: {
    background: "#FEE2E2",
    color: "#7C2D12",
    confirmButtonColor: "#FB923C",
    cancelButtonColor: "#DC2626",
    border: "border-orange-500",
  }
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