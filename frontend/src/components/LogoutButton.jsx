
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); 
    console.log('User logged out. Redirecting to login.');
    navigate('/'); 
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out text-sm"
    >
      Logout
    </button>
  );
};

export default LogoutButton;