'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color: string;
}

export function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e9ecef',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: '14px',
              color: '#6c757d',
              fontWeight: '500',
              marginBottom: '8px',
            }}
          >
            {title}
          </p>
          <h3
            style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a1a2e',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {value}
          </h3>
          {trend && (
            <p
              style={{
                fontSize: '12px',
                color: '#10b981',
                marginTop: '8px',
                fontWeight: '500',
              }}
            >
              {trend}
            </p>
          )}
        </div>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={28} color={color} strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
