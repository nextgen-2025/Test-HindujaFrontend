import React from "react";
import Header from "../components/Hero";
import Banner from "../components/Banner";
import AppointmentHandler from "../components/AppointmentFrom/AppointmentHandler";
import { NavLink } from "react-router-dom";
import { FaClipboardList } from "react-icons/fa";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div id="speciality" className="mb-8">
          <AppointmentHandler />
        </div>

        <div className="flex justify-center mb-8">
          <NavLink 
            to="/visit-memo" 
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            <FaClipboardList className="text-xl" />
            <span className="font-medium">View Visit Memos</span>
          </NavLink>
        </div>
      </div>
      <div className="mt-auto">
        <Banner />
      </div>
    </div>
  );
};

export default Home;