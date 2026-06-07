import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import AccountRecoveryModal from '../components/AccountRecoveryModal';

export default function RecoverAccountPage() {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(true);
  const initialEmail = searchParams.get('email') || '';

  useEffect(() => {
    // If modal is closed and no email parameter, go back to register
    if (!isOpen && !initialEmail) {
      window.location.href = '/register';
    }
  }, [isOpen, initialEmail]);

  return (
    <div className="min-h-screen bg-[#FFF8F4] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-orange-50 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 text-sm text-[#FF4500] hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registration
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-9 h-9 bg-[#FF4500] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JobOps</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Restore Your Account</h1>
            <p className="text-gray-500 mt-1 text-sm">
              If you deleted your account, you can request recovery during the 7-day period.
            </p>
          </div>
        </div>
      </motion.div>

      <AccountRecoveryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialEmail={initialEmail}
      />
    </div>
  );
}
