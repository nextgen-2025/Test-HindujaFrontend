import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';
import { io } from 'socket.io-client';
import { FaClipboardList, FaHospital, FaUserInjured, FaCheckCircle } from 'react-icons/fa';

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080' 
  : 'https://hinduja-backend-production.up.railway.app';

const socket = io(API_URL);

const VisitMemo = () => {
  const { token, userData, backendUrl } = useContext(AppContext);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [activeMemos, setActiveMemos] = useState([]);
  const [expandedDept, setExpandedDept] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  console.log("Active memoe log: ",activeMemos)
  console.log("Queue data log: ",queueData)

  useEffect(() => {
    fetchDepartments();
    if (token) {
      fetchActiveMemos();
    }

    // Socket event listeners
    socket.on('visit-status-updated', handleVisitStatusUpdate);

    return () => {
      socket.off('visit-status-updated');
    };
  }, [token]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/departments/list`);
      if (response.data.success) {
        setDepartments(response.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveMemos = async () => {
    try {
      setLoading(true);
      // This endpoint would need to be implemented to fetch user's active memos
      const response = await axios.get(`${backendUrl}/api/user/visit-memos`, {
        headers: { token }
      });
      if (response.data.success) {
        setActiveMemos(response.data.memos);
      }
    } catch (error) {
      console.error('Error fetching active memos:', error);
      // Don't show error toast as this might be a first-time user
    } finally {
      setLoading(false);
    }
  };

  const handleVisitStatusUpdate = (data) => {
    // Refresh active memos when a visit status is updated
    if (token) {
      fetchActiveMemos();
    }
  };

  const handleDepartmentSelect = (departmentId) => {
    if (selectedDepartments.includes(departmentId)) {
      setSelectedDepartments(selectedDepartments.filter(id => id !== departmentId));
    } else {
      setSelectedDepartments([...selectedDepartments, departmentId]);
    }
  };

  const createVisitMemo = async () => {
    if (!token) {
      toast.warning('Please login to create a visit memo');
      return;
    }

    if (selectedDepartments.length === 0) {
      toast.warning('Please select at least one department');
      return;
    }

    try {
      setCreating(true);
      const response = await axios.post(
        `${backendUrl}/api/departments/memo/create`,
        {
          userId: userData._id,
          patientName: userData.name,
          departments: selectedDepartments
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Visit memo created successfully');
        setSelectedDepartments([]);
        setShowCreateForm(false);
        fetchActiveMemos();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error creating visit memo:', error);
      toast.error('Failed to create visit memo');
    } finally {
      setCreating(false);
    }
  };

  const joinDepartmentQueue = async (memoId, departmentId) => {
    if (!token) {
      toast.warning('Please login to join the queue');
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/departments/${departmentId}/join-queue`,
        
        { 
          userId: userData._id, 
          patientName: userData.name, 
          memoId,
          departmentCode: departmentId // Add this line to handle string IDs
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Successfully joined the queue');
        fetchActiveMemos();
        // Fetch updated queue data
        await fetchDepartmentQueue(departmentId);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error joining queue:', error);
      toast.error('Failed to join queue');
    }
  };

  // Add new function to process queue data
  const processQueueData = (queueData, activeMemos) => {
    if (!queueData || !queueData.queue || !activeMemos) return null;

    const baseWaitTime = 15; // Base wait time per patient in minutes
    let currentPosition = 0;

    const processedQueue = queueData.queue.map((patient, index) => {
      currentPosition++;
      
      // Find patient's memo if they exist in activeMemos
      const patientMemo = activeMemos.find(memo => 
        memo.departments.some(dept => dept.visitId === patient._id)
      );

      return {
        position: currentPosition,
        tokenNumber: patient.tokenNumber || index + 1,
        patientName: patient.patientName,
        patientId: patient.patientId,
        status: patient.status || 'waiting',
        waitTime: baseWaitTime * currentPosition,
        isCurrentUser: patientMemo ? true : false
      };
    });

    return {
      currentQueueSize: processedQueue.length,
      estimatedTotalWaitTime: baseWaitTime * processedQueue.length,
      queue: processedQueue
    };
  };

  // Update fetchDepartmentQueue to use the new processing function
  const fetchDepartmentQueue = async (departmentId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/departments/${departmentId}/queue`);
      if (response.data.success) {
        const processedData = processQueueData(response.data.queueData, activeMemos);
        setQueueData(processedData);
      } else {
        // Handle unsuccessful response
        setQueueData({
          currentQueueSize: 0,
          estimatedTotalWaitTime: 0,
          queue: []
        });
        toast.error('Failed to fetch queue data');
      }
    } catch (error) {
      console.error('Error fetching queue data:', error);
      // Set empty queue data on error
      setQueueData({
        currentQueueSize: 0,
        estimatedTotalWaitTime: 0,
        queue: []
      });
      toast.error('Failed to fetch queue data');
    } finally {
      setLoading(false);
    }
  };

  // Add click handler for department expansion
  const handleDepartmentClick = async (departmentId) => {
    if (expandedDept === departmentId) {
      setExpandedDept(null);
      setQueueData(null);
    } else {
      setExpandedDept(departmentId);
      await fetchDepartmentQueue(departmentId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <FaClipboardList className="mr-2 text-blue-600" />
          Visit Memo
        </h2>
        {/* {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <FaClipboardList className="mr-2" />
            Create New Visit Memo
          </button>
        )} */}
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Create New Visit Memo</h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setSelectedDepartments([]);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Select the departments you need to visit today:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {departments.map(dept => (
              <div
                key={dept._id}
                onClick={() => handleDepartmentSelect(dept._id)}
                className={`p-3 rounded-md cursor-pointer transition-all flex items-center ${
                  selectedDepartments.includes(dept._id)
                    ? 'bg-blue-100 border-l-4 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                  <FaHospital className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{dept.name}</h4>
                  <p className="text-xs text-gray-500">{dept.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={createVisitMemo}
              disabled={creating || selectedDepartments.length === 0}
              className={`px-4 py-2 rounded-md text-white flex items-center ${
                creating || selectedDepartments.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {creating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>Create Visit Memo</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Active Visit Memos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Your Active Visit Memos</h3>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : activeMemos.length > 0 ? (
          <div className="space-y-6">
            {activeMemos.map(memo => (
              <div key={memo._id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <FaUserInjured className="text-blue-600 mr-2" />
                      <span className="font-medium">{memo.patientName}</span>
                      
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {new Date(memo.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    {memo.status === 'active' ? (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Completed
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Departments to Visit:</h4>
                  <div className="space-y-3">
                    {memo.departments.map((dept, index) => (
                      <div key={index} className="rounded-md overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleDepartmentClick(dept.departmentId)}
                        >
                          <div className="flex items-center">
                            {dept.isVisited ? (
                              <FaCheckCircle className="text-green-500 mr-2" />
                            ) : (
                              <FaHospital className="text-blue-600 mr-2" />
                            )}
                            <div>
                              <div className="font-medium text-gray-800">{dept.departmentName}</div>
                              {dept.tokenNumber && (
                                <div className="text-xs text-gray-500">
                                  Token: #{dept.tokenNumber}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            {dept.visitId ? (
                              getStatusBadge(dept.status || 'waiting')
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  joinDepartmentQueue(memo._id, dept.departmentId);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Join Queue
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Queue Table */}
                        {expandedDept === dept.departmentId && (
                          <div className="border-t border-gray-200 bg-white p-4">
                            {loading ? (
                              <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                              </div>
                            ) : activeMemos.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                      {/* <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Token</th> */}
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wait Time</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {activeMemos.map((memo, index) => (
                                      memo.departments
                                        .filter(d => d.departmentId === dept.departmentId)
                                        .map(department => (
                                          <tr key={memo._id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                            {/* <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{department.tokenNumber || '-'}</td> */}
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{memo.patientId.patientId}</td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm">
                                              {getStatusBadge(department.status || 'waiting')}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                              {15 * (index + 1)} mins
                                            </td>
                                          </tr>
                                        ))
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">No queue data available</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <FaClipboardList className="inline-block text-4xl" />
            </div>
            <p className="text-gray-500">You don't have any active visit memos</p>
            <p className="text-sm text-gray-400 mt-1">
              Create a new visit memo to manage your hospital visits
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitMemo;

// Add this function before the return statement
const getStatusBadge = (status) => {
  switch (status) {
    case 'waiting':
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Waiting</span>;
    case 'in-progress':
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">In Progress</span>;
    case 'completed':
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Completed</span>;
    case 'cancelled':
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Cancelled</span>;
    default:
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Unknown</span>;
  }
};