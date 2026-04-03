import React from 'react';
import './Card.css';

export default function Card({ children, title, subtitle, variant = 'standard', padding = '24px' }) {
  return (
    <div className={`aw-card aw-card--${variant}`} style={{ padding }}>
      {(title || subtitle) && (
          <div className="aw-card-header">
            {title && <h3 className="aw-card-title">{title}</h3>}
            {subtitle && <p className="aw-card-subtitle">{subtitle}</p>}
          </div>
      )}
      <div className="aw-card-body">
        {children}
      </div>
    </div>
  );
}
