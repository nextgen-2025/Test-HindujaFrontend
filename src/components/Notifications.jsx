import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://hinduja-backend-production.up.railway.app';

const socket = io(API_URL);

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { token, userData, backendUrl } = useContext(AppContext);
  
  useEffect(() => {
    if (token && userData) {
      fetchNotifications();
      
      // Listen for new memos
      socket.on('memo-created', (data) => {
        if (data.userId === userData._id) {
          fetchNotifications();
          toast.info('You have received a new visit memo');
        }
      });
    }
    
    return () => {
      socket.off('memo-created');
    };
  }, [token, userData]);
  
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/departments/memo/user/${userData._id}`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        setNotifications(response.data.memos);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const markAsRead = async (memoId) => {
    try {
      await axios.put(
        `${backendUrl}/api/departments/memo/${memoId}/read`,
        {},
        { headers: { token } }
      );
      
      // Update local state
      setNotifications(notifications.map(memo => 
        memo._id === memoId ? { ...memo, isRead: true } : memo
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const unreadCount = notifications.filter(memo => !memo.isRead).length;
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="py-2 px-3 bg-gray-100 border-b">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(memo => (
                <div 
                  key={memo._id} 
                  className={`p-3 border-b hover:bg-gray-50 ${!memo.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (!memo.isRead) markAsRead(memo._id);
                    window.location.href = `/visit-memo/${memo._id}`;
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Visit Memo
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(memo.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!memo.isRead && (
                      <span className="bg-blue-500 h-2 w-2 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;