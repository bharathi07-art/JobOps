import React from 'react';
import { Link } from 'react-router-dom';

/**
 * UpgradeBanner – displays a premium‑upgrade call‑to‑action.
 * It receives the `upgradeUrl` returned from the backend (e.g. '/dashboard/pricing').
 * The component follows the app's design system: gradient orange button, glass‑morphism background.
 */
export const UpgradeBanner: React.FC<{ upgradeUrl: string; message?: string }> = ({
  upgradeUrl,
  message = 'Upgrade to a Pro plan to access this feature.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
      <p className="mb-4 text-center text-lg font-medium text-gray-100">{message}</p>
      <Link
        to={upgradeUrl}
        className="px-6 py-2.5 bg-[#FF4500] text-white rounded-lg hover:bg-[#e03e00] transition-colors font-medium"
      >
        Upgrade Now
      </Link>
    </div>
  );
};
