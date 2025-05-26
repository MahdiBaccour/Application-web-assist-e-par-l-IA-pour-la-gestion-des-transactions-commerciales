'use client';
import { useEffect, useState } from 'react';
import routeCategories from './routeCategories';  

export default function ApiDocumentation() {
  const [theme, setTheme] = useState('light');
  const [selectedCategory, setSelectedCategory] = useState('all');
useEffect(() => {
  const updateTheme = () => {
    const newTheme = localStorage.getItem('theme') || 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Run on initial load
  updateTheme();

  // Listen for custom "themeChange" event
  window.addEventListener('themeChange', updateTheme);

  // Cleanup
  return () => {
    window.removeEventListener('themeChange', updateTheme);
  };
}, []);

  const MethodBadge = ({ method }) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PATCH: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded text-sm font-mono ${colors[method]}`}>
        {method}
      </span>
    );
  };

  const PermissionBadge = ({ role }) => {
    const colors = {
      Owner: 'badge-primary',
      Employee: 'badge-secondary',
      Client: 'badge-accent',
      Public: 'badge-neutral'
    };

    return <span className={`badge ${colors[role]}`}>{role}</span>;
  };

  // Get unique category titles for the dropdown
  const categoryOptions = [
    'all',
    ...new Set(routeCategories.map(cat => cat.title))
  ];

  return (
    <div className="p-6" data-theme={theme}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">API Documentation</h1>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="select select-bordered w-64"
        >
          {categoryOptions.map(option => (
            <option key={option} value={option}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {routeCategories
        .filter(cat => 
          selectedCategory === 'all' || cat.title === selectedCategory
        )
        .map((category) => (
          <div key={category.title} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <h2 className="text-2xl font-semibold">{category.title}</h2>
              <span className="badge badge-lg">{category.basePath}</span>
            </div>

            <div className="grid gap-4">
              {category.routes.map((route) => {
                const uniqueKey = `${category.basePath}-${route.method}-${route.path}`;
                return (
                  <div key={uniqueKey} className="card bg-base-200 shadow">
                    <div className="card-body">
                      <div className="flex items-center gap-4 mb-4">
                        <MethodBadge method={route.method} />
                        <code className="text-lg font-mono">{route.path}</code>
                      </div>

                      <div className="grid gap-2">
                        {route.headers && (
                          <div>
                            <span className="font-semibold">Headers:</span>
                            <div className="mt-1 space-y-1">
                              {route.headers.map((header) => (
                                <code 
                                  key={`${uniqueKey}-header-${header}`} 
                                  className="block bg-base-300 p-2 rounded"
                                >
                                  {header}
                                </code>
                              ))}
                            </div>
                          </div>
                        )}

                        {route.queries && (
                          <div>
                            <span className="font-semibold">Query Parameters:</span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {route.queries.map((query) => (
                                <span 
                                  key={`${uniqueKey}-query-${query}`} 
                                  className="badge badge-outline"
                                >
                                  {query}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {route.body && (
                          <div>
                            <span className="font-semibold">Request Body:</span>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {route.body.map((field) => (
                                <span 
                                  key={`${uniqueKey}-body-${field}`} 
                                  className="badge badge-outline"
                                >
                                  {field.endsWith('?') ? `${field} (optional)` : field}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-semibold">Permissions:</span>
                          <div className="mt-1 flex gap-2">
                            {route.permissions.map((permission) => (
                              <PermissionBadge 
                                key={`${uniqueKey}-perm-${permission}`} 
                                role={permission} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}