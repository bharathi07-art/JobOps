import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Call backend logout endpoints to clear HttpOnly cookies
    const logout = async () => {
      try {
        // Attempt user logout
        await fetch('/logout/user', { method: 'POST', credentials: 'include' });
        // Attempt admin logout (no harm if not admin)
        await fetch('/logout/admin', { method: 'POST', credentials: 'include' });
      } catch (e) {
        console.warn('Logout request failed', e);
      }
      // Clear persisted client-side data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.replace('/login');
    };
    logout();
  }, [navigate]);

  return null;
}
