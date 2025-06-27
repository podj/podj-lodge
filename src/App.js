import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Loader from './components/Loader';
import { getOptimizedImagePath } from './utils/imageUtils';

// Import images
import firstBalcony from "./assets-compressed/images/amenetis/first_balcony.jpg";
import secondBalcony from "./assets-compressed/images/amenetis/second_balcony.jpg";
import secondBalcony02 from "./assets-compressed/images/amenetis/second_balcony_02.jpg";
import deserts from "./assets-compressed/images/dinning-room/deserts.jpg";
import dinningTable from "./assets-compressed/images/dinning-room/dinning-table.jpeg";
import food from "./assets-compressed/images/dinning-room/food.jpeg";
import comfortRoom from "./assets-compressed/images/rooms/comfort/IMG_4794.HEIC.jpg";
import deluxeRoom from "./assets-compressed/images/rooms/deluxe/IMG_4795.HEIC.jpg";
import jrSuiteRoom from "./assets-compressed/images/rooms/jr-suite/IMG_4796.HEIC.jpg";
import yayaStaff from "./assets-compressed/images/team/yaya-reception-and-operations.jpg";
import oranChef from "./assets-compressed/images/team/oran-the-chef.jpg";
import michalCleaning from "./assets-compressed/images/team/michal-the-sommelier.jpg";
// Import videos
import vibeVideo from "./assets-compressed/images/vibe/vibe.mp4";
import chefVideo from "./assets-compressed/images/vibe/chef-in-action-vert-short-vid.mp4";

function App() {
  const [currentSection, setCurrentSection] = useState('hero');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservationForm, setReservationForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomType: 'deluxe'
  });

  // All assets to preload using useMemo to avoid recreating the array on each render
  const assetsToLoad = useMemo(() => [
    firstBalcony, secondBalcony, secondBalcony02, deserts, dinningTable, food,
    comfortRoom, deluxeRoom, jrSuiteRoom, yayaStaff, oranChef, michalCleaning,
    vibeVideo, chefVideo
  ], []);

  // Preload assets
  useEffect(() => {
    const preloadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve();
        };
        img.onerror = () => {
          resolve();
        };
        img.src = src;
      });
    };

    const preloadVideo = (src) => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.oncanplaythrough = () => {
          resolve();
        };
        video.onerror = () => {
          resolve();
        };
        video.src = src;
      });
    };

    const preloadAssets = async () => {
      const promises = assetsToLoad.map(asset => {
        if (typeof asset === 'string' && asset.endsWith('.mp4')) {
          return preloadVideo(asset);
        } else {
          return preloadImage(asset);
        }
      });

      // Add a minimum loading time of 2 seconds for the luxury effect
      const minLoadingTime = new Promise(resolve => setTimeout(resolve, 2000));
      
      await Promise.all([...promises, minLoadingTime]);
      setLoading(false);
    };

    preloadAssets();
  }, [assetsToLoad]);

  const rooms = [
    {
      id: 'comfort',
      name: 'Comfort Room',
      image: comfortRoom,
      price: '$299',
      description: 'Elegant comfort with premium amenities',
      features: ['King Size Bed', 'City View', 'Marble Bathroom', 'Premium Linens']
    },
    {
      id: 'deluxe',
      name: 'Deluxe Room',
      image: deluxeRoom,
      price: '$499',
      description: 'Sophisticated luxury with stunning views',
      features: ['Ocean View', 'Spacious Layout', 'Private Balcony', 'Butler Service']
    },
    {
      id: 'jr-suite',
      name: 'Junior Suite',
      image: jrSuiteRoom,
      price: '$799',
      description: 'Ultimate luxury experience',
      features: ['Panoramic Views', 'Separate Living Area', 'Premium Balcony', 'Concierge Service']
    }
  ];

  const teamMembers = [
    {
      name: 'Yaya',
      position: 'Reception & Operations',
      image: yayaStaff,
      description: 'Ensuring your perfect stay from arrival to departure'
    },
    {
      name: 'Oran',
      position: 'Chef',
      image: oranChef,
      description: 'Crafting culinary masterpieces with passion and precision'
    },
    {
      name: 'Michal',
      position: 'Sommelier',
      image: michalCleaning,
      description: 'Curating exceptional wine pairings to elevate your dining experience'
    }
  ];

  const reviews = [
    {
      name: 'Nadav',
      review: 'Best sleeping experience ever',
      rating: 5
    },
    {
      name: 'Harel',
      review: 'The best food in town',
      rating: 5
    },
    {
      name: 'Junie',
      review: 'A lot of cool stuff to do',
      rating: 5
    }
  ];

  const handleReservation = (e) => {
    e.preventDefault();
    alert(`Reservation request submitted for ${reservationForm.roomType} room from ${reservationForm.checkIn} to ${reservationForm.checkOut} for ${reservationForm.guests} guest(s). We'll contact you shortly to confirm availability.`);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'rooms', 'amenities', 'dining', 'team', 'reviews', 'reservations'];
      const scrollPos = window.scrollY + 100;
      
      sections.forEach(section => {
        const element = document.getElementById(section);
        if (element && scrollPos >= element.offsetTop && scrollPos < element.offsetTop + element.offsetHeight) {
          setCurrentSection(section);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="App">
          {/* Navigation */}
          <nav className="navbar">
            <div className="nav-container">
              <div className="nav-logo">PODJ LODGE</div>
              <div className="nav-links">
                <a href="#hero" className={currentSection === 'hero' ? 'active' : ''}>Home</a>
                <a href="#rooms" className={currentSection === 'rooms' ? 'active' : ''}>Rooms</a>
                <a href="#amenities" className={currentSection === 'amenities' ? 'active' : ''}>Amenities</a>
                <a href="#dining" className={currentSection === 'dining' ? 'active' : ''}>Dining</a>
                <a href="#team" className={currentSection === 'team' ? 'active' : ''}>Team</a>
                <a href="#reviews" className={currentSection === 'reviews' ? 'active' : ''}>Reviews</a>
                <a href="#reservations" className={currentSection === 'reservations' ? 'active' : ''}>Book Now</a>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section id="hero" className="hero">
            <div className="hero-video">
              <video autoPlay muted loop playsInline preload="auto">
                <source src={vibeVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="hero-overlay"></div>
            </div>
            <div className="hero-content">
              <h1 className="hero-title">Welcome to Podj Lodge</h1>
              <p className="hero-subtitle">Where Luxury Meets Perfection</p>
              <p className="hero-description">Experience unparalleled elegance in our boutique luxury hotel</p>
              <button className="cta-button" onClick={() => document.getElementById('reservations').scrollIntoView()}>
                Reserve Your Experience
              </button>
            </div>
          </section>

          {/* Rooms Section */}
          <section id="rooms" className="rooms">
            <div className="container">
              <h2 className="section-title">Luxury Accommodations</h2>
              <p className="section-subtitle">Each room is a sanctuary of comfort and elegance</p>
              <div className="rooms-grid">
                {rooms.map((room) => (
                  <div key={room.id} className="room-card" onClick={() => setSelectedRoom(room)}>
                    <div className="room-image">
                      <img src={getOptimizedImagePath(room.image)} alt={room.name} />
                      <div className="room-overlay">
                        <span className="room-price">{room.price}/night</span>
                      </div>
                    </div>
                    <div className="room-content">
                      <h3 className="room-name">{room.name}</h3>
                      <p className="room-description">{room.description}</p>
                      <div className="room-features">
                        {room.features.map((feature, index) => (
                          <span key={index} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Amenities Section */}
          <section id="amenities" className="amenities">
            <div className="container">
              <h2 className="section-title">Exclusive Amenities</h2>
              <p className="section-subtitle">Indulge in our world-class facilities</p>
              <div className="amenities-grid">
                <div className="amenity-card">
                  <img src={getOptimizedImagePath(firstBalcony)} alt="Private Balcony" />
                  <div className="amenity-content">
                    <h3>Private Balconies</h3>
                    <p>Breathtaking views from your personal sanctuary</p>
                  </div>
                </div>
                <div className="amenity-card">
                  <img src={getOptimizedImagePath(secondBalcony)} alt="Luxury Terrace" />
                  <div className="amenity-content">
                    <h3>Luxury Terraces</h3>
                    <p>Expansive outdoor spaces for ultimate relaxation</p>
                  </div>
                </div>
                <div className="amenity-card">
                  <img src={getOptimizedImagePath(secondBalcony02)} alt="Scenic Views" />
                  <div className="amenity-content">
                    <h3>Panoramic Views</h3>
                    <p>Unobstructed vistas that inspire and rejuvenate</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dining Section */}
          <section id="dining" className="dining">
            <div className="container">
              <h2 className="section-title">Culinary Excellence</h2>
              <p className="section-subtitle">A gastronomic journey curated by our master chef</p>
              <div className="dining-content">
                <div className="dining-video">
                  <video autoPlay muted loop>
                    <source src={chefVideo} type="video/mp4" />
                  </video>
                </div>
                <div className="dining-grid">
                  <div className="dining-card">
                    <img src={getOptimizedImagePath(food)} alt="Gourmet Cuisine" />
                    <div className="dining-card-content">
                      <h3>Gourmet Cuisine</h3>
                      <p>Fresh, locally-sourced ingredients crafted into culinary masterpieces</p>
                    </div>
                  </div>
                  <div className="dining-card">
                    <img src={getOptimizedImagePath(dinningTable)} alt="Elegant Dining" />
                    <div className="dining-card-content">
                      <h3>Elegant Dining</h3>
                      <p>Sophisticated ambiance for unforgettable dining experiences</p>
                    </div>
                  </div>
                  <div className="dining-card">
                    <img src={getOptimizedImagePath(deserts)} alt="Artisan Desserts" />
                    <div className="dining-card-content">
                      <h3>Artisan Desserts</h3>
                      <p>Exquisite sweet creations to complete your culinary journey</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section id="team" className="team">
            <div className="container">
              <h2 className="section-title">Our Distinguished Team</h2>
              <p className="section-subtitle">Dedicated professionals committed to your exceptional experience</p>
              <div className="team-grid">
                {teamMembers.map((member, index) => (
                  <div key={index} className="team-card">
                    <div className="team-image">
                      <img src={getOptimizedImagePath(member.image)} alt={member.name} />
                    </div>
                    <div className="team-content">
                      <h3 className="team-name">{member.name}</h3>
                      <p className="team-position">{member.position}</p>
                      <p className="team-description">{member.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section id="reviews" className="reviews">
            <div className="container">
              <h2 className="section-title">Guest Testimonials</h2>
              <p className="section-subtitle">What our distinguished guests say about their experience</p>
              <div className="reviews-grid">
                {reviews.map((review, index) => (
                  <div key={index} className="review-card">
                    <div className="review-stars">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="star">★</span>
                      ))}
                    </div>
                    <p className="review-text">"{review.review}"</p>
                    <p className="review-author">- {review.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reservations Section */}
          <section id="reservations" className="reservations">
            <div className="container">
              <h2 className="section-title">Reserve Your Stay</h2>
              <p className="section-subtitle">Begin your luxury experience today</p>
              <form className="reservation-form" onSubmit={handleReservation}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Check In</label>
                    <input
                      type="date"
                      value={reservationForm.checkIn}
                      onChange={(e) => setReservationForm({...reservationForm, checkIn: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Check Out</label>
                    <input
                      type="date"
                      value={reservationForm.checkOut}
                      onChange={(e) => setReservationForm({...reservationForm, checkOut: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Guests</label>
                    <select
                      value={reservationForm.guests}
                      onChange={(e) => setReservationForm({...reservationForm, guests: e.target.value})}
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select
                      value={reservationForm.roomType}
                      onChange={(e) => setReservationForm({...reservationForm, roomType: e.target.value})}
                    >
                      <option value="comfort">Comfort Room</option>
                      <option value="deluxe">Deluxe Room</option>
                      <option value="jr-suite">Junior Suite</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="reservation-button">
                  Check Availability & Reserve
                </button>
              </form>
              <div className="availability-indicator">
                <p className="availability-text">
                  ⚡ High Demand: {Math.floor(Math.random() * 5) + 3} people are currently viewing this hotel
                </p>
                <p className="availability-text">
                  🔥 Limited Availability: Only {Math.floor(Math.random() * 3) + 2} rooms left for your dates
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="footer">
            <div className="container">
              <div className="footer-content">
                <div className="footer-section">
                  <h3>Podj Lodge</h3>
                  <p>Where luxury meets perfection</p>
                </div>
                <div className="footer-section">
                  <h4>Contact</h4>
                  <p>+1 (555) 123-4567</p>
                  <p>reservations@podjlodge.com</p>
                </div>
                <div className="footer-section">
                  <h4>Location</h4>
                  <p>123 Luxury Avenue</p>
                  <p>Paradise City, PC 12345</p>
                </div>
              </div>
            </div>
          </footer>

          {/* Room Modal */}
          {selectedRoom && (
            <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedRoom(null)}>×</button>
                <img src={getOptimizedImagePath(selectedRoom.image)} alt={selectedRoom.name} />
                <div className="modal-info">
                  <h3>{selectedRoom.name}</h3>
                  <p className="modal-price">{selectedRoom.price}/night</p>
                  <p>{selectedRoom.description}</p>
                  <div className="modal-features">
                    {selectedRoom.features.map((feature, index) => (
                      <span key={index} className="feature-tag">{feature}</span>
                    ))}
                  </div>
                  <button className="cta-button" onClick={() => {
                    setSelectedRoom(null);
                    document.getElementById('reservations').scrollIntoView();
                  }}>
                    Book This Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default App;
