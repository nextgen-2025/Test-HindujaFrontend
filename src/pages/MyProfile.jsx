import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);

  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext);

  // Function to update user profile data using API
  const updateUserProfileData = async () => {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("phone", userData.phone);
      formData.append("username", userData.username);
      formData.append("address", JSON.stringify(userData.address));
      formData.append("gender", userData.gender);
      formData.append("dob", userData.dob);
      
      formData.append("password", userData.condition);
       if (image) formData.append("image", image);

      const { data } = await axios.post(
        backendUrl + "/api/user/update-profile",
        formData,
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center mb-8">
          {/* Profile Image Section */}
          <div className="mb-4">
            {isEdit ? (
              <label htmlFor="image" className="relative cursor-pointer block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                  <img
                    className="w-full h-full object-cover transition-opacity hover:opacity-75"
                    src={image ? URL.createObjectURL(image) : userData.image}
                    alt="User Profile"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
                  <img
                    className="w-6 h-6"
                    src={image ? "" : assets.upload_icon}
                    alt="Upload Icon"
                  />
                </div>
                <input
                  onChange={(e) => setImage(e.target.files[0])}
                  type="file"
                  id="image"
                  hidden
                />
              </label>
            ) : (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary">
                <img 
                  className="w-full h-full object-cover" 
                  src={userData.image} 
                  alt="User Profile" 
                />
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="text-center mb-6">
            <input
              className="text-3xl font-bold text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
              type="text"
              placeholder="Enter your name"
              disabled={!isEdit}
              onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))}
              value={userData.name}
            />
            <div className="text-gray-600 mt-2">
              Patient ID: {userData.patientId || 'Not Available'}
            </div>
          </div>

          {/* Edit/Save Button */}
          <button
            onClick={isEdit ? updateUserProfileData : () => setIsEdit(true)}
            className="mb-8 bg-primary text-white px-8 py-2 rounded-full hover:bg-primary/90 transition-colors"
          >
            {isEdit ? "Save Changes" : "Edit Profile"}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Account Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Account Information</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Username</label>
                <input
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder="Enter username"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({ ...prev, username: e.target.value }))}
                  value={userData.username}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Password</label>
                <input
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  type="password"
                  placeholder="Enter password"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({ ...prev, password: e.target.value }))}
                  value={userData.password}
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Email</label>
                <p className="p-2 bg-white rounded text-blue-600">{userData.email}</p>
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Phone</label>
                <input
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder="Enter phone number"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({ ...prev, phone: e.target.value }))}
                  value={userData.phone}
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Address</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Address Line 1</label>
                <input
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder="Address Line 1"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value },
                  }))}
                  value={userData.address.line1}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Address Line 2</label>
                <input
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder="Address Line 2"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value },
                  }))}
                  value={userData.address.line2}
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Gender</label>
                <select
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                  value={userData.gender}
                >
                  <option value="Not Selected">Not Selected</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Birthday</label>
                <input
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  type="date"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({ ...prev, dob: e.target.value }))}
                  value={userData.dob}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-gray-600 mb-1">Outgoing Condition</label>
                <input
                  className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  type="text"
                  placeholder="Enter your text here"
                  disabled={!isEdit}
                  onChange={(e) => setUserData((prev) => ({ ...prev, outgoingText: e.target.value }))}
                  value={userData.outgoingText}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
