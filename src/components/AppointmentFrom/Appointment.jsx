import React from 'react';

const SlotBooking = ({
  doctor,
  patientName,
  setPatientName,
  selectedSlot,
  setSelectedSlot,
  selectedDate,
  setSelectedDate,
  onBook
}) => {
  return (
    <div className="p-6 rounded-lg shadow-sm bg-white">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Book Appointment</h2>
        <p className="text-sm text-gray-500">With {doctor.name}</p>
      </div>

      <div className="space-y-4">
        {/* Doctor Info */}
        <div className="p-3 bg-blue-50 rounded-md flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-sm">{doctor.name}</div>
            <div className="text-xs text-gray-600">{doctor.specialization}</div>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-8"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Patient Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Name
          </label>
          <input
            type="text"
            value={patientName}
            onChange={e => setPatientName(e.target.value)}
            placeholder="Enter patient name"
            className="w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Time Slot */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Slot
          </label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="w-full p-2 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select time</option>
            {doctor.availableSlots.map((slot, idx) => (
              <option key={idx} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        {/* Book Button */}
        <button
          onClick={onBook}
          disabled={!patientName || !selectedSlot || !selectedDate}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default SlotBooking;
