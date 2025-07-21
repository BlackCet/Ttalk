import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ChatPage from './ChatPage';
const ChatWrapper = () => {
  const location = useLocation();
const navigate = useNavigate();

const selectedUser = location.state?.selectedUser;
const currentUser = location.state?.currentUser;

  useEffect(() => {
    if (!selectedUser || !currentUser) {
      navigate('/users');
    }
  }, [selectedUser, currentUser, navigate]);

  if (!selectedUser || !currentUser) return null;

  return <ChatPage currentUser={currentUser} selectedUser={selectedUser} />;
};

export default ChatWrapper;
