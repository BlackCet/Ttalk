import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    try {
      // --- ACTUAL API CALL ---
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          emailOrMobile: form.email,
          password: form.password,
        },
        { withCredentials: true }
      );

      // --- CRITICAL CORRECTION: Use ACTUAL data from backend response ---
      // IMPORTANT: Adjust 'res.data.token' and 'res.data.user._id'
      // based on the exact structure of your backend's successful login response.
      // You should inspect your network tab (F12) to confirm this.
      const token = res.data.token;
      const userId = res.data.user._id; // Example: if your backend sends { token: "...", user: { _id: "..." } }

      if (token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);

        setMessage('Login successful!');
        setIsError(false); // Reset error state on success
        if (onLoginSuccess) {
          onLoginSuccess(); // Update parent (Home) component's login status
        }
        // --- ACTUAL NAVIGATION ---
        navigate('/users'); // Redirect to the users page after successful login
      } else {
        // Fallback if backend response is unexpectedly missing token/userId
        setMessage('Login successful, but token/user ID missing in response.');
        setIsError(true);
      }

    } catch (err) {
      console.error("Login error:", err.response?.data || err.message); // Log detailed error for debugging
      setMessage(err.response?.data?.msg || 'Login failed. Please check your credentials.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Initiating Google Login');
    // For Google OAuth, window.open is appropriate as it redirects the entire window
    window.open(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, '_self');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full p-2">
      <div className="w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Login
        </h2>

        {message && (
          <div className={`text-sm mb-3 ${isError ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </div>
        )}

        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email or Mobile
        </label>
        <input
          name="email"
          type="text"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email or mobile"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3 bg-white"
          required
        />

        <label className="block text-gray-700 text-sm font-bold mb-2">
          Password
        </label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-5 leading-tight focus:outline-none focus:shadow-outline bg-white"
          required
        />

        <button
          type="submit"
          className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full w-full transition duration-300 ease-in-out"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>

        <p className="text-center text-gray-600 my-3">or</p>

        {/* Changed button to Link for proper navigation to external OAuth */}
        <Link
          to={`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`}
          target="_self"
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow w-full flex items-center justify-center transition duration-300 ease-in-out"
        >
          <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.0003 4.40002C14.1362 4.40002 15.9392 5.16872 17.2918 6.46872L20.0003 3.75002C18.069 1.83296 15.2678 0.80002 12.0003 0.80002C7.30013 0.80002 3.20013 3.48622 1.20013 7.06252L4.60013 9.75002C5.50013 7.20002 8.39999 5.20002 12.0003 5.20002L12.0003 4.40002ZM23.2003 12.0003C23.2003 11.0003 23.0993 10.0003 22.8993 9.10002L12.0003 9.10002L12.0003 13.9003L18.4003 13.9003C18.1003 15.0003 17.4003 16.0003 16.5003 16.8003L19.9003 19.5003C21.8003 17.7003 23.2003 15.0003 23.2003 12.0003ZM12.0003 19.9003C8.30013 19.9003 5.20013 17.9003 3.60013 14.9003L0.200129 17.6003C2.30013 21.6003 6.90013 24.0003 12.0003 24.0003C15.2003 24.0003 18.0003 22.9003 20.0003 21.2003L16.6003 18.5003C15.6003 19.3003 13.9003 19.9003 12.0003 19.9003Z"/>
          </svg>
          Continue with Google
        </Link>
      </div>
    </form>
  );
};
export default Login;