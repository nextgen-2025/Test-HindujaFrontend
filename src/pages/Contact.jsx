import React from 'react';
import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div className='px-6 md:px-20'>

      {/* Section Title */}
      <div className='text-center text-3xl font-semibold pt-10 text-gray-800'>
        <p>Get In <span className='text-blue-600'>Touch</span></p>
        <p className='text-sm text-gray-500 mt-2'>We're here to help with appointments, questions, or anything else!</p>
      </div>

      {/* Contact Content */}
      <div className='my-14 flex flex-col-reverse md:flex-row gap-12 text-sm'>

        {/* Left: Info */}
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-700'>📍 Our Office</p>
          <p className='text-gray-600 leading-6'>
            54709 Willms Station, Suite 350 <br />
            Washington, USA
          </p>

          <p className='text-gray-600'>
            📞 Tel: <a href="tel:+14155550132" className='hover:text-blue-600'>(415) 555-0132</a> <br />
            📧 Email: <a href="mailto:prescripto@gmail.com" className='hover:text-blue-600'>hinduja@gmail.com</a>
          </p>

          <p className='font-semibold text-xl text-gray-700 pt-4'>💼 Careers at Hinduja</p>
          <p className='text-gray-600'>Join our mission to improve lives. Explore open positions and make a difference.</p>
          <button className='border border-gray-800 px-6 py-3 rounded hover:bg-gray-800 hover:text-white transition duration-300'>Explore Careers</button>

          <p className='font-semibold text-xl text-gray-700 pt-4'>📅 Need to Book an Appointment?</p>
          <p className='text-gray-600'>Our team is available Monday to Saturday. Schedule your appointment online now!</p>
          <button className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition duration-300'>Book an Appointment</button>
        </div>

        {/* Right: Image */}
        <img className='w-full md:max-w-[400px] object-cover rounded-xl shadow-md' src={assets.contact_image} alt="Contact Us" />

      </div>
    </div>
  );
};

export default Contact;
