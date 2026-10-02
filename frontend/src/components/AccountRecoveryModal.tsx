import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button, Input } from '../components/ui';

interface AccountRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

export default function AccountRecoveryModal({
  isOpen,
  onClose,
  initialEmail = '',
}: AccountRecoveryModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [reasonForDeletion, setReasonForDeletion] = useState('');
  const [reasonForRecovery, setReasonForRecovery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [recoveryDeadline, setRecoveryDeadline] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !reasonForRecovery) {
      setError('Email and recovery reason are required.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/account/recovery-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          reasonForDeletion,
          reasonForRecovery,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to submit recovery request');
        setIsLoading(false);
        return;
      }

      setRecoveryDeadline(new Date(data.recoveryDeadline));
      setSuccess(true);
      setEmail('');
      setReasonForDeletion('');
      setReasonForRecovery('');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error submitting recovery request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const deadlineStr = recoveryDeadline
    ? new Date(recoveryDeadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Account Recovery Request</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {success ? (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Recovery Request Submitted</h4>
                    <p className="text-sm text-green-800">
                      Your recovery request has been submitted for review. Our administrators will
                      evaluate your request within 24 hours.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Recovery Deadline:</strong>
                  </p>
                  <p className="text-lg font-semibold text-blue-900">{deadlineStr}</p>
                  <p className="text-xs text-blue-700 mt-2">
                    Your request must be approved before this date.
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <p>You will receive an email notification when:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your request has been approved (account restored)</li>
                    <li>Your request has been rejected (account remains scheduled for deletion)</li>
                  </ul>
                </div>

                <Button onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  If you recently deleted your JobOps account and would like access before the 7-day
                  recovery period ends, submit a recovery request for administrator review.
                </p>

                {error && (
                  <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Email Address (Deleted Account Email)
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Reason For Deletion (Optional)
                  </label>
                  <textarea
                    value={reasonForDeletion}
                    onChange={(e) => setReasonForDeletion(e.target.value)}
                    placeholder="Why did you delete your account?"
                    disabled={isLoading}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Reason For Recovery
                  </label>
                  <textarea
                    value={reasonForRecovery}
                    onChange={(e) => setReasonForRecovery(e.target.value)}
                    placeholder="Tell us why you would like your account restored..."
                    disabled={isLoading}
                    rows={4}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-2 focus:ring-[#FF4500]/10 resize-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 flex gap-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={isLoading} className="flex-1">
                    Submit Recovery Request
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
