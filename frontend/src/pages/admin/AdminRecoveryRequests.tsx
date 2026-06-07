import { AdminLayout } from '../../components/layout/AdminLayout';
import AdminRecoveryRequests from '../../components/AdminRecoveryRequests';

export default function AdminRecoveryRequestsPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdminRecoveryRequests />
      </div>
    </AdminLayout>
  );
}
