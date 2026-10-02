import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, Download, RotateCcw, AlertCircle, Check, ShieldCheck, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PremiumBadge, SubscriptionStatusBar, UsageLimitIndicator } from '../components/PremiumComponents';
import { BarChart } from '../components/ui/AdminCharts';
import {Link} from 'react-router-dom';
import {Sparkles, X, Menu} from 'lucide-react'



interface Subscription {
  subscriptionPlan: string;
  subscriptionStatus: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  billingCycle: string;
  autoRenew: boolean;
  aiSearchesUsed: number;
  maxAISearches: number;
  savedJobsCount: number;
  maxSavedJobs: number;
  resumeUploadsCount: number;
  maxResumeUploads: number;
}

interface Transaction {
  id: number;
  planName: string;
  action: string;
  amount: number;
  status: string;
  createdAt: string;
  transactionId: string;
}

interface Analytics {
  totalAISearches: number;
  totalJobsSaved: number;
  totalResumesUploaded: number;
  totalQuestionsAsked: number;
  dailyData: any[];
}

export default function SubscriptionManagement() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const planParam = searchParams.get('plan');

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Payment checkout states
  const [paymentType, setPaymentType] = useState<'card' | 'paypal'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ transactionId: string | number } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false)

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

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const [subRes, transRes, analyticsRes] = await Promise.all([
        fetch('/api/subscription/current', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/subscription/history', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/subscription/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let subData = null;
      let transData = [];
      let analyticsData = null;

      if (subRes.ok) subData = await subRes.json();
      if (transRes.ok) transData = await transRes.json();
      if (analyticsRes.ok) analyticsData = await analyticsRes.json();

      setSubscription(subData);
      setTransactions(transData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setShowCancelModal(false);
        fetchSubscriptionData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    const formatted = value.length > 2 ? `${value.substring(0, 2)}/${value.substring(2)}` : value;
    setCardExpiry(formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setCardCvv(value);
  };

  const handlePaypalCheckout = async () => {
    setIsProcessing(true);
    setPaymentError(null);
    try {
      const token = getAuthToken();
      if (!token) { setPaymentError('Session expired. Please log in again.'); return; }
      const res = await fetch('/api/payment/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planParam }),
      });
      const data = await res.json();
      if (!res.ok || !data.approvalUrl) {
        setPaymentError(data.message || 'Failed to initiate PayPal checkout.');
        return;
      }
      window.location.href = data.approvalUrl;
    } catch {
      setPaymentError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentType === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setPaymentError('Invalid Card Number. Must be 16 digits.');
        return;
      }
      if (cardExpiry.length < 5) {
        setPaymentError('Invalid Expiry Date. Format MM/YY.');
        return;
      }
      if (cardCvv.length < 3) {
        setPaymentError('Invalid CVV. Must be 3 digits.');
        return;
      }
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setPaymentError('Session expired. Please log in again.');
        setIsProcessing(false);
        return;
      }

      // Simulation for premium user experience
      await new Promise(resolve => setTimeout(resolve, 2000));

      const res = await fetch('/api/payment/Success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subscriptionId: 'SUB-' + Math.floor(10000000 + Math.random() * 90000000),
          plan: planParam,
          billingCycle: planParam === 'Yearly' ? 'Yearly' : 'Monthly',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPaymentError(data.message || 'Payment processing failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Update localStorage so the rest of the application reflects the premium plan
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.plan = planParam;
        if (parsed.user) parsed.user.plan = planParam;
        localStorage.setItem('userInfo', JSON.stringify(parsed));
      }
      window.dispatchEvent(new Event('userInfoUpdated'));

      setPaymentSuccessData({
        transactionId: data.transactionId || 'TX-' + Math.floor(Math.random() * 1000000),
      });
    } catch (err) {
      console.error(err);
      setPaymentError('Network error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-[#FF4500]">
          <RotateCcw className="w-8 h-8" />
        </div>
      </div>
    );
  }

  // Checkout Upgrade view
  if (planParam && ['Monthly', 'Yearly'].includes(planParam)) {
    const planDetails = planParam === 'Yearly' ? {
      name: 'Yearly Plan',
      price: '$250/year',
      features: [
        '2 AI searches per day',
        'Unlimited yearly usage',
        'Advanced AI analysis & feedback',
        'ATS optimization & scoring',
        'Personalized AI career roadmap',
        'Priority email support'
      ]
    } : {
      name: 'Monthly Plan',
      price: '$25/month',
      features: [
        '2 AI searches per day',
        'Unlimited monthly usage',
        'Advanced AI analysis & feedback',
        'ATS optimization & scoring',
        'Priority email support'
      ]
    };
    

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF8F4] to-white pb-20">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF4500] to-orange-400 text-white px-6 py-12">
          <h1 className="text-4xl font-bold mb-2">Secure Checkout</h1>
          <p className="text-white/90">Activate your {planDetails.name} and unlock full platform capabilities</p>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-8">
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back to plans
          </button>

          {paymentSuccessData ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto bg-white border border-gray-200 rounded-3xl p-8 shadow-xl text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-6 border border-green-200 shadow-sm">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Your <span className="font-bold text-gray-800">{planParam}</span> subscription has been activated successfully. Your receipt is ready for download.
              </p>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate(`/dashboard/invoice/${paymentSuccessData.transactionId}`)}
                  variant="primary"
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3 shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" /> Download Paid Receipt
                </Button>

                <Button
                  onClick={() => {
                    setSearchParams({});
                    setPaymentSuccessData(null);
                    fetchSubscriptionData();
                  }}
                  variant="ghost"
                  className="w-full text-gray-600 hover:bg-gray-50 border border-gray-200"
                >
                  View My Subscription
                </Button>

                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="ghost"
                  className="w-full text-[#FF4500] hover:bg-orange-50"
                >
                  Go to Dashboard
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-5 gap-8 items-start">
              {/* Plan Details Card */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">You Selected</h3>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{planDetails.name}</h2>
                <div className="text-2xl font-black text-[#FF4500] mb-4">{planDetails.price}</div>
                <div className="border-t border-gray-100 my-4" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Plan Benefits</h4>
                <ul className="space-y-2.5">
                  {planDetails.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Checkout Form Card */}
              <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Select Payment Method</h3>

                {/* Method selector tab */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    type="button"
                    onClick={() => setPaymentType('card')}
                    className={`h-12 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${paymentType === 'card'
                        ? 'border-[#FF4500] bg-orange-50/50 text-[#FF4500]'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <CreditCard className="w-4 h-4" /> Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentType('paypal')}
                    className={`h-12 rounded-xl border-2 font-semibold text-sm transition-all flex items-center justify-center gap-2 ${paymentType === 'paypal'
                        ? 'border-[#FF4500] bg-orange-50/50 text-[#FF4500]'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    <span className="font-extrabold italic text-sm">PayPal</span>
                  </button>
                </div>

                {paymentType === 'card' ? (
                  <div className="space-y-6">
                    {/* Visual Card Display */}
                    <div className="relative w-full max-w-[340px] h-[190px] mx-auto rounded-2xl text-white shadow-lg bg-gradient-to-br from-[#FF4500] to-orange-500 p-6 overflow-hidden transition-transform duration-500 hover:scale-105">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">PRO MEMBER</span>
                        <span className="text-xl font-black italic tracking-tight">Visa</span>
                      </div>
                      <div className="w-11 h-9 bg-yellow-400/80 rounded-lg mb-4 flex items-center justify-center shadow-inner">
                        <div className="w-7 h-5 border border-yellow-600/30 rounded" />
                      </div>
                      <div className="text-xl font-mono tracking-widest mb-4">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="flex justify-between text-xs">
                        <div className="max-w-[170px] truncate">
                          <span className="block text-[8px] text-white/60 uppercase tracking-widest mb-0.5">Card Holder</span>
                          <span className="font-bold tracking-wide uppercase">{cardName || 'Your Name'}</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[8px] text-white/60 uppercase tracking-widest mb-0.5">Expires</span>
                          <span className="font-bold tracking-wide">{cardExpiry || 'MM/YY'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Smith"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-4 focus:ring-[#FF4500]/10 transition-all bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-4 focus:ring-[#FF4500]/10 transition-all bg-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-4 focus:ring-[#FF4500]/10 transition-all bg-white font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CVV</label>
                          <input
                            type="password"
                            required
                            placeholder="•••"
                            value={cardCvv}
                            onChange={handleCvvChange}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#FF4500] focus:ring-4 focus:ring-[#FF4500]/10 transition-all bg-white font-medium"
                          />
                        </div>
                      </div>

                      {paymentError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{paymentError}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <span>SSL Encrypted & Secure Checkout</span>
                      </div>

                      <Button type="submit" variant="primary" className="w-full bg-[#FF4500] hover:bg-[#e03e00] py-3 text-sm font-bold mt-2" disabled={isProcessing}>
                        {isProcessing ? 'Processing Payment...' : `Pay & Activate Plan`}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6 text-center py-6">
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Pay easily and securely using PayPal. Click the checkout button below to process your upgrade.
                    </p>

                    <Button
                      onClick={handlePaypalCheckout}
                      disabled={isProcessing}
                      className="w-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-1.5 border border-[#E5B22E] shadow-sm hover:shadow transition-all text-sm"
                    >
                      {isProcessing ? (
                        'Connecting PayPal...'
                      ) : (
                        <>
                          <span className="italic">PayPal</span>
                          <span className="font-semibold text-xs px-2 py-0.5 rounded bg-[#003087] text-white">Checkout</span>
                        </>
                      )}
                    </Button>

                    {paymentError && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2 justify-center">
                        <AlertCircle className="w-4 h-4" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      <span>SSL Encrypted Transaction</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal Billing view
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F4] to-white">
      {/* NAVE*/}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FF4500] rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">JobOps</span>
              </Link>

              <div className="hidden md:flex items-center gap-8">
                {['Features', 'How it Works', 'Pricing', 'Testimonials'].map(item => (
                  <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{item}</a>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Link to="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
                <Link to="/register"><Button size="sm">Get Started</Button></Link>
              </div>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
              {['Features', 'How it Works', 'Pricing', 'Testimonials'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-600 py-1">{item}</a>
              ))}
              <div className="flex gap-3 pt-2">
                <Link to="/login" className="flex-1"><Button variant="secondary" size="sm" className="w-full">Sign In</Button></Link>
                <Link to="/register" className="flex-1"><Button size="sm" className="w-full">Get Started</Button></Link>
              </div>
            </motion.div>
          )}
        </nav>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF4500] to-orange-400 text-white px-6 py-12 mt-10">
        <h1 className="text-4xl font-bold mb-4">Subscription & Billing</h1>
        <p className="text-white/90">Manage your subscription, view usage, and billing history</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Current Subscription Status */}
        {subscription ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <SubscriptionStatusBar
                plan={subscription.subscriptionPlan}
                endDate={subscription.subscriptionEndDate ? new Date(subscription.subscriptionEndDate) : undefined}
                billingCycle={subscription.billingCycle}
              />
            </motion.div>

            {/* Current Plan Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm"
            >
              <div className="grid md:grid-cols-2 gap-8">
                {/* Plan Info */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {subscription.subscriptionPlan}
                    </h2>
                    <PremiumBadge plan={subscription.subscriptionPlan} />
                  </div>

                  {/* Price display */}
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    {subscription.subscriptionPlan === 'Monthly' && (
                      <p className="text-lg font-bold text-gray-900">$25<span className="text-sm font-normal text-gray-500">/month</span></p>
                    )}
                    {subscription.subscriptionPlan === 'Yearly' && (
                      <>
                        <p className="text-lg font-bold text-gray-900">$250<span className="text-sm font-normal text-gray-500">/year</span></p>
                        <p className="text-xs text-green-600 font-medium mt-0.5">Saving $50 annually (16.7% off vs monthly)</p>
                      </>
                    )}
                    {subscription.subscriptionPlan === 'Free' && (
                      <p className="text-lg font-bold text-gray-900">$0<span className="text-sm font-normal text-gray-500">/forever</span></p>
                    )}
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-5 h-5 text-[#FF4500]" />
                      <span>
                        Started:{' '}
                        {new Date(subscription.subscriptionStartDate).toLocaleDateString()}
                      </span>
                    </div>

                    {subscription.subscriptionEndDate && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="w-5 h-5 text-[#FF4500]" />
                        <span>
                          Renews:{' '}
                          {new Date(subscription.subscriptionEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-gray-600">
                      <CreditCard className="w-5 h-5 text-[#FF4500]" />
                      <span>
                        Billing Cycle: {subscription.billingCycle?.charAt(0).toUpperCase() + subscription.billingCycle?.slice(1)}
                      </span>
                    </div>

                    {subscription.autoRenew && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-green-700">
                          Auto-renewal is enabled. Your subscription will renew automatically.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-between">
                  {subscription.subscriptionPlan !== 'Free' ? (
                    <div className="space-y-3">
                      <Button
                        onClick={() => navigate('/pricing')}
                        variant="primary"
                        className="w-full bg-[#FF4500] hover:bg-[#e03e00]"
                      >
                        Upgrade Plan
                      </Button>
                      <Button
                        onClick={() => setShowCancelModal(true)}
                        variant="ghost"
                        className="w-full text-red-600 hover:bg-red-50"
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 self-end w-full">
                      <Button
                        onClick={() => navigate('/pricing')}
                        variant="primary"
                        className="w-full bg-[#FF4500] hover:bg-[#e03e00]"
                      >
                        Explore Plans & Upgrade
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Usage Limits */}
            {subscription.subscriptionPlan !== 'Free' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-8"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Usage Statistics</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <UsageLimitIndicator
                    label="AI Searches"
                    used={subscription.aiSearchesUsed}
                    limit={subscription.maxAISearches}
                  />
                  <UsageLimitIndicator
                    label="Saved Jobs"
                    used={subscription.savedJobsCount}
                    limit={subscription.maxSavedJobs}
                  />
                  <UsageLimitIndicator
                    label="Resume Uploads"
                    used={subscription.resumeUploadsCount}
                    limit={subscription.maxResumeUploads}
                  />
                </div>
              </motion.div>
            )}

            {/* Usage Analytics */}
            {analytics && analytics.dailyData && Array.isArray(analytics.dailyData) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Activity Overview</h3>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Summary Stats */}
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">AI Searches (Last 30 days)</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">{analytics.totalAISearches || 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Jobs Saved (Last 30 days)</p>
                      <p className="text-3xl font-bold text-green-900 mt-1">{analytics.totalJobsSaved || 0}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Resumes Uploaded (Last 30 days)</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">{analytics.totalResumesUploaded || 0}</p>
                    </div>
                  </div>

                  {/* Chart */}
                  {analytics.dailyData.length > 0 && (
                    <BarChart
                      data={analytics.dailyData.map((day: any) => ({
                        date: new Date(day.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        }),
                        searches: day.aiSearchesUsed || 0,
                      }))}
                      xKey="date"
                      yKey="searches"
                      color="#FF4500"
                      label="Daily AI Searches"
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* Billing History */}
            {transactions && transactions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h3>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Plan</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{tx.planName}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 capitalize">{tx.action}</td>
                          <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                            ${tx.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tx.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : tx.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                              {tx.status ? (tx.status.charAt(0).toUpperCase() + tx.status.slice(1)) : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigate(`/dashboard/invoice/${tx.transactionId || tx.id}`, {
                                  state: { transaction: tx },
                                });
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center">
            <AlertCircle className="w-12 h-12 text-[#FF4500] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Subscription Information</h3>
            <p className="text-sm text-gray-500 mb-6">We couldn't fetch your subscription details. Try refreshing the page or contact support.</p>
            <Button onClick={fetchSubscriptionData} variant="primary" className="bg-[#FF4500] hover:bg-[#e03e00]">
              Retry Loading
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Cancel Subscription?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? You'll lose access to premium features.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="ghost"
                className="flex-1"
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                variant="danger"
                className="flex-1"
              >
                Yes, Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
