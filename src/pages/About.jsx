import React from 'react';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className='px-6 md:px-20'>

      {/* Section Title */}
      <div className='text-center text-3xl font-semibold pt-10 text-gray-700'>
        <p>ABOUT <span className='text-blue-600'>US</span></p>
      </div>

      {/* About Section */}
      <div className='my-12 flex flex-col md:flex-row gap-12 items-center'>
        <img className='w-full md:max-w-[400px] rounded-xl shadow-md' src={assets.about_image} alt="About Hinduja" />
        <div className='flex flex-col gap-6 md:w-2/3 text-[15px] text-gray-600 leading-6'>
          <p>
            Welcome to <strong>Hinduja</strong> — your trusted digital partner in simplifying healthcare. 
            At Hinduja, we recognize the everyday challenges individuals face while booking doctor appointments, maintaining health records, and navigating care routines.
          </p>
          <p>
            We're dedicated to transforming the healthcare experience through seamless technology, ensuring that managing your health becomes effortless, secure, and reliable.
          </p>
          <p>
            Whether you're scheduling your first consultation or managing long-term care, Hinduja supports you at every stage with intuitive tools and reliable connections to certified healthcare professionals.
          </p>
          <div>
            <h3 className='text-gray-800 font-semibold text-lg mt-4 mb-2'>Our Vision</h3>
            <p>
              At Hinduja, our vision is to revolutionize the healthcare ecosystem by bridging the gap between patients and providers. 
              We aim to offer accessible, smart, and personalized health services — making quality care available anytime, anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className='text-center text-2xl font-semibold text-gray-700 mb-8'>
        <p>WHY <span className='text-blue-600'>CHOOSE US</span></p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-24 text-[15px]'>
        <div className='border p-8 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded cursor-pointer'>
          <h4 className='font-bold mb-2'>EFFICIENCY</h4>
          <p>Streamlined appointment scheduling tailored to your daily routine.</p>
        </div>
        <div className='border p-8 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded cursor-pointer'>
          <h4 className='font-bold mb-2'>CONVENIENCE</h4>
          <p>Instant access to verified healthcare professionals near you.</p>
        </div>
        <div className='border p-8 hover:bg-blue-600 hover:text-white transition-all duration-300 rounded cursor-pointer'>
          <h4 className='font-bold mb-2'>PERSONALIZATION</h4>
          <p>Smart reminders and custom health tips to help you stay in control.</p>
        </div>
      </div>

    </div>
  );
};

export default About;
