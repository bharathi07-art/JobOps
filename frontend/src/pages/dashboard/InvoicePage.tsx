import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, CheckCircle, FileText, Landmark } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Transaction {
  id: number;
  planName: string;
  action: string;
  amount: number;
  status: string;
  createdAt: string;
  transactionId: string;
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return { name: 'Customer', email: '' };
    const parsed = JSON.parse(raw);
    const u = parsed?.user ?? parsed?.User ?? parsed;
    return {
      name: u?.name || 'Customer',
      email: u?.email || '',
    };
  } catch {
    return { name: 'Customer', email: '' };
  }
}

const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (token) return token;
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo)?.token : null;
  } catch {
    return null;
  }
};

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const user = getStoredUser();
  const [transaction, setTransaction] = useState<Transaction | null>(
    location.state?.transaction || null
  );
  const [loading, setLoading] = useState(!transaction);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transaction && id) {
      const fetchTransaction = async () => {
        try {
          const token = getAuthToken();
          if (!token) {
            setError('Unauthorized. Please log in again.');
            setLoading(false);
            return;
          }
          const response = await fetch('/api/subscription/history', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch transaction history');
          }
          const data = await response.json();
          const foundTx = data.find(
            (tx: Transaction) => String(tx.transactionId) === id || String(tx.id) === id
          );
          if (foundTx) {
            setTransaction(foundTx);
          } else {
            setError('Invoice not found');
          }
        } catch (err) {
          setError('Failed to load invoice details');
        } finally {
          setLoading(false);
        }
      };
      fetchTransaction();
    }
  }, [id, transaction]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-100 border-t-[#FF4500] rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Could Not Load Invoice</h2>
          <p className="text-sm text-gray-500 mb-6">{error || 'Invoice details are missing.'}</p>
          <Button onClick={() => navigate('/dashboard/billing')} className="w-full">
            Back to Billing
          </Button>
        </div>
      </div>
    );
  }

  const invoiceDate = new Date(transaction.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedAmount = `$${transaction.amount?.toFixed(2) || '0.00'}`;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Stylesheet specifically for printing formatting */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .print-title {
            color: black !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top toolbar - hidden on print */}
        <div className="no-print flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-gray-200 shadow-sm">
          <button
            onClick={() => navigate('/dashboard/billing')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Billing
          </button>
          
          <Button
            onClick={handlePrint}
            variant="primary"
            className="flex items-center gap-2 bg-[#FF4500] hover:bg-[#e03e00]"
          >
            <Printer className="w-4 h-4" />
            Download PDF / Print
          </Button>
        </div>

        {/* Invoice Page Container */}
        <div className="print-card bg-white rounded-2xl border border-gray-200 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {/* Decorative side accent - hidden on print */}
          <div className="no-print absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF4500] to-orange-400" />

          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-gray-200">
            <div>
              {/* Logo / App Name */}
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-[#FF4500] rounded-xl flex items-center justify-center shrink-0">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">JobOps</span>
              </div>
              <p className="text-xs text-gray-400">Professional Careers & Matchmaking</p>
            </div>

            <div className="text-left sm:text-right">
              <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wider mb-2 print-title">
                Invoice
              </h1>
              <p className="text-sm font-semibold text-gray-500">
                Invoice ID: <span className="text-gray-800 font-mono">{transaction.transactionId || `TX-${transaction.id}`}</span>
              </p>
            </div>
          </div>

          {/* Addresses and Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-8 border-b border-gray-200">
            {/* From */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</p>
              <p className="text-base font-bold text-gray-800">JobOps, Inc.</p>
              <div className="text-sm text-gray-500 leading-relaxed">
                <p>100 Innovation Way, Suite 400</p>
                <p>San Francisco, CA 94107</p>
                <p className="mt-1 font-medium text-gray-700">billing@jobops.co</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="space-y-2 sm:text-left">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bill To</p>
              <p className="text-base font-bold text-gray-800">{user.name}</p>
              <div className="text-sm text-gray-500 leading-relaxed">
                <p>{user.email}</p>
                <p className="mt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment Details</p>
                <p>Method: <span className="font-semibold text-gray-800">PayPal</span></p>
                <p>Date: <span className="font-semibold text-gray-800">{invoiceDate}</span></p>
              </div>
            </div>
          </div>

          {/* Billing Info Table */}
          <div className="py-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="text-left pb-3 w-3/5">Description</th>
                    <th className="text-center pb-3 w-1/5">Qty</th>
                    <th className="text-right pb-3 w-1/5">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="text-sm text-gray-800">
                    <td className="py-4 font-medium">
                      JobOps Premium Subscription — {transaction.planName} Plan
                      <span className="block text-xs text-gray-400 font-normal mt-0.5 capitalize">
                        Action: {transaction.action}
                      </span>
                    </td>
                    <td className="py-4 text-center">1</td>
                    <td className="py-4 text-right font-semibold">{formattedAmount}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="flex flex-col items-end pt-6 border-t border-gray-200">
            <div className="w-full sm:w-80 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{formattedAmount}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax (0%)</span>
                <span>$0.00</span>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-base font-bold text-gray-900">Total Paid</span>
                <span className="text-xl font-black text-gray-900">{formattedAmount}</span>
              </div>

              {/* Status Badge */}
              <div className="flex justify-between items-center pt-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</span>
                <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Paid / Completed
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-gray-100 text-center space-y-1.5">
            <p className="text-sm font-semibold text-gray-700">Thank you for your business!</p>
            <p className="text-xs text-gray-400">
              If you have any questions regarding this invoice, please contact our support team at <span className="font-semibold text-gray-600">billing@jobops.co</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
