import { useState, useEffect } from 'react';
import './CollapsibleSection.css';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  collapseKey?: number; // Cuando cambia, colapsa la sección
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = true,
  collapseKey
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Colapsar cuando cambia collapseKey
  useEffect(() => {
    if (collapseKey !== undefined) {
      setIsExpanded(false);
    }
  }, [collapseKey]);

  return (
    <div className="collapsible-section">
      <button
        className="collapsible-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="collapsible-title">{title}</span>
        <span className={`collapsible-icon ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </span>
      </button>
      {isExpanded && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}
