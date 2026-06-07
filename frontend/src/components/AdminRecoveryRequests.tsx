import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Clock, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/index';
import { cn } from '../utils/utils';

interface RecoveryRequest {
  id: number;
  email: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  deletedDate: string;
  recoveryDeadlineDate: string;
  reasonForDeletion?: string;
  reasonForRecovery: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
}

export default function AdminRecoveryRequests() {
  const [requests, setRequests] = useState<RecoveryRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchRecoveryRequests();
  }, [statusFilter]);

  const fetchRecoveryRequests = async () => {
    try {
      setIsLoading(true);
      const raw = localStorage.getItem('userInfo');
      const token = raw ? JSON.parse(raw)?.token : null;

      const status = statusFilter === 'All' ? '' : statusFilter;
      const url = `/api/account/recovery-requests?${status ? `status=${status}` : ''}`;

      const res = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to fetch recovery requests');
        return;
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError('Error fetching recovery requests');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      const raw = localStorage.getItem('userInfo');
      const token = raw ? JSON.parse(raw)?.token : null;

      const res = await fetch('/api/account/recovery-request/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to approve request');
        return;
      }

      // Update local state
      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: 'Approved' } : r
        )
      );
      alert('Recovery request approved successfully');
    } catch (err) {
      alert('Error approving request');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      const raw = localStorage.getItem('userInfo');
      const token = raw ? JSON.parse(raw)?.token : null;

      const res = await fetch('/api/account/recovery-request/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to reject request');
        return;
      }

      // Update local state
      setRequests(
        requests.map((r) =>
          r.id === requestId ? { ...r, status: 'Rejected' } : r
        )
      );
      alert('Recovery request rejected');
    } catch (err) {
      alert('Error rejecting request');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter((r) =>
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusColors = {
    Pending: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: Clock },
    Approved: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: CheckCircle2 },
    Rejected: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account Recovery Requests</h2>
        <p className="text-gray-500 mt-1">Manage user account recovery requests</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                statusFilter === status
                  ? 'bg-[#FF4500] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-100 border-t-[#FF4500] rounded-full animate-spin" />
        </div>
      )}

      {/* Requests List */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No recovery requests found</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const statusConfig = statusColors[request.status];
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedId === request.id;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'border rounded-lg p-4 transition-all',
                    statusConfig.bg,
                    statusConfig.border
                  )}
                >
                  <div
                    className="cursor-pointer flex items-start justify-between"
                    onClick={() => setExpandedId(isExpanded ? null : request.id)}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn('mt-0.5', statusConfig.text)}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 break-all">{request.email}</p>
                          <span
                            className={cn(
                              'text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap',
                              statusConfig.text,
                              statusConfig.bg
                            )}
                          >
                            {request.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-gray-700">
                          <div>
                            <span className="font-medium">Deleted:</span> {new Date(request.deletedDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Deadline:</span>{' '}
                            {new Date(request.recoveryDeadlineDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Requested:</span>{' '}
                            {new Date(request.createdAt).toLocaleDateString()}
                          </div>
                          {request.reviewedAt && (
                            <div>
                              <span className="font-medium">Reviewed:</span>{' '}
                              {new Date(request.reviewedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 transition-transform flex-shrink-0',
                        isExpanded && 'rotate-180',
                        statusConfig.text
                      )}
                    />
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-4"
                    >
                      {request.reasonForDeletion && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Reason for Deletion:</p>
                          <p className="text-sm text-gray-600 bg-white/50 p-2 rounded">
                            {request.reasonForDeletion}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Reason for Recovery:</p>
                        <p className="text-sm text-gray-600 bg-white/50 p-2 rounded">
                          {request.reasonForRecovery}
                        </p>
                      </div>

                      {request.status === 'Pending' && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleApprove(request.id)}
                            loading={actionLoading === request.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request.id)}
                            loading={actionLoading === request.id}
                            className="flex-1 bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
