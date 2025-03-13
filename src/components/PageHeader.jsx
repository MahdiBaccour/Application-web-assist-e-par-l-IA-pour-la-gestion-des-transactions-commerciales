import React from 'react';

function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h1 className="text-3xl font-bold">{title}</h1>
      {subtitle && <p className="text-gray-500">{subtitle}</p>}
    </div>
  );
}

export default PageHeader;
