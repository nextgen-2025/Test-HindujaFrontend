import React from "react";
import Header from "../components/Hero";
import Banner from "../components/Banner";
import AppointmentHandler from "../components/AppointmentFrom/AppointmentHandler";


const Home = () => {
  return (
    <div>
      <Header />
      <div id="speciality"><AppointmentHandler/></div>
      <Banner />
    </div>
  );
};

export default Home;
