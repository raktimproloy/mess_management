'use client'
import { useState } from 'react';
import { FaClock, FaComments, FaHeadset, FaLightbulb, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Toast from '../../common/Toast';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const benefits = [
    {
      icon: <FaClock className="text-3xl text-amber-500" />,
      title: "দ্রুত সাড়া",
      description: "আমাদের সহায়তা দল সাধারণত ১ কর্মঘণ্টার মধ্যেই সাড়া দেয়"
    },
    {
      icon: <FaComments className="text-3xl text-amber-500" />,
      title: "বন্ধুসুলভ সহায়তা",
      description: "শিক্ষার্থী-কেন্দ্রিক উপদেষ্টা যারা আপনার প্রয়োজন বোঝে"
    },
    {
      icon: <FaLightbulb className="text-3xl text-amber-500" />,
      title: "বিশেষজ্ঞ পরামর্শ",
      description: "আপনার পরিস্থিতির জন্য ব্যক্তিগত সুপারিশ পান"
    }
  ];

  const reasons = [
    "Get answers about meal plans and dietary options",
    "Learn about availability and room types",
    "Schedule an in-person tour of our facilities",
    "Discuss special requirements or accommodations",
    "Resolve any concerns or issues promptly",
    "Get information about upcoming events and activities"
  ];

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
      <div className="min-h-screen bg-gray-900 text-gray-100">
        {/* Breadcrumb */}
        <div className="py-6 px-4 bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/" className="text-gray-400 hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-amber-500 font-medium">Contact</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-r from-gray-800 to-gray-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-5">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                আমরা আপনার <span className="text-amber-500"> সাহায্যে </span>প্রস্তুত
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                আমাদের মেস সেবা সম্পর্কে কোনো প্রশ্ন আছে? আবাসন, খাবার বা অন্যান্য সুবিধা নিয়ে যেকোনো জিজ্ঞাসায় আমাদের বন্ধুসুলভ টিম সবসময় আপনার সহায়তায় প্রস্তুত।
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="absolute -inset-4 bg-amber-500 rounded-2xl transform rotate-6 opacity-20"></div>
                  <div className="relative bg-gray-800 border border-amber-500/30 rounded-2xl overflow-hidden w-full max-w-md">
                    <div className="p-8">
                      <div className="flex items-center mb-8">
                        <div className="bg-amber-500 text-gray-900 p-3 rounded-lg mr-4">
                          <FaHeadset className="text-2xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">ছাত্র সহায়তা</h2>
                          <p className="text-amber-500">আপনার সহায়তায় সবসময় প্রস্তুত</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className="bg-amber-500/10 p-3 rounded-lg mr-4">
                            <FaClock className="text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">সেবা সময়</h3>
                            <p className="text-gray-400">যেকোনো সময়</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="bg-amber-500/10 p-3 rounded-lg mr-4">
                            <FaComments className="text-amber-500" />
                          </div>
                          <div>
                            <h3 className="font-bold mb-1">আমাদের সাথে যোগাযোগের সেরা উপায়</h3>
                            <p className="text-gray-400">📞 তাত্ক্ষণিক সহায়তার জন্য ফোন</p>
                            <p className="text-gray-400">📧 বিস্তারিত জানার জন্য ইমেইল</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* Benefits Section */}
        <section className="py-16 px-4 bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">কেন শিক্ষার্থীরা আমাদের সহায়তাকে ভালোবাসে</h2>
              <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
              <p className="text-gray-400 max-w-3xl mx-auto">
              আমরা প্রতিশ্রুতিবদ্ধ আপনার মেস অভিজ্ঞতাকে যতটা সম্ভব সহজ ও সুন্দর করে তুলতে
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center hover:border-amber-500 transition-all duration-300"
                >
                  <div className="flex justify-center mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-400">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>


      </div>
      
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

export default ContactPage;