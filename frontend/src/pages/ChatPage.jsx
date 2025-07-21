import React, { useEffect, useState, useRef, useCallback } from "react";
import socket from "../socket";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import LogoutButton from '../components/LogoutButton'; 

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
 
  const { currentUser, selectedUser } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  
  const handleReceiveMessage = useCallback((msg) => {
    setMessages((prev) => {
      const isDuplicate = prev.some((m) => m._id === msg._id);
      if (isDuplicate) {
        return prev;
      }
      return [...prev, { ...msg, optimistic: false }];
    });
  }, []);

  const handleMessageConfirmed = useCallback(({ tempId, realMessage }) => {
    setMessages((prev) => {
      return prev.map((msg) => {
        if (msg._id === tempId && msg.optimistic) {
          console.log(`Confirmed message: ${tempId} -> ${realMessage._id}`);
          return { ...realMessage, optimistic: false };
        }
        return msg;
      });
    });
  }, []);

  const handleSendMessageFailed = useCallback(({ tempId, error }) => {
    console.error(`Message send failed for tempId ${tempId}: ${error}`);
    setMessages((prev) => prev.filter(msg => msg._id !== tempId));
  }, []);

  
  useEffect(() => {
    if (!currentUser || !selectedUser) {
      console.log("No current user or selected user, redirecting.");
      navigate("/"); 
      return;
    }

    socket.emit("join_room", { senderId: currentUser._id, receiverId: selectedUser._id });
    console.log(`Joining room for ${currentUser._id} and ${selectedUser._id}`);

    const fetchMessages = async () => {
      try {
        
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/messages/${currentUser._id}/${selectedUser._id}`);
        setMessages(res.data.map(msg => ({ ...msg, optimistic: false })));
      } catch (err) {
        console.error("Error fetching messages:", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login'); 
        }
      }
    };

    fetchMessages();

    socket.on("receive_message", handleReceiveMessage);
    socket.on("message_confirmed", handleMessageConfirmed);
    socket.on("send_message_failed", handleSendMessageFailed);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
      socket.off("message_confirmed", handleMessageConfirmed);
      socket.off("send_message_failed", handleSendMessageFailed);
      console.log(`Leaving room for ${currentUser._id} and ${selectedUser._id}`);
    };
  }, [currentUser, selectedUser, navigate, handleReceiveMessage, handleMessageConfirmed, handleSendMessageFailed]);

 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  const sendMessage = () => {
    if (!text.trim()) return;

    const tempId = uuidv4();
    const messageData = {
      _id: tempId,
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message: text,
      type: "text",
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setMessages((prev) => [...prev, messageData]);

    socket.emit("send_message", {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message: text,
      type: "text",
      tempId: tempId,
    });

    setText("");
  };

  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentUser || !selectedUser) return;

    const fileType = file.type.startsWith("video")
      ? "video"
      : file.type.startsWith("image")
      ? "image"
      : "file";

    const localUrl = URL.createObjectURL(file);
    const tempId = uuidv4();

    const tempMessage = {
      _id: tempId,
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      type: fileType,
      fileUrl: localUrl,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };
    setMessages((prev) => [...prev, tempMessage]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("senderId", currentUser._id);
    formData.append("receiverId", selectedUser._id);
    formData.append("type", fileType);
    formData.append("tempId", tempId);

    try {
      
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/files/upload`, formData);
      console.log('File upload initiated. Waiting for socket confirmation...');
    } catch (err) {
      console.error("File upload failed:", err);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
    } finally {
      e.target.value = null;
    }
  };

  if (!currentUser || !selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400 text-white text-xl font-sans">
        Loading chat context...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-300 to-pink-400 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl min-h-[600px] max-h-[90vh] flex flex-col relative">

        
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
         
          <button
            onClick={() => navigate('/users')}
            className="text-gray-600 hover:text-purple-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100"
            title="Go back to user list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-800 text-center flex-grow mx-4">
            Chat with <span className="text-purple-700">{selectedUser?.name}</span>
          </h2>
          <LogoutButton />
        </div>

        
        <div className="flex-grow overflow-y-auto pr-2 mb-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`
                flex ${msg.senderId === currentUser._id ? 'justify-end' : 'justify-start'}
                max-w-[70%] transition-opacity duration-300
                ${msg.optimistic ? 'opacity-70' : 'opacity-100'}
              `}
              style={{
                marginLeft: msg.senderId === currentUser._id ? 'auto' : '0',
                marginRight: msg.senderId === currentUser._id ? '0' : 'auto',
              }}
            >
              <div className={`
                relative p-3 rounded-lg shadow-md
                ${msg.senderId === currentUser._id
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }
              `}>
                {msg.type === "text" && (
                  <p className="whitespace-pre-wrap">{msg.message}</p>
                )}
                {msg.type === "image" && (
                  <img
                    src={msg.fileUrl.startsWith("blob:") ? msg.fileUrl : `${import.meta.env.VITE_BACKEND_URL}${msg.fileUrl}`}
                    alt="sent"
                    className="max-w-full h-auto rounded-lg"
                  />
                )}
                {msg.type === "video" && (
                  <video controls className="max-w-full h-auto rounded-lg">
                    <source
                      src={msg.fileUrl.startsWith("blob:") ? msg.fileUrl : `${import.meta.env.VITE_BACKEND_URL}${msg.fileUrl}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                )}
                {msg.type === "file" && (
                  <a
                    href={msg.fileUrl.startsWith("blob:") ? msg.fileUrl : `${import.meta.env.VITE_BACKEND_URL}${msg.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-300 hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13.5"/>
                    </svg>
                    Download File
                  </a>
                )}
                {msg.optimistic && (
                  <span className="absolute bottom-1 right-2 text-xs text-gray-400">
                    <span className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full inline-block"></span>
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>


        <div className="flex gap-3 mt-auto pt-4 border-t border-gray-200">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            
            className="shadow appearance-none border rounded-full flex-grow py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-purple-500 bg-white"
          />
          <button
            onClick={sendMessage}
            className="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-full shadow-md transition duration-300 ease-in-out"
          >
            Send
          </button>
          <label className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded-full shadow cursor-pointer flex items-center justify-center transition duration-300 ease-in-out">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13.5"/>
            </svg>
            </label>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;