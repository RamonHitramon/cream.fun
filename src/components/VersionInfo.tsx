'use client';

import React, { useState } from 'react';
import { getVersionInfo, getVersionString } from '@/lib/version';

interface VersionInfoProps {
  className?: string;
  showDetails?: boolean;
}

export function VersionInfo({ className = '', showDetails = false }: VersionInfoProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const versionInfo = getVersionInfo();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getEnvironmentColor = (env: string) => {
    switch (env) {
      case 'production': return 'text-green-600';
      case 'preview': return 'text-yellow-600';
      case 'development': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`text-xs ${className}`} style={{ color: 'var(--color-hl-muted)' }}>
      <div className="flex items-center gap-2">
        <span>{getVersionString()}</span>
        <span className={`px-1 py-0.5 rounded text-xs font-medium ${getEnvironmentColor(versionInfo.environment)}`}>
          {versionInfo.environment}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs underline hover:no-underline"
        >
          {isExpanded ? 'hide' : 'info'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs space-y-1">
          <div><strong>Build:</strong> {versionInfo.buildNumber}</div>
          <div><strong>Date:</strong> {formatDate(versionInfo.buildDate)}</div>
          <div><strong>Commit:</strong> {versionInfo.gitCommit.slice(0, 8)}</div>
          <div><strong>Environment:</strong> {versionInfo.environment}</div>
          
          <div className="mt-2">
            <strong>Features:</strong>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {Object.entries(versionInfo.features).map(([key, enabled]) => (
                <div key={key} className={`flex items-center gap-1 ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className="w-1 h-1 rounded-full bg-current"></span>
                  <span className="text-xs">{key.replace(/_/g, ' ').toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

