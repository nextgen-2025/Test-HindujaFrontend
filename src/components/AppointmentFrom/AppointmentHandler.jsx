import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import DoctorSelector from "./Doctor";

const API_URL = process.env.NODE_ENV === 'development' ? "http://localhost:4000" : "https://hinduja-backend-production.up.railway.app";
const socket = io(API_URL);

function AppointmentHandler() {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [step, setStep] = useState(1);
  const [allSlots, setAllSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);

  useEffect(() => {
    // Listen for slot updates
    socket.on('slot-update', (data) => {
      if (selectedDoctor && data.doctorId === selectedDoctor._id) {
        setAllSlots(data.allSlots);
        setBookedSlots(data.bookedSlots);
        
        // If we have a selected date, refresh queue info
        if (selectedDate) {
          fetchQueueInfo(selectedDoctor._id, selectedDate);
        }
      }
    });

    return () => {
      socket.off('slot-update');
    };
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedDoctor) {
      // Fetch initial slots data
      fetchDoctorSlots();
    }
  }, [selectedDoctor]);

  // Fetch queue information when date changes
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchQueueInfo(selectedDoctor._id, selectedDate);
    } else {
      setQueueInfo(null);
    }
  }, [selectedDate]);

  const fetchDoctorSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/doctors/${selectedDoctor._id}/slots`);
      setAllSlots(response.data.allSlots);
      setBookedSlots(response.data.bookedSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const fetchQueueInfo = async (doctorId, date) => {
    try {
      setLoadingQueue(true);
      const response = await axios.get(`${API_URL}/api/doctors/${doctorId}/queue/${date}`);
      setQueueInfo(response.data);
    } catch (error) {
      console.error('Error fetching queue info:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot || !patientName) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/api/doctors/${selectedDoctor._id}/book`, {
        docId: selectedDoctor._id,
        date: selectedDate,
        patientName: patientName,
        slot: selectedSlot
      });
      console.log(response);

      if (response.status === 200) {
        alert(response.data.message || "Slot booked successfully");
        // Update local state with new booking data
        setBookedSlots(response.data.bookedSlots);
        console.log(allSlots);

        // Refresh queue info
        fetchQueueInfo(selectedDoctor._id, selectedDate);

        // Reset selection
        setSelectedSlot("");
        setPatientName("");
        setSelectedDate("");
      } else {
        alert("Failed to book slot");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || "Failed to book slot. Please try again.");
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedDoctor(null);
    setPatientName("");
    setSelectedSlot("");
    setSelectedDate("");
    setAllSlots([]);
    setBookedSlots([]);
    setQueueInfo(null);
  };

  const isSlotBooked = (slot) => {
    return bookedSlots.some(bookedSlot =>
      bookedSlot.date === selectedDate && bookedSlot.slot === slot
    );
  };

  // Get slot status and styling
  const getSlotStatus = (slot) => {
    const booked = isSlotBooked(slot);
    const selected = slot === selectedSlot;

    if (booked) {
      return {
        className: "bg-gray-100 text-gray-400 hover:cursor-not-allowed",
        label: "Booked"
      };
    } else if (selected) {
      return {
        className: "bg-blue-500 text-white",
        label: "Available"
      };
    } else {
      return {
        className: "bg-blue-50 text-blue-600 hover:bg-blue-100",
        label: "Available"
      };
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Progress Steps with Back Button */}
      <div className="mb-6 flex items-center">
        {step === 2 && (
          <button
            onClick={handleBack}
            className="mr-4 flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
                }`}>
                1
              </div>
              <div className="ml-2 text-sm font-medium text-gray-700">Select Doctor</div>
            </div>
            <div className="flex-1 mx-4 h-0.5 bg-gray-200">
              <div className={`h-full bg-blue-600 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className="flex items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                2
              </div>
              <div className={`ml-2 text-sm font-medium ${step === 2 ? 'text-gray-700' : 'text-gray-400'}`}>
                Book Slot
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        <div className={`transition-all duration-300 ${step === 2 ? 'animate-slideDown' : ''}`}>
          {step === 1 ? (
            <DoctorSelector
              setSelectedDoctor={(doctor) => {
                setSelectedDoctor(doctor);
                setStep(2);
              }}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Book Appointment with {selectedDoctor.name}</h3>

              {/* Patient Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter patient name"
                />
              </div>

              {/* Date Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Queue Information */}
              {selectedDate && (
                <div className="mb-4 p-3 border rounded-md bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Queue Status</h4>
                  {loadingQueue ? (
                    <div className="text-sm text-gray-500">Loading queue information...</div>
                  ) : queueInfo ? (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Total Patients: {queueInfo.totalPatients}</span>
                        <span className="text-xs text-gray-500">{selectedDate}</span>
                      </div>
                      {queueInfo.queue.length > 0 ? (
                        <div className="max-h-32 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b">
                                <th className="py-1 text-left">Position</th>
                                <th className="py-1 text-left">Patient</th>
                                <th className="py-1 text-left">Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {queueInfo.queue.map((patient) => (
                                <tr key={patient.position} className="border-b border-gray-100">
                                  <td className="py-1">{patient.position}</td>
                                  <td className="py-1">{patient.patientName}</td>
                                  <td className="py-1">{patient.time}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No patients in queue for this date</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No queue information available</div>
                  )}
                </div>
              )}

              {/* Time Slots */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Slots</label>
                <div className="grid grid-cols-4 gap-2">
                  {allSlots.map((slot) => {
                    const { className, label } = getSlotStatus(slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => !isSlotBooked(slot) && setSelectedSlot(slot)}
                        disabled={isSlotBooked(slot)}
                        className={`p-2 rounded-md text-center transition-colors ${className}`}
                      >
                        <div className="text-sm font-medium">{slot}</div>
                        <div className="text-xs">{label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={handleBooking}
                disabled={!selectedSlot || !selectedDate || !patientName}
                className="w-full bg-blue-500 text-white py-3 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppointmentHandler;
