'use client'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaComments, FaHeadset, FaLightbulb } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const benefits = [
    {
      icon: <FaClock className="text-3xl text-amber-500" />,
      title: "Quick Response",
      description: "Our support team typically responds within 1 business hour"
    },
    {
      icon: <FaComments className="text-3xl text-amber-500" />,
      title: "Friendly Support",
      description: "Student-focused advisors who understand your needs"
    },
    {
      icon: <FaLightbulb className="text-3xl text-amber-500" />,
      title: "Expert Guidance",
      description: "Get personalized recommendations for your situation"
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

  return (
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
                We're Here to <span className="text-amber-500">Help You</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Have questions about our mess services? Our friendly team is ready to assist you with any inquiries about accommodation, meals, or facilities.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#contact-info" 
                  className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  Contact Information
                </a>
                <a 
                  href="#why-contact" 
                  className="bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500/10 font-bold py-3 px-8 rounded-lg transition duration-300"
                >
                  Why Contact Us?
                </a>
              </div>
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
                        <h2 className="text-xl font-bold">Student Support Team</h2>
                        <p className="text-amber-500">Ready to assist you</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="bg-amber-500/10 p-3 rounded-lg mr-4">
                          <FaClock className="text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Operating Hours</h3>
                          <p className="text-gray-400">Monday-Saturday: 8AM - 10PM</p>
                          <p className="text-gray-400">Sunday: 9AM - 8PM</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-amber-500/10 p-3 rounded-lg mr-4">
                          <FaComments className="text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-bold mb-1">Best Ways to Reach Us</h3>
                          <p className="text-gray-400">Phone for immediate assistance</p>
                          <p className="text-gray-400">Email for detailed inquiries</p>
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
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Students Love Our Support</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
              We're committed to making your mess experience as smooth as possible
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

      {/* Reasons to Contact */}
      <section id="why-contact" className="py-16 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                When to <span className="text-amber-500">Reach Out</span>
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Don't hesitate to contact us for any of these reasons - we're here to make your mess experience better!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-lg">
                  <p className="text-amber-500 font-medium">Serving since 2015</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-lg">
                  <p className="text-amber-500 font-medium">5000+ Happy Students</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
                <ul className="space-y-4">
                  {reasons.map((reason, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <svg className="w-6 h-6 text-amber-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-gray-300">{reason}</span>
                    </motion.li>
                  ))}
                </ul>
                
                <div className="mt-8 p-4 bg-gradient-to-r from-gray-800 to-gray-900 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-500">
                    "The support team helped me transition to a special diet plan within 24 hours. They were incredibly helpful!"
                  </p>
                  <p className="text-gray-400 mt-2">- Priya S., Medical Student</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;