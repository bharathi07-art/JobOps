import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/index';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import DeleteSuccessModal from './DeleteSuccessModal';

interface DeleteAccountSectionProps {
  currentPlan: string;
}

export default function DeleteAccountSection({ currentPlan }: DeleteAccountSectionProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recoveryDeadline, setRecoveryDeadline] = useState<Date | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const raw = localStorage.getItem('userInfo');
      const token = raw ? JSON.parse(raw)?.token : null;

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Failed to delete account');
        setIsDeleting(false);
        return;
      }

      // Show success message
      setRecoveryDeadline(new Date(data.recoveryDeadline));
      setShowConfirmation(false);
      setShowSuccess(true);

      // Logout after 3 seconds
      setTimeout(() => {
        localStorage.removeItem('userInfo');
        window.location.href = '/';
      }, 3000);
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="p-6 mt-6 border-l-4 border-l-red-500 bg-red-50">
        <div className="flex items-start gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Danger Zone</h3>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Delete Account</h4>
            <p className="text-sm text-gray-600">
              Deleting your account will start a 7-day recovery period. During this period you can request account restoration. After 7 days, all account data will be permanently removed.
            </p>
          </div>

          <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> This action cannot be undone immediately. You will have 7 days to recover your account.
            </p>
          </div>

          <Button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete My Account'}
          </Button>
        </div>
      </Card>

      <DeleteConfirmationModal
        isOpen={showConfirmation}
        currentPlan={currentPlan}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowConfirmation(false)}
        isLoading={isDeleting}
      />

      {recoveryDeadline && (
        <DeleteSuccessModal
          isOpen={showSuccess}
          recoveryDeadline={recoveryDeadline}
          onClose={() => {
            setShowSuccess(false);
            // Logout and redirect
            localStorage.removeItem('userInfo');
            window.location.href = '/';
          }}
        />
      )}
    </>
  );
}
