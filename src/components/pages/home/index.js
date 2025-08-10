'use client'
import Link from 'next/link';
import { useState } from 'react';
import {  FaWifi, FaTshirt, FaParking, FaShieldAlt, FaStar, FaHandHoldingWater, FaHandsWash } from 'react-icons/fa';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  const features = [
    {
      icon: <FaHandHoldingWater className="text-3xl text-amber-500" />,
      title: "বিশুদ্ধ পানি",
      description: "দৈনিক বিশুদ্ধ পানির সরবরাহ, আধুনিক পরিশোধন প্রযুক্তিতে প্রস্তুত নিরাপদ ও স্বাস্থ্যকর পানীয় জল।"
    },
    {
      icon: <FaWifi className="text-3xl text-amber-500" />,
      title: "High-Speed WiFi",
      description: "পড়াশোনা আর বিনোদনের জন্য নিরবিচারে দ্রুতগতির ইন্টারনেট সারাদিনই।"
    },
    {
      icon: <FaHandsWash className="text-3xl text-amber-500" />,
      title: "Cleaning Service",
      description: "নিয়মিত পরিষ্কার-পরিচ্ছন্ন পরিবেশ — স্বাস্থ্যকর ও আরামদায়ক থাকার নিশ্চয়তা।"
    },
    {
      icon: <FaParking className="text-3xl text-amber-500" />,
      title: "Free WiFi",
      description: "পড়াশোনা হোক বা বিনোদন, এখন থাকুন সবসময় কানেক্টেড — কোনো অতিরিক্ত খরচ ছাড়াই।"
    },
    {
      icon: <FaShieldAlt className="text-3xl text-amber-500" />,
      title: "24/7 Security",
      description: "আপনার নিরাপত্তায় সারাক্ষণ সিসিটিভি নজরদারি থাকে।"
    }
  ];

  const testimonials = [
    {
      name: "Raj Sharma",
      role: "Engineering Student",
      text: "মেসের পরিবেশ শান্ত ও নিরাপদ। পড়াশোনার জন্য খুবই উপযোগী।",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Medical Student",
      text: "উচ্চগতির ইন্টারনেট আর নিরিবিলি পরিবেশ পড়াশোনার জন্য দারুণ সহায়ক।",
      rating: 4
    },
    {
      name: "Amit Singh",
      role: "MBA Student",
      text: "বন্ধুসুলভ ব্যবস্থাপনা এবং দ্রুত সমস্যার সমাধান মেসটিকে আরও আরামদায়ক করেছে।",
      rating: 5
    }
  ];

  const gallery = [
    "/mess-dining.jpg",
    "/mess-food.jpg",
    "/mess-room.jpg",
    "/mess-study.jpg",
    "/mess-kitchen.jpg"
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-800 to-gray-900 py-20 md:py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
              আপনার পারফেক্ট <span className="text-amber-500">স্টুডেন্ট লাইফ</span> শুরু হোক এখান থেকেই।
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
              সুস্বাদু খাবার, শান্তিপূর্ণ ঘর, আর ভালো বন্ধুমনস্ক পরিবেশ —
পড়াশোনার জন্য একদম পারফেক্ট একটা জায়গা।
এখনই জয়েন করুন, নিশ্চিন্তে থাকুন!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={"/contact"} className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition duration-300">
                  Book a Visit
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="relative h-80 md:h-96 w-full">
                  {/* Image slider */}
                  <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                    {gallery.map((img, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-80 md:h-96" />
                      </div>
                    ))}
                  </div>
                  {/* Navigation buttons */}
                  <button 
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/75 transition duration-300"
                  >
                    <IoIosArrowBack className="text-white text-xl" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/75 transition duration-300"
                  >
                    <IoIosArrowForward className="text-white text-xl" />
                  </button>
                  {/* Dots indicator */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {gallery.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          activeSlide === index ? "bg-amber-500 w-6" : "bg-gray-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">কেন আমাদের মেস বেছে নেবেন?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
            আমরা দিচ্ছি একজন শিক্ষার্থীর আরামদায়ক ও সফল কলেজ জীবনের জন্য প্রয়োজনীয় সবকিছু।
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-900 p-6 rounded-xl border border-gray-700 hover:border-amber-500 transition-all duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ছাত্রদের অভিমত</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
            যারা আমাদের মেসকে নিজের দ্বিতীয় বাড়ি বানিয়েছে, তাদের অভিজ্ঞতা শুনে নিন।
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`text-xl ${i < testimonial.rating ? "text-amber-500" : "text-gray-600"}`} 
                    />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
                {/* <div>
                  <h4 className="font-bold text-lg">{testimonial.name}</h4>
                  <p className="text-amber-500">{testimonial.role}</p>
                </div> */}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}