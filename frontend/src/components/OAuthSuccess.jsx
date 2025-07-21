import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    const handleAuthSuccess = async (jwtToken) => {
      localStorage.setItem('token', jwtToken);
      console.log('Google OAuth Success! Token received.');

      try {
        
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        const user = res.data.user; 

        if (user && user._id) {
          localStorage.setItem('userId', user._id); 
          
          if (!user.mobile) {
            console.log('Mobile number missing, redirecting to complete profile.');
            navigate('/complete-profile', { state: { user } }); 
          } else {
            console.log('Mobile number present, redirecting to users dashboard.');
            navigate('/users'); 
          }
        } else {
          console.error('User data not found after fetching /api/me');
          navigate('/login?oauth_error=user_data_missing');
        }
      } catch (fetchError) {
        console.error('Error fetching user details after OAuth:', fetchError);
        navigate('/login?oauth_error=fetch_user_failed');
      }
    };

    if (token) {
      handleAuthSuccess(token);
    } else if (error) {
      console.error('Google OAuth failed with error:', error);
      navigate(`/login?oauth_error=${error}`);
    } else {
      console.warn('OAuth callback: No token or error found in URL.');
      navigate('/login?oauth_error=unknown');
    }
  }, [location, navigate]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Processing Google Login...</h2>
      <p>Please wait while we set up your session.</p>
    </div>
  );
};

export default OAuthSuccess;