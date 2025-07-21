
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import { useNavigate } from 'react-router-dom';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        console.warn('No token or userId found, redirecting to login.');
        navigate('/login');
        return;
      }

      try {
        const currentUserRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrentUser(currentUserRes.data.user);

        const allUsersRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const fetchedUsers = allUsersRes.data.filter(user => user._id !== userId);
        setUsers(fetchedUsers);
        setFilteredUsers(fetchedUsers);

      } catch (err) {
        console.error('Failed to fetch user data or users list:', err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.error('Authentication failed, redirecting to login.');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredUsers(users);
    } else {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      const newFilteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(lowercasedSearchTerm) ||
        (user.email && user.email.toLowerCase().includes(lowercasedSearchTerm)) ||
        (user.mobile && user.mobile.toLowerCase().includes(lowercasedSearchTerm))
      );
      setFilteredUsers(newFilteredUsers);
    }
  }, [searchTerm, users]);

  const handleUserClick = (selectedUser) => {
    if (currentUser) {
      navigate('/chat', { state: { selectedUser, currentUser } });
    } else {
      console.warn("Current user data not loaded yet. Please wait or refresh.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm md:max-w-md min-h-[500px] flex flex-col">

        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Users</h2>
          <LogoutButton />
        </div>

       
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users..."
           
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <span className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></span>
          </div>
        ) : filteredUsers.length === 0 && users.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-gray-600 text-base text-center">
            No users found in the system.
          </div>
        ) : filteredUsers.length === 0 && users.length > 0 ? (
          <div className="flex-grow flex items-center justify-center text-gray-600 text-base text-center">
            No users match your search criteria.
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto pr-1 -mr-1">
            <ul className="space-y-2">
              {filteredUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleUserClick(user)}
                  className="bg-gray-50 hover:bg-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer p-3 rounded-lg flex items-center border border-gray-200"
                >
                  <div className="flex-grow">
                    <h3 className="text-base font-semibold text-gray-800">{user.name}</h3>
                    {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                  </div>
                  <div className="ml-4 text-purple-600">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                         </svg>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;