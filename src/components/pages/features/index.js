'use client'
import { useState, useEffect } from 'react';
import { 
  FaCalendarAlt, 
  FaUtensils, 
  FaCreditCard, 
  FaChartLine, 
  FaUserFriends,
  FaClipboardList,
  FaBell,
  FaMapMarkedAlt,
  FaLightbulb,
  FaMobileAlt,
  FaShieldAlt,
  FaSync
} from 'react-icons/fa';

const FeaturesPage = () => {
  const [activeFeature, setActiveFeature] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      id: 1,
      icon: <FaCalendarAlt className="text-3xl" />,
      title: "Online Booking",
      description: "Students can book mess seats online with real-time availability tracking and instant confirmation",
      benefits: ["Real-time seat availability", "Instant booking confirmation", "Automated waitlist management"],
      stats: "Reduces booking time by 80%",
      color: "amber"
    },
    {
      id: 2,
      icon: <FaUtensils className="text-3xl" />,
      title: "Menu Management",
      description: "Create weekly menus, track nutrition values, and handle special dietary requirements",
      benefits: ["Nutritional analysis", "Special diet plans", "Waste reduction tracking"],
      stats: "30% reduction in food waste",
      color: "green"
    },
    {
      id: 3,
      icon: <FaCreditCard className="text-3xl" />,
      title: "Payment System",
      description: "Secure online payments with multiple options, automated billing, and receipt generation",
      benefits: ["Multiple payment options", "Automated billing", "Digital receipts"],
      stats: "99% on-time payment rate",
      color: "blue"
    },
    {
      id: 4,
      icon: <FaChartLine className="text-3xl" />,
      title: "Feedback & Analytics",
      description: "Collect student feedback, generate reports, and gain insights to improve operations",
      benefits: ["Real-time feedback", "Performance analytics", "Actionable insights"],
      stats: "95% satisfaction rate",
      color: "purple"
    },
    {
      id: 5,
      icon: <FaUserFriends className="text-3xl" />,
      title: "Attendance Tracking",
      description: "Automated student attendance with RFID/NFC technology for accurate meal tracking",
      benefits: ["Contactless check-in", "Meal usage tracking", "Real-time reports"],
      stats: "99% attendance accuracy",
      color: "red"
    },
    {
      id: 6,
      icon: <FaClipboardList className="text-3xl" />,
      title: "Inventory Management",
      description: "Track ingredients, automate purchase orders, and reduce food waste",
      benefits: ["Smart inventory tracking", "Automated ordering", "Waste analytics"],
      stats: "25% cost savings",
      color: "cyan"
    }
  ];

  const additionalFeatures = [
    {
      icon: <FaBell className="text-2xl" />,
      title: "Smart Notifications",
      description: "Automated alerts for menu changes, payment reminders, and special events"
    },
    {
      icon: <FaMapMarkedAlt className="text-2xl" />,
      title: "Multi-Location",
      description: "Manage multiple mess locations from a single dashboard"
    },
    {
      icon: <FaLightbulb className="text-2xl" />,
      title: "Energy Monitoring",
      description: "Track energy usage and optimize resource consumption"
    },
    {
      icon: <FaMobileAlt className="text-2xl" />,
      title: "Mobile App",
      description: "Dedicated apps for students and administrators"
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Security Features",
      description: "Role-based access control and data encryption"
    },
    {
      icon: <FaSync className="text-2xl" />,
      title: "Auto Updates",
      description: "Regular feature updates with no downtime"
    }
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Hostel Manager, IIT Delhi",
      text: "Avilash Palace has transformed how we operate. The attendance tracking alone saved us 15 hours per week in administrative work.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Nutritionist, University of Mumbai",
      text: "The menu management system helps us create balanced meals while accommodating various dietary needs efficiently.",
      rating: 5
    },
    {
      name: "Amit Patel",
      role: "Student President, BITS Pilani",
      text: "Our student satisfaction with the mess has increased dramatically since implementing the feedback system. Issues get resolved within hours!",
      rating: 4
    }
  ];

  const stats = [
    { value: "97%", label: "Student Satisfaction" },
    { value: "50+", label: "Mess Locations" },
    { value: "10K+", label: "Active Users" },
    { value: "24/7", label: "Support" }
  ];

  const getColorClass = (color) => {
    const colors = {
      amber: "bg-amber-500",
      green: "bg-green-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      red: "bg-red-500",
      cyan: "bg-cyan-500"
    };
    return colors[color] || "bg-amber-500";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              আধুনিক মেস ব্যবস্থাপনার জন্য <span className="text-amber-500">শক্তিশালী ফিচারসমূহ</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                Everything you need to streamline operations, enhance student experience, and optimize your mess services - all in one platform.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition duration-300">
                  Get Started
                </button>
                <button className="bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500/10 font-bold py-3 px-8 rounded-lg transition duration-300">
                  View Demo
                </button>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute top-0 left-0 w-full h-full bg-amber-500/10 rounded-2xl transform rotate-3"></div>
                <div className="relative bg-gray-800 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="p-4 bg-gray-700 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="p-8">
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {features.slice(0, 3).map((feature, index) => (
                        <div key={index} className={`${getColorClass(feature.color)}/10 border ${getColorClass(feature.color)}/30 p-4 rounded-xl`}>
                          {feature.icon}
                          <h3 className="text-sm font-semibold mt-2">{feature.title}</h3>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/30 rounded-xl p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold">Monthly Stats</h3>
                        <span className="text-green-500 font-bold">↑ 24%</span>
                      </div>
                      <div className="h-32 bg-gradient-to-r from-amber-500/5 to-purple-500/5 rounded-lg flex items-end justify-around p-2">
                        <div className="w-6 bg-amber-500 rounded-t-lg" style={{ height: '40%' }}></div>
                        <div className="w-6 bg-amber-500 rounded-t-lg" style={{ height: '70%' }}></div>
                        <div className="w-6 bg-amber-500 rounded-t-lg" style={{ height: '90%' }}></div>
                        <div className="w-6 bg-amber-500 rounded-t-lg" style={{ height: '60%' }}></div>
                        <div className="w-6 bg-amber-500 rounded-t-lg" style={{ height: '85%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {features.slice(3, 6).map((feature, index) => (
                        <div key={index} className={`${getColorClass(feature.color)}/10 border ${getColorClass(feature.color)}/30 p-4 rounded-xl`}>
                          {feature.icon}
                          <h3 className="text-sm font-semibold mt-2">{feature.title}</h3>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                <div className="text-3xl md:text-4xl font-bold text-amber-500 mb-2">{stat.value}</div>
                <p className="text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-gray-800 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for mess management operations
            </p>
          </div>

          <div className={`flex ${isMobile ? 'flex-col' : 'gap-8'}`}>
            {/* Feature Selector */}
            <div className={`${isMobile ? 'flex overflow-x-auto py-4 mb-8 gap-4' : 'w-1/3 space-y-4'}`}>
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeFeature === feature.id
                      ? `bg-gradient-to-r ${getColorClass(feature.color)}/10 border-l-4 ${getColorClass(feature.color)}`
                      : 'bg-gray-800 hover:bg-gray-700/50'
                  } ${isMobile ? 'min-w-[280px]' : ''}`}
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg ${getColorClass(feature.color)}/10 mr-4`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Details */}
            <div className={`${isMobile ? '' : 'w-2/3'} bg-gray-800 border border-gray-700 rounded-xl p-8`}>
              {features
                .filter(feature => feature.id === activeFeature)
                .map(feature => (
                  <div key={feature.id} className="animate-fadeIn">
                    <div className="flex items-center mb-8">
                      <div className={`p-4 rounded-xl ${getColorClass(feature.color)}/10 mr-6`}>
                        {feature.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold">{feature.title}</h2>
                        <p className="text-amber-500">{feature.stats}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-amber-500">Key Benefits</h3>
                        <ul className="space-y-3">
                          {feature.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start">
                              <svg className={`w-5 h-5 ${getColorClass(feature.color)} mt-1 mr-3 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                              <span className="text-gray-300">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-6 rounded-xl mb-6">
                          <h3 className="text-lg font-semibold mb-2 text-amber-500">How It Works</h3>
                          <p className="text-gray-300">
                            Our intuitive interface allows mess administrators to manage {feature.title.toLowerCase()} with just a few clicks. 
                            Students can access these features through our mobile app or web portal.
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                          <button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium py-2 px-4 rounded-lg transition duration-300">
                            See Demo
                          </button>
                          <button className="bg-transparent border border-amber-500 text-amber-500 hover:bg-amber-500/10 font-medium py-2 px-4 rounded-lg transition duration-300">
                            Documentation
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900/50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold mb-4 text-amber-500">Perfect For</h3>
                      <div className="flex flex-wrap gap-3">
                        {["College Students", "Hostel Managers", "Mess Committees", "Campus Admins", "Student Groups"].map((item, index) => (
                          <div key={index} className="bg-amber-500/10 border border-amber-500/30 text-amber-500 px-4 py-2 rounded-lg">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20  px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">More Powerful Features</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Everything you need to create the perfect mess management ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300 group">
                <div className="bg-amber-500/10 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>
                <div className="inline-flex items-center text-amber-500 group-hover:text-amber-400 transition-colors">
                  <span>Learn more</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-800 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Mess Managers & Students</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
              Hear from our users who have transformed their mess management experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? "text-amber-500" : "text-gray-600"}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-amber-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default FeaturesPage;