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
        title: "অনলাইন বুকিং",
        description: "শিক্ষার্থীরা এখন অনলাইনে মেস সিট বুক করতে পারবেন, সঙ্গে থাকবে সরাসরি সিটের খালি থাকার তথ্য এবং সঙ্গে সঙ্গেই কনফার্মেশন।",
        color: "from-amber-500/10 to-amber-500/5",
        hoverColor: "from-amber-500/20 to-amber-500/10"
      },
      {
        id: 2,
        icon: <FaUtensils className="text-3xl" />,
        title: "মেনু ব্যবস্থাপনা",
        description: "সাপ্তাহিক মেনু ডিজাইন, পুষ্টি মান নিরীক্ষণ, এবং বিশেষ খাদ্যসংক্রান্ত প্রয়োজনীয়তা সহজেই পরিচালনা করুন।",
        color: "from-green-500/10 to-green-500/5",
        hoverColor: "from-green-500/20 to-green-500/10"
      },
      {
        id: 3,
        icon: <FaCreditCard className="text-3xl" />,
        title: "পেমেন্ট সিস্টেম",
        description: "নিরাপদ অনলাইন পেমেন্ট, বিভিন্ন পেমেন্ট অপশন, স্বয়ংক্রিয় বিলিং ও রসিদ জেনারেশন সুবিধাসহ।",
        color: "from-blue-500/10 to-blue-500/5",
        hoverColor: "from-blue-500/20 to-blue-500/10"
      },
      {
        id: 4,
        icon: <FaChartLine className="text-3xl" />,
        title: "মতামত ও বিশ্লেষণ",
        description: "শিক্ষার্থীদের মতামত সংগ্রহ করুন, রিপোর্ট তৈরি করুন, এবং অপারেশন উন্নয়নের জন্য তথ্য আহরণ করুন।",
        color: "from-purple-500/10 to-purple-500/5",
        hoverColor: "from-purple-500/20 to-purple-500/10"
      },
      {
        id: 5,
        icon: <FaUserFriends className="text-3xl" />,
        title: "উপস্থিতি পর্যবেক্ষণ",
        description: "আরএফআইডি/এনএফসি প্রযুক্তি ব্যবহার করে স্বয়ংক্রিয় ছাত্র উপস্থিতি ট্র্যাকিং, যা সঠিক মেস খাবারের হিসাব নিশ্চিত করে।",
        color: "from-red-500/10 to-red-500/5",
        hoverColor: "from-red-500/20 to-red-500/10"
      },
      {
        id: 6,
        icon: <FaClipboardList className="text-3xl" />,
        title: "মজুদ ব্যবস্থাপনা",
        description: "উপকরণ ট্র্যাকিং, স্বয়ংক্রিয় ক্রয় আদেশ, এবং খাদ্য অপচয় হ্রাস করার জন্য আধুনিক সমাধান।",
        color: "from-cyan-500/10 to-cyan-500/5",
        hoverColor: "from-cyan-500/20 to-cyan-500/10"
      },
      {
        id: 7,
        icon: <FaBell className="text-3xl" />,
        title: "স্মার্ট নোটিফিকেশন",
        description: "মেনু পরিবর্তন, পেমেন্ট রিমাইন্ডার, এবং বিশেষ ইভেন্টের জন্য স্বয়ংক্রিয় বিজ্ঞপ্তি।",
        color: "from-pink-500/10 to-pink-500/5",
        hoverColor: "from-pink-500/20 to-pink-500/10"
      },
      {
        id: 8,
        icon: <FaMapMarkedAlt className="text-3xl" />,
        title: "মাল্টি-লোকেশন ম্যানেজমেন্ট",
        description: "একটি ড্যাশবোর্ড থেকে একাধিক মেসের অবস্থান পরিচালনা করুন, কেন্দ্রীয় নিয়ন্ত্রণসহ।",
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
                About <span className="text-amber-500">Avilash Palace</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8">
              শিক্ষার্থীদের মেস লাইফকে আধুনিক ও আরামদায়ক করে তুলতে কাজ করছে।
              আমাদের লক্ষ্য, এমন একটি পরিবেশ তৈরি করা — যেখানে থাকবে ঘরের মতো স্বাদ, আরাম, ও বন্ধুবান্ধব কমিউনিটির সাপোর্ট।
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-lg">
                  <p className="text-amber-500 font-medium">Serving since 2010</p>
                </div>
                <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-2 rounded-lg">
                  <p className="text-amber-500 font-medium">1700+ Happy Students</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaUserFriends className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Student Community</h3>
                <p className="text-gray-400">বিভিন্ন ব্যাকগ্রাউন্ড থেকে আগত প্রাণবন্ত শিক্ষার্থীদের আমাদের কমিউনিটিতে যোগ দিন।</p>
              </div>
              {/* <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaUtensils className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quality Food</h3>
                <p className="text-gray-400">Nutritious meals prepared by expert chefs with hygiene standards.</p>
              </div> */}
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <FaHeart className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Care & Support</h3>
                <p className="text-gray-400">২৪ ঘণ্টা, আপনার আরাম ও নিরাপত্তার জন্য সহায়ক কর্মীরা প্রস্তুত।</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <IoIosRocket className="text-amber-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">Modern Facilities</h3>
                <p className="text-gray-400">দ্রুতগতির ওয়াইফাই, খোলা জায়গা এবং বিনোদনের জন্য বিশেষ জায়গা।</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">আমাদের গল্প</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
            কিভাবে আমরা একটি ছোট স্টুডেন্ট মেস থেকে হয়ে উঠলাম শিক্ষার্থীদের সবচেয়ে প্রিয় আবাসনের ঠিকানা।
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 aspect-video">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-amber-500 text-gray-900 font-bold py-3 px-6 rounded-lg">
                Since 2010
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">বিনম্র শুরু থেকে শিক্ষার্থীদের প্রিয় ঠিকানা পর্যন্ত</h3>
              <p className="text-gray-300 mb-6">
              অবিলাশ প্যালেস শুরু হয়েছিল বিশ্ববিদ্যালয় ক্যাম্পাসের কাছে একটি ছোট ভাড়া বাসায় মাত্র ১২ জন ছাত্রের জন্য। মেসের মালিকরাও প্রাক্তন ছাত্র ছিলেন, তাই তারা ভালো আবাসন এবং পুষ্টিকর খাবার সাশ্রয়ী দামে পাওয়ার সমস্যাগুলো ভালভাবে বুঝতে পারতেন।
              </p>
              <p className="text-gray-300 mb-6">
              আজ আমরা আধুনিক সুবিধা ও সহায়ক কমিউনিটি পরিবেশ নিয়ে ১,৭০০+ শিক্ষার্থীর সেবা দিয়ে আসছি। আমাদের এই যাত্রা চালিত হয়েছে শিক্ষার্থীদের মতামত এবং নিরবচ্ছিন্ন উন্নতির প্রতি আমাদের প্রতিশ্রুতির মাধ্যমে।
              </p>
              <div className="flex items-center">
                {/* <div className="mr-4">
                  <div className="bg-amber-500 text-gray-900 font-bold text-3xl px-6 py-3 rounded-lg">8</div>
                  <p className="text-center mt-2 text-gray-400">Locations</p>
                </div> */}
                <div className="mr-4">
                  <div className="bg-amber-500 text-gray-900 font-bold text-3xl px-6 py-3 rounded-lg">1700+</div>
                  <p className="text-center mt-2 text-gray-400">Students</p>
                </div>
                <div>
                  <div className="bg-amber-500 text-gray-900 font-bold text-3xl px-6 py-3 rounded-lg">95%</div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">আমাদের মূল মূল্যবোধ</h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mb-6"></div>
            <p className="text-gray-400 max-w-3xl mx-auto">
            এসবই হলো সেই নীতিমালা যা আমাদের প্রতিটি কাজের পথপ্রদর্শক।
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300">
              <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaMedal className="text-amber-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">গুণগত মান সর্বোচ্চ</h3>
              <p className="text-gray-400">
              খাবারের গুণগত মান এবং থাকার পরিবেশে আমরা কখনো ছাড় দিই না। প্রতিদিন তাজা উপকরণ নিয়ে রান্না করি, আর সুবিধাগুলো সর্বোচ্চ মানে বজায় রাখি।
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300">
              <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaHeart className="text-amber-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">ছাত্রছাত্রীদের সুস্থতা ও কল্যাণ</h3>
              <p className="text-gray-400">
              আপনার শারীরিক ও মানসিক সুস্থতা আমাদের মূল লক্ষ্য।
              পুষ্টিকর খাবার, মানসিক স্বাস্থ্য সেবা, এবং মনোরঞ্জনের মাধ্যমে আমরা আপনাকে সব দিক থেকে সহায়তা করি।
              </p>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 hover:border-amber-500 transition-all duration-300">
              <div className="bg-amber-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                <FaChartLine className="text-amber-500 text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">অবিরত উন্নয়ন</h3>
              <p className="text-gray-400">
              শিক্ষার্থীদের মূল্যবান প্রতিক্রিয়া অনুযায়ী আমরা ক্রমাগত নিজেদের উন্নত করে যাচ্ছি।
              মাসিক জরিপ এবং প্রস্তাবনার মাধ্যমে মেসের অভিজ্ঞতাকে আরও উন্নত করা হয়।
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
          মেস পরিচালনা সহজ করার জন্য এবং শিক্ষার্থীদের অভিজ্ঞতা উন্নত করার জন্য প্রয়োজনীয় সব কিছু।
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
      </div>
    </section>


    </div>
  );
};

export default AboutPage;