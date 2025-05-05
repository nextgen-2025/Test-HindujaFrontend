import React from "react";
import Header from "../components/Hero";
import Banner from "../components/Banner";
import AppointmentHandler from "../components/AppointmentFrom/AppointmentHandler";
import { NavLink } from "react-router-dom";
import { FaClipboardList } from "react-icons/fa";

const Home = () => {
  return (
    <div>
      <Header />
      <div id="speciality">
        <AppointmentHandler />
      </div>
      <NavLink to="/visit-memo" className="nav-link">
        <FaClipboardList className="mr-2" />
        View Visit Memos
      </NavLink>
      <Banner />
    </div>
  );
};

export default Home;