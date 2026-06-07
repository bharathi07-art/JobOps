import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface DeleteSuccessModalProps {
  isOpen: boolean;
  recoveryDeadline: Date;
  onClose: () => void;
}

export default function DeleteSuccessModal({
  isOpen,
  recoveryDeadline,
  onClose,
}: DeleteSuccessModalProps) {
  const deadlineStr = new Date(recoveryDeadline).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Account Deletion Initiated</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-900">
                  Your account has entered the recovery period.
                </p>
                <p className="text-sm text-gray-700">
                  Your account data will be retained for 7 days.
                </p>
                <p className="text-sm text-gray-700">
                  If you change your mind, you may request account recovery before:
                </p>
                <p className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-2 rounded">
                  {deadlineStr}
                </p>
                <p className="text-sm text-gray-700">
                  After this date, all data will be permanently deleted.
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> You'll receive an email with recovery instructions. Check your inbox for more details.
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              You will be redirected to the home page in a moment...
            </p>

            <Button onClick={onClose} className="w-full">
              Continue to Home
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
