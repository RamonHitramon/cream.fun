import React from 'react';

interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
}

export function LoadingState({ loading, error, onRetry, children }: LoadingStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-hl-primary)' }}></div>
          <p style={{ color: 'var(--color-hl-muted)' }}>Loading markets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-hl-danger)' }}>
            Failed to load markets
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-hl-muted)' }}>
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--color-hl-primary)', 
                color: 'black' 
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
