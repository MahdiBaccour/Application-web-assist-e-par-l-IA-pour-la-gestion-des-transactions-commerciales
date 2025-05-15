// utils/themeUtils.js
export const lightThemes = [
    'light', 'cupcake', 'bumblebee', 'emerald', 'corporate',
    'retro', 'valentine', 'garden', 'lofi', 'pastel',
    'fantasy', 'wireframe', 'cmyk', 'autumn', 'acid',
    'lemonade', 'winter'
  ];
  
  export const darkThemes = [
    'dark', 'synthwave', 'halloween', 'forest', 'aqua',
    'black', 'luxury', 'dracula', 'business', 'night',
    'coffee'
  ];
  
  const themeColors = {
    light: { primary: 'indigo', secondary: 'blue' },
    dark: { primary: 'blue', secondary: 'indigo' },
    cupcake: { primary: 'pink', secondary: 'purple' },
    bumblebee: { primary: 'yellow', secondary: 'orange' },
    emerald: { primary: 'emerald', secondary: 'teal' },
    corporate: { primary: 'blue', secondary: 'indigo' },
    synthwave: { primary: 'purple', secondary: 'pink' },
    retro: { primary: 'orange', secondary: 'amber' },
    cyberpunk: { primary: 'pink', secondary: 'blue' },
    valentine: { primary: 'pink', secondary: 'red' },
    halloween: { primary: 'orange', secondary: 'yellow' },
    garden: { primary: 'green', secondary: 'emerald' },
    forest: { primary: 'green', secondary: 'emerald' },
    aqua: { primary: 'cyan', secondary: 'blue' },
    lofi: { primary: 'gray', secondary: 'black' },
    pastel: { primary: 'pink', secondary: 'purple' },
    fantasy: { primary: 'blue', secondary: 'purple' },
    wireframe: { primary: 'gray', secondary: 'blue' },
    black: { primary: 'gray', secondary: 'black' },
    luxury: { primary: 'gold', secondary: 'yellow' },
    dracula: { primary: 'purple', secondary: 'pink' },
    cmyk: { primary: 'cyan', secondary: 'yellow' },
    autumn: { primary: 'orange', secondary: 'red' },
    business: { primary: 'blue', secondary: 'indigo' },
    acid: { primary: 'lime', secondary: 'green' },
    lemonade: { primary: 'yellow', secondary: 'lime' },
    night: { primary: 'blue', secondary: 'indigo' },
    coffee: { primary: 'brown', secondary: 'orange' },
    winter: { primary: 'blue', secondary: 'cyan' }
  };
  
  export const getThemeConfig = (theme) => ({
    textGradient: `bg-gradient-to-r from-${themeColors[theme]?.primary}-600 to-${themeColors[theme]?.secondary}-500 bg-clip-text text-transparent`,
    primaryColor: `text-${themeColors[theme]?.primary}-600`,
    bgColor: lightThemes.includes(theme) ? 'bg-base-100' : 'bg-base-content',
    textColor: lightThemes.includes(theme) ? 'text-base-content' : 'text-base-100',
    buttonColor: lightThemes.includes(theme) ? 
      `bg-${themeColors[theme]?.primary}-600 text-white` : 
      `bg-${themeColors[theme]?.primary}-800 text-white`
  });