'use client'
import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    alert(`Thank you for your message, ${formData.name}! We'll contact you soon.`);
    setFormData({ name: '', phone: '', message: '' });
  };

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Column - Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FiMail className="mr-2 text-amber-500" />
              Contact Us
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Your Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Tell us about your inquiry..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <FiSend className="mr-2" />
                Send Message
              </button>
            </form>
          </div>
          
          {/* Right Column - Mess Info & Map */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <FiMapPin className="mr-2 text-amber-500" />
              Find Our Mess
            </h2>
            
            <div className="mb-6 bg-gray-800 p-5 rounded-lg border border-gray-700">
              <div className="flex items-start mb-3">
                <div className="bg-amber-500 p-2 rounded-lg mr-3">
                  <FiPhone className="text-gray-900 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Mess Name</h3>
                  <p className="text-gray-400">Delicious Dining Mess</p>
                </div>
              </div>
              
              <div className="flex items-start mb-3">
                <div className="bg-amber-500 p-2 rounded-lg mr-3">
                  <FiPhone className="text-gray-900 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Phone</h3>
                  <p className="text-gray-400">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-amber-500 p-2 rounded-lg mr-3">
                  <FiMapPin className="text-gray-900 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Address</h3>
                  <p className="text-gray-400">
                    123 Food Street, Dining District<br />
                    New Delhi, DL 110001, India
                  </p>
                </div>
              </div>
            </div>
            
            {/* Google Maps iframe */}
            <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.134063518543!2d77.2063103150826!3d28.62870018241874!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cfd5b347eb62d%3A0x52c2b7494e204dce!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1658322345678!5m2!1sen!2sin"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                className="bg-gray-200"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              
              <div className="bg-gray-800 p-3 flex justify-center">
                <button className="text-amber-500 hover:text-amber-400 font-medium flex items-center">
                  <FiMapPin className="mr-2" />
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="bg-gray-950 py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-gray-500 text-sm text-center">
              &copy; {new Date().getFullYear()} Mess Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;