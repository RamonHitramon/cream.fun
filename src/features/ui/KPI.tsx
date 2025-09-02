import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  color?: 'default' | 'success' | 'danger';
  onClick?: () => void;
}

export function KPICard({ title, value, color = 'default', onClick }: KPICardProps) {
  const colorStyles = {
    default: { color: 'var(--color-hl-text)' },
    success: { color: 'var(--color-hl-success)' },
    danger: { color: 'var(--color-hl-danger)' }
  };

  return (
    <div 
      className={`card p-4 cursor-pointer hover:opacity-90 transition-opacity ${onClick ? '' : 'cursor-default'}`}
      onClick={onClick}
    >
      <div className="text-xs mb-1" style={{ color: 'var(--color-hl-muted)' }}>{title}</div>
      <div className="text-lg font-bold" style={colorStyles[color]}>{value}</div>
    </div>
  );
}

interface KPIPanelProps {
  data: Array<{
    title: string;
    value: string;
    color?: 'default' | 'success' | 'danger';
    onClick?: () => void;
  }>;
}

export function KPIPanel({ data }: KPIPanelProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {data.map((item, index) => (
        <div key={index} className="flex-1 min-w-[140px]">
          <KPICard
            title={item.title}
            value={item.value}
            color={item.color}
            onClick={item.onClick}
          />
        </div>
      ))}
    </div>
  );
}
