'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/Layout/AppLayout';
import { StatsCard } from '@/components/Dashboard/StatsCard';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { useAuthStore } from '@/store/authStore';
import { usePipelinesStore } from '@/store/pipelineStore';
import { Workflow, Activity, Play, Clock, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { pipelines, fetchPipelines, isLoading } = usePipelinesStore();

  useEffect(() => {
    fetchPipelines();
  }, []);

  const stats = {
    totalPipelines: pipelines.length,
    activePipelines: pipelines.filter((p) => p.isActive).length,
    totalExecutions: pipelines.reduce((sum, p) => sum + p.executionCount, 0),
    recentPipelines: pipelines.slice(0, 5),
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div
          style={{
            padding: '40px',
            minHeight: '100vh',
          }}
        >
          {/* Hero Section */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '40px',
              marginBottom: '32px',
              color: '#fff',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            }}
          >
            <h1
              style={{
                fontSize: '36px',
                fontWeight: '700',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              Welcome back, {user?.name || user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>
              Manage your financial pipelines and automate your workflows
            </p>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '40px',
            }}
          >
            <StatsCard
              title="Total Pipelines"
              value={stats.totalPipelines}
              icon={Workflow}
              color="#667eea"
              trend={`${stats.activePipelines} active`}
            />
            <StatsCard
              title="Active Pipelines"
              value={stats.activePipelines}
              icon={Activity}
              color="#10b981"
            />
            <StatsCard
              title="Total Executions"
              value={stats.totalExecutions}
              icon={Play}
              color="#f59e0b"
            />
            <StatsCard
              title="Last 24 Hours"
              value={pipelines.filter((p) => p.lastExecutedAt).length}
              icon={Clock}
              color="#8b5cf6"
            />
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '40px' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1a1a2e',
                marginBottom: '20px',
              }}
            >
              Quick Actions
            </h2>
            <QuickActions />
          </div>

          {/* Recent Pipelines */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#1a1a2e',
                  margin: 0,
                }}
              >
                Recent Pipelines
              </h2>
              <button
                onClick={() => router.push('/pipelines')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#667eea',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            {isLoading ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '40px',
                  textAlign: 'center',
                  color: '#6c757d',
                }}
              >
                Loading pipelines...
              </div>
            ) : stats.recentPipelines.length === 0 ? (
              <div
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  border: '2px dashed #e9ecef',
                }}
              >
                <Workflow
                  size={48}
                  color="#e9ecef"
                  style={{ marginBottom: '16px' }}
                />
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#6c757d',
                    marginBottom: '8px',
                  }}
                >
                  No pipelines yet
                </h3>
                <p style={{ color: '#adb5bd', marginBottom: '20px' }}>
                  Create your first pipeline to get started!
                </p>
                <button
                  onClick={() => router.push('/pipelines')}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Create Pipeline
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentPipelines.map((pipeline) => (
                  <div
                    key={pipeline._id}
                    onClick={() => router.push(`/pipelines/${pipeline._id}`)}
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid #e9ecef',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1a1a2e',
                          margin: 0,
                          marginBottom: '4px',
                        }}
                      >
                        {pipeline.name}
                      </h3>
                      {pipeline.description && (
                        <p
                          style={{
                            fontSize: '14px',
                            color: '#6c757d',
                            margin: 0,
                            marginBottom: '8px',
                          }}
                        >
                          {pipeline.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                        <span style={{ color: '#6c757d' }}>
                          {pipeline.isActive ? (
                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                              ● Active
                            </span>
                          ) : (
                            <span style={{ color: '#6c757d' }}>○ Inactive</span>
                          )}
                        </span>
                        <span style={{ color: '#6c757d' }}>
                          {pipeline.executionCount} executions
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={20} color="#667eea" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
