import React from "react";
import { assets } from "../assets/assets";

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between bg-primary rounded-lg px-6 md:px-10 lg:px-20 py-10 md:py-[5vw] text-white">
      
      {/* --------- Header Left --------- */}
      <div className="w-full text-center md:text-left flex flex-col gap-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
          Book Appointments with Trusted Doctors
        </h1>
        <p className="text-sm md:text-base max-w-xl font-light m-auto md:m-0 text-white/90">
          Access a curated network of verified healthcare professionals. Choose your preferred specialist, select a time, and book your appointment in just a few clicks.
        </p>
        
        <div className="mt-4">
          <a
            href="#speciality"
            className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full text-sm font-medium hover:scale-105 transition-all duration-300"
          >
            Book Appointment
            <img className="w-4" src={assets.arrow_icon} alt="arrow" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
