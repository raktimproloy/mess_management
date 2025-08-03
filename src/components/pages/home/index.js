'use client'
import { useState } from 'react';
import { FaUtensils, FaWifi, FaTshirt, FaParking, FaShieldAlt, FaStar } from 'react-icons/fa';
import { IoIosArrowForward, IoIosArrowBack } from 'react-icons/io';

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  
  const features = [
    {
      icon: <FaUtensils className="text-3xl text-amber-500" />,
      title: "Delicious Food",
      description: "Daily fresh meals prepared by expert chefs with diverse menu options"
    },
    {
      icon: <FaWifi className="text-3xl text-amber-500" />,
      title: "High-Speed WiFi",
      description: "Uninterrupted high-speed internet for study and entertainment"
    },
    {
      icon: <FaTshirt className="text-3xl text-amber-500" />,
      title: "Laundry Service",
      description: "Weekly laundry service to keep your clothes fresh and clean"
    },
    {
      icon: <FaParking className="text-3xl text-amber-500" />,
      title: "Secure Parking",
      description: "Dedicated parking space for bicycles and two-wheelers"
    },
    {
      icon: <FaShieldAlt className="text-3xl text-amber-500" />,
      title: "24/7 Security",
      description: "CCTV surveillance and security personnel for your safety"
    }
  ];

  const testimonials = [
    {
      name: "Raj Sharma",
      role: "Engineering Student",
      text: "The mess has been my home away from home. The food is delicious and the staff is very supportive.",
      rating: 5
    },
    {
      name: "Priya Patel",
      role: "Medical Student",
      text: "As a busy med student, I appreciate the flexible meal timings and nutritious food options.",
      rating: 4
    },
    {
      name: "Amit Singh",
      role: "MBA Student",
      text: "The high-speed WiFi and study room have been a game-changer for my late-night study sessions.",
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
              <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Your Perfect <span className="text-amber-500">Student Mess</span> Experience
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-lg">
                Delicious food, comfortable living, and a supportive community - everything you need to focus on your studies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-8 rounded-lg transition duration-300">
                  Book a Visit
                </button>
                <button className="bg-transparent border-2 border-amber-500 text-amber-500 hover:bg-amber-500/10 font-bold py-3 px-8 rounded-lg transition duration-300">
                  View Plans
                </button>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Mess?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide everything a student needs for a comfortable and productive college life.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Students Say</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hear from students who have made our mess their home away from home.
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
}