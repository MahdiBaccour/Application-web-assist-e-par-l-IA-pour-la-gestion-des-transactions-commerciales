// components/ThemeSwitcher.tsx
"use client";
import { useTheme } from './ThemeProvider';
import { useEffect, useState } from 'react';

const themes = ["light", "dark", "cupcake", "abyss", "valentine", "night", "synthwave", "retro"];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} className="btn gap-1 normal-case">
        Theme
        <svg
          className="w-4 h-4 ml-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <ul className="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-52">
        {themes.map((t) => (
          <li key={t}>
            <button
              onClick={() => setTheme(t)}
              className={`flex items-center justify-between ${theme === t ? 'active' : ''}`}
            >
              {t}
              {theme === t && (
                <span className="badge badge-primary badge-xs"></span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}