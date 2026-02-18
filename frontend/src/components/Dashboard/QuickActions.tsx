'use client';

import { useRouter } from 'next/navigation';
import { Plus, Workflow, BookOpen } from 'lucide-react';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Create New Pipeline',
      description: 'Build a new workflow from scratch',
      icon: Plus,
      color: '#667eea',
      action: () => router.push('/pipelines'),
    },
    {
      title: 'View All Pipelines',
      description: 'Browse and manage your pipelines',
      icon: Workflow,
      color: '#764ba2',
      action: () => router.push('/pipelines'),
    },
    {
      title: 'Browse Templates',
      description: 'Start with pre-built templates',
      icon: BookOpen,
      color: '#f093fb',
      action: () => router.push('/pipelines'),
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '24px',
      }}
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.action}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '24px',
              border: `2px solid ${action.color}20`,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${action.color}30`;
              e.currentTarget.style.borderColor = action.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${action.color}20`;
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${action.color}15, ${action.color}30)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Icon size={24} color={action.color} strokeWidth={2} />
            </div>
            <h3
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1a1a2e',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              {action.title}
            </h3>
            <p
              style={{
                fontSize: '14px',
                color: '#6c757d',
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              {action.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
