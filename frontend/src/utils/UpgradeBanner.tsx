import React from 'react';
import { useNavigate } from 'react-router-dom';

interface UpgradeBannerProps {
  message: string;
  requiredPlans?: string[];
  upgradeUrl?: string;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({ message, requiredPlans, upgradeUrl }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (upgradeUrl) {
      navigate(upgradeUrl);
    } else {
      // fallback to pricing page
      navigate('/dashboard/pricing');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-r from-[#FF7E5F] via-[#FEB47B] to-[#FF7E5F] text-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-3">{message}</h2>
      {requiredPlans && requiredPlans.length > 0 && (
        <p className="mb-4 text-sm">Upgrade to: {requiredPlans.join(', ')}</p>
      )}
      <button
        onClick={handleClick}
        className="px-6 py-2 bg-[#FF4500] hover:bg-[#e03e00] text-white font-medium rounded-full transition-colors"
      >
        Upgrade Now
      </button>
    </div>
  );
};
