import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  currentPlan: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  currentPlan,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationModalProps) {
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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Delete Your Account</h3>
              </div>
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600">
                You are currently using the <strong>{currentPlan} Plan</strong>.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-medium text-gray-900">If you continue:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Your account will enter a 7-day recovery period.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>During this period you cannot create a new account using the same email.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>You may request account recovery through JobOps.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>Recovery requests are reviewed by administrators.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>If approved, your account and all data will be restored.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 font-bold">•</span>
                    <span>
                      After 7 days, all account data will be permanently deleted and cannot be recovered.
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-sm font-medium text-gray-900">Would you like to continue?</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                disabled={isLoading}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                loading={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Delete Account
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
