import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user info from local storage
    localStorage.removeItem('userInfo');
    // Optionally clear other persisted data
    // Redirect to login page
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}
