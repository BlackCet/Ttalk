import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setLoading(true);

    try {
      
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        form,
        { withCredentials: true }
      );

    
      setMessage(res.data.msg || 'Signup successful! Please log in.');
      setIsError(false);
      
      navigate('/users'); 
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message); 
      setMessage(err.response?.data?.msg || 'Signup failed');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Initiating Google Signup');
    window.open(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google`, '_self');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center w-full p-2">
      <div className="w-full sm:max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          Sign Up
        </h2>

        {message && (
          <div className={`text-sm mb-3 ${isError ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:gap-4 mb-3">
          <div className="w-full sm:w-1/2 mb-3 sm:mb-0">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Name
            </label>
            <input
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
              required
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="your@example.com"
              value={form.email}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
              required
            />
          </div>
        </div>

        <label className="block text-gray-700 text-sm font-bold mb-2">
          Mobile (Optional)
        </label>
        <input
          name="mobile"
          type="tel"
          placeholder="e.g., +91 9876543210"
          value={form.mobile}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-3 bg-white"
        />

        <label className="block text-gray-700 text-sm font-bold mb-2">
          Password
        </label>
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
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
              Signing up...
            </span>
          ) : (
            'Sign Up'
          )}
        </button>

        <p className="text-center text-gray-600 my-3">or</p>

       
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

export default Signup;