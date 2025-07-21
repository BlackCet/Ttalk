import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); 
  const [submitting, setSubmitting] = useState(false); 

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      if (location.state && location.state.user) {
        setUser(location.state.user);
        setLoadingUser(false);
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data.user);
            setLoadingUser(false);
          } catch (err) {
            console.error("Error fetching user for complete profile:", err);
            setLoadingUser(false);
            navigate('/login');
          }
        } else {
          setLoadingUser(false);
          navigate('/login');
        }
      }
    };
    fetchUser();
  }, [location.state, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setSubmitting(true); 

    if (!mobile.trim()) {
      setMessage('Mobile number cannot be empty.');
      setIsError(true);
      setSubmitting(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Authentication token missing.');
      setIsError(true);
      setSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile`,
        { mobile },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(res.data.msg || 'Profile updated successfully!');
      setIsError(false);
      setTimeout(() => navigate('/users'), 1000); 
    } catch (err) {
      console.error('Error updating profile:', err.response?.data?.msg || err.message);
      setMessage(err.response?.data?.msg || 'Failed to update profile.');
      setIsError(true);
    } finally {
      setSubmitting(false); 
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400">
        <span className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></span>
      </div>
    );
  }

  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400 text-white text-xl">
        Error loading profile. Please log in again.
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400 flex items-center justify-center p-4 font-sans">
      
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm md:max-w-md min-h-[400px] flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Complete Your Profile
        </h2>
        <p className="text-center text-gray-600 text-base mb-6">
          Welcome, <span className="text-purple-700 font-semibold">{user.name}</span>!
          <br />
          Please provide your mobile number to continue.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          
          {message && (
            <div className={`text-sm mb-4 text-center ${isError ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="mobile" className="block text-gray-700 text-sm font-bold mb-2">
              Mobile Number:
            </label>
            <input
              id="mobile"
              type="tel" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g., +91 9876543210"
            
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 bg-white"
              required
            />
          </div>

          <button
            type="submit"
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full w-full transition duration-300 ease-in-out"
            disabled={submitting} 
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save and Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;