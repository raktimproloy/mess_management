'use client'
import { useState } from 'react';
import { 
    FaCalendarAlt, 
    FaCreditCard, 
    FaUtensils,
    FaUserFriends,
    FaMedal,
    FaHeart,
    FaChartLine,
    FaClipboardList,
    FaBell,
    FaMapMarkedAlt
  } from 'react-icons/fa';
import { IoIosRocket } from 'react-icons/io';

const AboutPage = () => {

    const [activeFeature, setActiveFeature] = useState(null);
  
    const features = [
      {
        id: 1,
        icon: <FaCalendarAlt className="text-3xl" />,
        title: "Online Booking",
        description: "Students can book mess seats online with real-time availability tracking and instant confirmation",
        color: "from-amber-500/10 to-amber-500/5",
        hoverColor: "from-amber-500/20 to-amber-500/10"
      },
      {
        id: 2,
        icon: <FaUtensils className="text-3xl" />,
        title: "Menu Management",
        description: "Create weekly menus, track nutrition values, and handle special dietary requirements",
        color: "from-green-500/10 to-green-500/5",
        hoverColor: "from-green-500/20 to-green-500/10"
      },
      {
        id: 3,
        icon: <FaCreditCard className="text-3xl" />,
        title: "Payment System",
        description: "Secure online payments with multiple options, automated billing, and receipt generation",
        color: "from-blue-500/10 to-blue-500/5",
        hoverColor: "from-blue-500/20 to-blue-500/10"
      },
      {
        id: 4,
        icon: <FaChartLine className="text-3xl" />,
        title: "Feedback & Analytics",
        description: "Collect student feedback, generate reports, and gain insights to improve operations",
        color: "from-purple-500/10 to-purple-500/5",
        hoverColor: "from-purple-500/20 to-purple-500/10"
      },
      {
        id: 5,
        icon: <FaUserFriends className="text-3xl" />,
        title: "Attendance Tracking",
        description: "Automated student attendance with RFID/NFC technology for accurate meal tracking",
        color: "from-red-500/10 to-red-500/5",
        hoverColor: "from-red-500/20 to-red-500/10"
      },
      {
        id: 6,
        icon: <FaClipboardList className="text-3xl" />,
        title: "Inventory Management",
        description: "Track ingredients, automate purchase orders, and reduce food waste",
        color: "from-cyan-500/10 to-cyan-500/5",
        hoverColor: "from-cyan-500/20 to-cyan-500/10"
      },
      {
        id: 7,
        icon: <FaBell className="text-3xl" />,
        title: "Smart Notifications",
        description: "Automated alerts for menu changes, payment reminders, and special events",
        color: "from-pink-500/10 to-pink-500/5",
        hoverColor: "from-pink-500/20 to-pink-500/10"
      },
      {
        id: 8,
        icon: <FaMapMarkedAlt className="text-3xl" />,
        title: "Multi-Location",
        description: "Manage multiple mess locations from a single dashboard with centralized control",
        color: "from-indigo-500/10 to-indigo-500/5",
        hoverColor: "from-indigo-500/20 to-indigo-500/10"
      }
    ];
  
    const featureDetails = {
      1: {
        benefits: ["Real-time seat availability", "Instant booking confirmation", "Automated waitlist management"],
        stats: "Reduces booking time by 80%"
      },
      2: {
        benefits: ["Nutritional analysis", "Special diet plans", "Waste reduction tracking"],
        stats: "30% reduction in food waste"
      },
      3: {
        benefits: ["Multiple payment options", "Automated billing", "Digital receipts"],
        stats: "99% on-time payment rate"
      },
      4: {
        benefits: ["Real-time feedback", "Performance analytics", "Actionable insights"],
        stats: "95% satisfaction rate"
      },
      5: {
        benefits: ["Contactless check-in", "Meal usage tracking", "Real-time reports"],
        stats: "99% attendance accuracy"
      },
      6: {
        benefits: ["Smart inventory tracking", "Automated ordering", "Waste analytics"],
        stats: "25% cost savings"
      },
      7: {
        benefits: ["Customizable alerts", "Event reminders", "Menu updates"],
        stats: "40% increase in engagement"
      },
      8: {
        benefits: ["Centralized dashboard", "Location-specific settings", "Unified reporting"],
        stats: "Manage 10+ locations easily"
      }
    };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                About <span className="text-amber-500">MessManager</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                We're revolutionizing the way students experience mess life. Our mission is to create a home-like environment with delicious food, comfortable living, and a supportive community.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-lg">
                  <p className="text-amber-500 font-medium">Serving since 2015</p>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-lg">
                  <p className="text-amber-500 font-medium">5000+ Happy Students</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaUserFriends className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Student Community</h3>
                <p className="text-gray-400">Join our vibrant community of students from diverse backgrounds.</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaUtensils className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quality Food</h3>
                <p className="text-gray-400">Nutritious meals prepared by expert chefs with hygiene standards.</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaHeart className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Care & Support</h3>
                <p className="text-gray-400">24/7 support staff to ensure your comfort and safety.</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <IoIosRocket className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Modern Facilities</h3>
                <p className="text-gray-400">High-speed WiFi, study rooms, and recreational areas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Story</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
              How we transformed from a small student mess to the most preferred accommodation provider
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 aspect-video">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-lg">
                Since 2015
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">From Humble Beginnings to Student Favorite</h3>
              <p className="text-gray-300 mb-6">
                MessManager started with just 12 students in a small rented house near the university campus. Our founders, former students themselves, understood the challenges of finding quality accommodation and nutritious food at affordable prices.
              </p>
              <p className="text-gray-300 mb-6">
                Today, we serve over 1,500 students across 8 locations with modern facilities, diverse menus, and a supportive community environment. Our journey has been fueled by student feedback and our commitment to continuous improvement.
              </p>
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="bg-amber-500 text-gray-900 font-bold text-3xl px-6 py-3 rounded-lg">8</div>
                  <p className="text-center mt-2 text-gray-400">Locations</p>
                </div>
                <div className="mr-4">
                  <div className="bg-amber-500 text-gray-900 font-bold text-3xl px-6 py-3 rounded-lg">1500+</div>
                  <p className="text-center mt-2 text-gray-400">Students</p>
                </div>
                <div>
                  <div className="bg-amber-500 text-gray-900 font-bold text-3xl px-6 py-3 rounded-lg">97%</div>
                  <p className="text-center mt-2 text-gray-400">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
              The principles that guide everything we do at MessManager
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300">
              <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaMedal className="text-amber-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Quality First</h3>
              <p className="text-gray-400">
                We never compromise on food quality or living conditions. Our ingredients are sourced fresh daily, and our facilities are maintained to the highest standards.
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300">
              <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaHeart className="text-amber-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Student Well-being</h3>
              <p className="text-gray-400">
                Your health and happiness are our priority. We provide nutritious meals, mental health support, and recreational activities to help you thrive.
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300">
              <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaChartLine className="text-amber-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Continuous Improvement</h3>
              <p className="text-gray-400">
                We constantly evolve based on student feedback. Monthly surveys and suggestion boxes help us enhance your mess experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Mess Management <span className="text-amber-500">Features</span>
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Everything you need to streamline mess operations and enhance student experience
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl cursor-pointer group ${
                activeFeature === feature.id ? "border-amber-500" : ""
              }`}
              onClick={() => setActiveFeature(feature.id === activeFeature ? null : feature.id)}
            >
              <div className={`h-32 bg-gradient-to-br ${feature.color} group-hover:${feature.hoverColor} flex items-center justify-center transition-all duration-500`}>
                <div className="bg-gray-900/50 p-4 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>
                <div className="flex items-center text-amber-500 group-hover:text-amber-400 transition-colors">
                  <span className="font-medium">Learn more</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Feature Details Panel */}
        {activeFeature && (
          <div className="bg-gray-800 border border-amber-500/30 rounded-xl overflow-hidden mb-16 animate-fadeIn">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">
                  {features.find(f => f.id === activeFeature)?.title}
                </h3>
                <button 
                  onClick={() => setActiveFeature(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-amber-500">Key Benefits</h4>
                  <ul className="space-y-3">
                    {featureDetails[activeFeature].benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-amber-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        <span className="text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-xl mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-amber-500">Impact</h4>
                    <p className="text-gray-300">{featureDetails[activeFeature].stats}</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium py-2 px-4 rounded-lg transition duration-300 text-sm">
                      See Demo
                    </button>
                    <button className="bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500/10 font-medium py-2 px-4 rounded-lg transition duration-300 text-sm">
                      Documentation
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-6 border-t border-gray-700">
              <h4 className="text-lg font-semibold mb-4 text-amber-500">Perfect For</h4>
              <div className="flex flex-wrap gap-3">
                {["College Students", "Hostel Managers", "Mess Committees", "Campus Admins", "Student Groups"].map((item, index) => (
                  <div key={index} className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-2 rounded-lg text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Stats Section */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">97%</div>
            <p className="text-gray-400">Student Satisfaction</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">50+</div>
            <p className="text-gray-400">Mess Locations</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">10K+</div>
            <p className="text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">24/7</div>
            <p className="text-gray-400">Support Available</p>
          </div>
        </div>
      </div>
    </section>

      {/* Testimonial Section */}
      <section className="py-20 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Student Experiences</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Hear from students who call MessManager their home away from home
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                text: "MessManager transformed my college experience. The food is amazing, and I've made friends for life here. It truly feels like a second home!",
                name: "Rahul Singh",
                course: "Engineering Student"
              },
              { 
                text: "As an international student, finding good accommodation was challenging. MessManager provided not just a place to stay, but a supportive community.",
                name: "Sophia Chen",
                course: "Medical Student"
              },
              { 
                text: "The study rooms and high-speed WiFi helped me maintain my grades. Plus, the monthly cultural events make college life so much more enjoyable!",
                name: "Ananya Patel",
                course: "MBA Student"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-xl p-8">
                <div className="text-amber-500 text-4xl mb-4">"</div>
                <p className="text-gray-300 mb-6 italic">{testimonial.text}</p>
                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-amber-500">{testimonial.course}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;