import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/utils';

// Pricing data – keep in sync with backend subscription plans
const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'month',
    description: 'Perfect for getting started',
    features: [
      '4 AI searches/month',
      '10 job matches',
      'Weekly summary',
    ],
    popular: false,
  },
  {
    name: 'Monthly',
    price: '$20',
    period: 'month',
    description: 'Unlimited AI matches & priority alerts',
    features: [
      'Unlimited AI matches',
      'Resume score boosts',
      'Priority job alerts',
    ],
    popular: true,
  },
  {
    name: 'Yearly',
    price: '$220',
    period: 'year',
    description: 'Best value – save $20 annually',
    features: [
      'Everything in Monthly',
      'Save $20 annually',
      'Early access to referrals',
    ],
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F4] to-white py-12">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Choose the plan that fits you
        </h1>
        <p className="text-lg text-gray-600">
          No hidden fees. Cancel anytime. Upgrade for premium AI job matching.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-8 max-w-5xl mx-auto lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              'flex flex-col p-6 transition-shadow hover:shadow-xl',
              plan.popular ? 'border-[#FF4500] ring-2 ring-[#FF4500]/20' : 'border-gray-200'
            )}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {plan.name}
            </h2>
            <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
            <div className="flex items-baseline mb-4">
              <span className="text-4xl font-bold text-gray-900 mr-1">
                {plan.price}
              </span>
              <span className="text-sm text-gray-600">/{plan.period}</span>
            </div>
            <ul className="flex-1 mb-6 space-y-2 text-gray-600 text-sm">
              {plan.features.map((feat) => (
                <li key={feat} className="flex items-center">
                  <svg
                    className="w-4 h-4 text-[#FF4500] mr-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>
            <Link to="/dashboard/settings" className="mt-auto w-full">
              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full"
              >
                Select {plan.name}
              </Button>
            </Link>
          </Card>
        ))}
      </div>

      {/* Back link */}
      <div className="mt-12 text-center">
        <Link
          to="/dashboard/settings"
          className="inline-flex items-center text-[#FF4500] hover:underline"
        >
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
