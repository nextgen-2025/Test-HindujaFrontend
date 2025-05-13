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
      
      // Listen for new memos and appointments
      socket.on('memo-created', (data) => {
        if (data.userId === userData._id) {
          fetchNotifications();
          toast.info('You have received a new visit memo');
        }
      });

      socket.on('appointment-booked', (data) => {
        if (data.patientId === userData.patientId) {
          fetchNotifications();
          toast.info('New appointment has been booked');
        }
      });
    }
    
    return () => {
      socket.off('memo-created');
      socket.off('appointment-booked');
    };
  }, [token, userData]);
  
  // const fetchNotifications = async () => {
  //   try {
  //     // Fetch both memos and appointments
  //     const [memosResponse, appointmentsResponse] = await Promise.all([
  //       axios.get(`${backendUrl}/api/departments/memo/user/${userData._id}`, { headers: { token } }),
  //       axios.get(`${backendUrl}/api/bookings`, { headers: { token } }),
  //       axios.get(`${backendUrl}/api/departments/visit-memos/all`)
  //     ]);
  //     console.log('Memos:', memosResponse.data);
  //     console.log('Appointments:', appointmentsResponse.data);
      
  //     const memos = memosResponse.data.success ? memosResponse.data.memos : [];
  //     const appointments = appointmentsResponse.data || [];
      
  //     // Combine and sort notifications by date
  //     const combinedNotifications = [
  //       ...memos.map(memo => ({
  //         ...memo,
  //         type: 'memo',
  //         date: new Date(memo.createdAt)
  //       })),
  //       ...appointments
  //         .filter(apt => apt.patientId === userData?.patientId)
  //         .map(apt => ({
  //           _id: apt._id,
  //           type: 'appointment',
  //           isRead: apt.isRead || false,
  //           date: new Date(apt.date),
  //           doctorName: apt.doctorName,
  //           time: apt.time
  //         }))
  //     ].sort((a, b) => b.date - a.date);

  //     setNotifications(combinedNotifications);
  //     console.log('Combined Notifications:', combinedNotifications);
  //   } catch (error) {
  //     console.error('Error fetching notifications:', error);
  //   }
  // };
  const fetchNotifications = async () => {
  try {
    const [memosResponse, appointmentsResponse] = await Promise.all([
      axios.get(`${backendUrl}/api/departments/visit-memos/all`, {
        headers: { token }
      }),
      axios.get(`${backendUrl}/api/bookings`, {
        headers: { token }
      })
    ]);

    // console.log('Memos:', memosResponse.data);
    // console.log("Memos Data:", memosResponse.data.memos);
    // console.log('Appointments:', appointmentsResponse.data);

    const allMemos = memosResponse.data.success ? memosResponse.data.memos : [];
    const filteredMemos = allMemos
      .filter(memo => memo.patientId === userData?.patientId)
      .map(memo => ({
        _id: memo._id,
        type: 'memo',
        isRead: memo.isRead || false,
        message: memo.message,
        date: new Date(memo.createdAt),
        createdAt: memo.createdAt,
        departmentName: memo.departments[0]?.departmentName || 'General',
      }));

    const appointments = appointmentsResponse.data
      .filter(apt => apt.patientId === userData?.patientId)
      .map(apt => ({
        _id: apt._id,
        type: 'appointment',
        isRead: apt.isRead || false,
        doctorId: apt.doctorId,
        date: new Date(apt.createdAt),
        time: apt.time,
        createdAt: apt.createdAt
      }));
    
      console.log("Date: ",appointments.date)

    const combinedNotifications = [...filteredMemos, ...appointments].sort(
      (a, b) => b.date - a.date
    );

    setNotifications(combinedNotifications);
    console.log('Combined Notifications:', combinedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};


  const markAsRead = async (notificationId, type) => {
    try {
      if (type === 'memo') {
        await axios.put(
          `${backendUrl}/api/departments/memo/${notificationId}/read`,
          {},
          { headers: { token } }
        );
      } else {
        await axios.put(
          `${backendUrl}/api/bookings/${notificationId}/read`,
          {},
          { headers: { token } }
        );
      }
      
      // Update local state
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const unreadCount = notifications.filter(notif => !notif.isRead).length;
  
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
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
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
              notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`p-3 border-b hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification._id, notification.type);
                    }
                    if (notification.type === 'memo') {
                      window.location.href = `/visit-memo/${notification._id}`;
                    } else {
                      navigate('/my-appointments');
                    }
                    setShowDropdown(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {notification.type === 'memo' ? 'Visit Memo' : 'New Appointment'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.type === 'memo' 
                          ? new Date(notification.createdAt).toLocaleString()
                          : `${new Date(notification.date).toLocaleString()}`
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.type === 'memo' 
                          ? notification.departmentName
                          : `Dr. ID: ${notification.doctorId}`
                        }
                      </p>
                    </div>
                    {!notification.isRead && (
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