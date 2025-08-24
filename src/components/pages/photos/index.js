'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FaUtensils, 
  FaBed, 
  FaUsers, 
  FaBook, 
  FaStar, 
  FaHeart, 
  FaShareAlt,
  FaArrowLeft,
  FaArrowRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PhotosPage = () => {
  const [activeAlbum, setActiveAlbum] = useState('all');
  const [activePhoto, setActivePhoto] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const albums = [
    { id: 'all', name: 'All Photos', icon: <FaStar /> },
    { id: 'rooms', name: 'Rooms', icon: <FaBed /> },
    // { id: 'dining', name: 'Dining Area', icon: <FaUtensils /> },
    // { id: 'common', name: 'Common Areas', icon: <FaUsers /> },
    // { id: 'events', name: 'Events', icon: <FaBook /> },
  ];

  const photos = [
    { id: 4, album: 'rooms', title: 'Standard Room', image: '/images/sit_1.JPG' },
    { id: 5, album: 'rooms', title: 'Premium Room', image: '/images/sit_2.JPG' },
  ];

  const filteredPhotos = activeAlbum === 'all' 
    ? photos 
    : photos.filter(photo => photo.album === activeAlbum);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev === filteredPhotos.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? filteredPhotos.length - 1 : prev - 1));
  };

  const openLightbox = (index) => {
    setActivePhoto(filteredPhotos[index]);
    setCurrentSlide(index);
  };

  const closeLightbox = () => {
    setActivePhoto(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10"></div>
        <div className="absolute inset-0 flex transition-transform duration-500 ease-in-out" 
             style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {filteredPhotos.map((photo, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <Image
                src={photo.image}
                alt={photo.title}
                width={800}
                height={500}
                className="w-full h-96 md:h-[500px] object-cover"
              />
            </div>
          ))}
        </div>
        <div className="relative z-20 h-full flex flex-col justify-end p-6 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">আমাদের মেস গ্যালারি</h1>
            <p className="text-xl text-gray-300 max-w-3xl">
            ছবির মাধ্যমে দেখুন আমাদের আধুনিক সুবিধা, সুস্বাদু খাবার এবং প্রাণবন্ত কমিউনিটি
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={prevSlide}
              className="bg-black/50 hover:bg-black/75 p-3 rounded-full transition duration-300"
              aria-label="Previous photo"
            >
              <FaArrowLeft />
            </button>
            <button 
              onClick={nextSlide}
              className="bg-black/50 hover:bg-black/75 p-3 rounded-full transition duration-300"
              aria-label="Next photo"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
        
        {/* Dots indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {filteredPhotos.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? "bg-amber-500 w-6" : "bg-gray-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Album Filter */}
      <div className="py-8 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {albums.map(album => (
              <button
                key={album.id}
                onClick={() => {
                  setActiveAlbum(album.id);
                  setCurrentSlide(0);
                }}
                className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                  activeAlbum === album.id
                    ? 'bg-amber-500 text-gray-900'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{album.icon}</span>
                {album.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center">
            {albums.find(a => a.id === activeAlbum)?.icon}
            <span className="ml-3">{albums.find(a => a.id === activeAlbum)?.name}</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 hover:border-amber-500 transition-all duration-300 cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="aspect-square bg-gray-700 relative">
                  <Image
                    src={photo.image}
                    alt={photo.title}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Simple title overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-lg font-bold text-white">{photo.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Animation Section */}
      {isMobile && (
        <div className="py-12 px-4 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Swipe to Explore More</h2>
            
            <div className="flex justify-center mb-8">
              <motion.div
                animate={{
                  x: [0, 20, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="bg-amber-500 p-4 rounded-full"
              >
                <FaArrowRight className="text-2xl text-gray-900" />
              </motion.div>
            </div>
            
            <p className="text-gray-400 max-w-xl mx-auto">
              Our mobile-optimized gallery makes it easy to browse photos with smooth animations
            </p>
          </div>
        </div>
      )}

      {/* Photo Albums Section */}
      <div className="py-12 px-4 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Albums</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {albums.filter(a => a.id !== 'all').map(album => (
              <motion.div
                key={album.id}
                whileHover={{ y: -10 }}
                className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden hover:border-amber-500 transition-all duration-300"
              >
                <div className="h-48 relative">
                  {photos.filter(p => p.album === album.id).length > 0 && (
                    <Image
                      src={photos.filter(p => p.album === album.id)[0].image}
                      alt={album.name}
                      width={400}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                    <div className="flex items-center">
                      <div className="bg-amber-500 text-gray-900 p-3 rounded-lg mr-4">
                        {album.icon}
                      </div>
                      <h3 className="text-xl font-bold">{album.name}</h3>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {photos
                      .filter(p => p.album === album.id)
                      .slice(0, 3)
                      .map(photo => (
                        <div key={photo.id} className="aspect-square bg-gray-700 rounded-lg overflow-hidden">
                          <Image
                            src={photo.image}
                            alt={photo.title}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                  <button 
                    onClick={() => setActiveAlbum(album.id)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium py-2 px-4 rounded-lg transition duration-300"
                  >
                    View Album
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button 
              className="absolute top-4 right-4 text-white text-3xl z-10"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              &times;
            </button>
            
            <div className="relative max-w-6xl w-full max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <Image
                src={activePhoto.image}
                alt={activePhoto.title}
                width={1200}
                height={800}
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <h3 className="text-xl md:text-2xl font-bold text-white">
                  {activePhoto.title}
                </h3>
              </div>
              
              <button 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                aria-label="Previous photo"
              >
                <FaArrowLeft />
              </button>
              <button 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-3 rounded-full z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                aria-label="Next photo"
              >
                <FaArrowRight />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotosPage;