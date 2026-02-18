'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';

export default function AdminPage() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute adminOnly>
      <div className="container">
        <h1>Admin Panel</h1>
        <p>Welcome to the admin panel, {user?.name}!</p>
        <p>This page is only accessible to administrators.</p>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h2>Admin Features</h2>
          <ul>
            <li>Manage all users</li>
            <li>View all items</li>
            <li>System configuration</li>
            <li>Reports and analytics</li>
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}
