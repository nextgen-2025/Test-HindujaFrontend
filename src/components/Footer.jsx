import React from 'react';
import { Link } from 'react-router-dom';


const Footer = () => {
  return (
    <div className='md:mx-10 px-6 md:px-0'>

      {/* Footer Grid */}
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        {/* Logo + Description */}
        <div>
          <img
            className='mb-4 w-28'
            src="https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/Hinduja_Group_Logo.svg/1200px-Hinduja_Group_Logo.svg.png"
            alt="Hinduja Logo"
          />
          <p className='w-full md:w-2/3 text-gray-600 leading-6'>
            Hinduja simplifies the healthcare journey by providing a seamless way to book appointments, manage records, and access trusted healthcare professionals — all from one platform.
          </p>
        </div>

        {/* Company Links */}
        <div>
          <p className='text-xl font-semibold mb-5 text-gray-800'>Company</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='cursor-pointer hover:text-blue-600 transition'><Link to={'/'} >Home</Link></li>
            <li className='cursor-pointer hover:text-blue-600 transition'><Link to={'/about'} >About Us</Link></li>
            <li className='cursor-pointer hover:text-blue-600 transition'><Link to={'/services'} >Services</Link></li>
            <li className='cursor-pointer hover:text-blue-600 transition'><Link to={'/privacy-policy'} >Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <p className='text-xl font-semibold mb-5 text-gray-800'>Get in Touch</p>
          <ul className='flex flex-col gap-2 text-gray-600'>
            <li className='hover:text-blue-600 transition'>📞 +1 (212) 456-7890</li>
            <li className='hover:text-blue-600 transition'>📧 contact@hindujahealth.com</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div>
        <hr className='border-gray-300' />
        <p className='py-5 text-sm text-center text-gray-500'>
          © 2025 Hinduja Health — All Rights Reserved.
        </p>
      </div>
      
    </div>
  );
};

export default Footer;
