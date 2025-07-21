import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';

const Home = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full transform transition-all duration-300 hover:scale-105 flex flex-col justify-between">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Welcome to <span className="text-purple-700">Ttalk</span>
        </h1>

        <div className="flex justify-center mb-6 bg-purple-100 rounded-full p-1">
          <button
            onClick={() => setIsSignup(true)}
            className={`
              py-2 px-4 text-md font-semibold rounded-full
              transition-all duration-300 ease-in-out
              ${isSignup
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-transparent text-gray-700 hover:text-purple-700'
              }
            `}
          >
            Signup
          </button>
          <button
            onClick={() => setIsSignup(false)}
            className={`
              py-2 px-4 text-md font-semibold rounded-full
              transition-all duration-300 ease-in-out
              ${!isSignup
                ? 'bg-purple-700 text-white shadow-md'
                : 'bg-transparent text-gray-700 hover:text-purple-700'
              }
            `}
          >
            Login
          </button>
        </div>

        <div className="flex-grow flex items-center justify-center">
          {isSignup ? (
            <Signup />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )}
        </div>

        {isLoggedIn && (
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/users')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105"
            >
              Go to Users
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;