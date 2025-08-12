'use client'
import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend, FiLoader } from 'react-icons/fi';
import Toast from '../../common/Toast';

const Footer = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  
  const hideToast = () => {
    setToast(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showToast(result.message, 'success');
        setFormData({ name: '', phone: '', message: '' });
      } else {
        showToast(result.message || 'Failed to send message. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
                    placeholder="Enter your name"
                    required
                    disabled={isLoading}
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
                    placeholder="Enter your phone number"
                    required
                    disabled={isLoading}
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
                    placeholder="Enter your message"
                    required
                    disabled={isLoading}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-not-allowed text-gray-900 font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" />
                      Send Message
                    </>
                  )}
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
                    <p className="text-gray-400">Avilash Palace</p>
                  </div>
                </div>
                
                <div className="flex items-start mb-3">
                  <div className="bg-amber-500 p-2 rounded-lg mr-3">
                    <FiPhone className="text-gray-900 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Phone</h3>
                    <p className="text-gray-400">+880 1303 644 935</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-amber-500 p-2 rounded-lg mr-3">
                    <FiMapPin className="text-gray-900 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Address</h3>
                    <p className="text-gray-400">
                      519/3 Dharampur, Kazla<br />
                      Rajshahi, Bangladesh
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Google Maps iframe */}
              <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d330.6657034261761!2d88.63957760105643!3d24.362000720809316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fbf025dd4339d5%3A0xcfab41648bffd897!2sPalace%20desire!5e0!3m2!1sen!2sbd!4v1755018806316!5m2!1sen!2sbd"
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
                &copy; {new Date().getFullYear()} Avilash Palace. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
};

export default Footer;