import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' ? "http://localhost:4000" : "https://hinduja-backend-production.up.railway.app";

const DoctorSelector = ({ setSelectedDoctor }) => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [hoveredDoctor, setHoveredDoctor] = useState(null);
  const [queuePreview, setQueuePreview] = useState(null);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Fetch doctors data from the API
  useEffect(() => {
    const fetchDoctorsData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/doctors`);
        setDoctorsData(response.data);
      } catch (error) {
        console.error('Error fetching doctors data:', error);
      }
    };

    fetchDoctorsData();
  }, []);

  // Fetch queue preview when hovering over a doctor
  useEffect(() => {
    if (hoveredDoctor) {
      const today = new Date().toISOString().split('T')[0];
      fetchQueuePreview(hoveredDoctor._id, today);
    } else {
      setQueuePreview(null);
    }
  }, [hoveredDoctor]);

  const fetchQueuePreview = async (doctorId, date) => {
    try {
      setLoadingQueue(true);
      const response = await axios.get(`${API_URL}/api/doctors/${doctorId}/queue/${date}`);
      setQueuePreview(response.data);
    } catch (error) {
      console.error('Error fetching queue preview:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  // Group doctors by specialization
  const doctorsBySpecialty = doctorsData.reduce((acc, doctor) => {
    const specialty = doctor.specialization || 'General Physician';
    if (!acc[specialty]) {
      acc[specialty] = [];
    }
    acc[specialty].push(doctor);
    return acc;
  }, {});

  const specialties = Object.keys(doctorsBySpecialty);

  return (
    <div className="p-4 rounded-lg shadow-sm bg-white">
      {/* Header */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Select Doctor</h2>
        <p className="text-xs text-gray-500">Choose your preferred doctor by specialty</p>
      </div>

      {/* Specialty Selection */}
      <div className="mb-4 -mx-1">
        <div className="flex flex-wrap gap-1.5 px-1">
          <button
            onClick={() => setSelectedSpecialty("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all
              ${selectedSpecialty === "all"
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            All
          </button>
          {specialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all
                ${selectedSpecialty === specialty
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {specialty} ({doctorsBySpecialty[specialty].length})
            </button>
          ))}
        </div>
      </div>

      {/* Doctors List */}
      <div className="max-h-[360px] pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(doctorsBySpecialty)
            .filter(([specialty]) =>
              selectedSpecialty === "all" || specialty === selectedSpecialty
            )
            .map(([specialty, doctors]) =>
              doctors.map((doctor) => (
                <div 
                  key={doctor._id}
                  className="relative"
                  onMouseEnter={() => setHoveredDoctor(doctor)}
                  onMouseLeave={() => setHoveredDoctor(null)}
                >
                  <button
                    onClick={() => setSelectedDoctor(doctor)}
                    className="group p-2.5 border rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all bg-white text-left w-full"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-3.5 h-3.5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="font-medium text-sm truncate group-hover:text-blue-600">
                            Dr. {doctor.name}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <svg
                              className="w-2 h-2 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <circle cx="10" cy="10" r="10" />
                            </svg>
                            <span className="text-[10px] text-gray-400">
                              {doctor.allSlots ? doctor.allSlots.length : 0} slots
                            </span>
                          </div>
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {doctor.specialization}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Queue Preview Tooltip */}
                  {hoveredDoctor && hoveredDoctor._id === doctor._id && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border rounded-md shadow-lg p-2 text-xs">
                      <div className="font-medium text-gray-700 mb-1">Today's Queue</div>
                      {loadingQueue ? (
                        <div className="text-gray-500">Loading...</div>
                      ) : queuePreview ? (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">Total: {queuePreview.totalPatients}</span>
                            <span className="text-gray-500 text-[10px]">{new Date().toLocaleDateString()}</span>
                          </div>
                          {queuePreview.queue.length > 0 ? (
                            <div className="max-h-24 overflow-y-auto">
                              <table className="w-full text-[10px]">
                                <thead>
                                  <tr className="border-b">
                                    <th className="py-0.5 text-left">Pos</th>
                                    <th className="py-0.5 text-left">Patient</th>
                                    <th className="py-0.5 text-left">Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {queuePreview.queue.slice(0, 3).map((patient) => (
                                    <tr key={patient.position} className="border-b border-gray-100">
                                      <td className="py-0.5">{patient.position}</td>
                                      <td className="py-0.5">{patient.patientName}</td>
                                      <td className="py-0.5">{patient.time}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {queuePreview.queue.length > 3 && (
                                <div className="text-center text-[10px] text-gray-500 mt-1">
                                  +{queuePreview.queue.length - 3} more patients
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-gray-500">No patients in queue today</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500">No queue information available</div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSelector;
