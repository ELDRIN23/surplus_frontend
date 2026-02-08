import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showSafetyModal, setShowSafetyModal] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);

    useEffect(() => {
        // Force scroll to top on refresh
        window.scrollTo(0, 0);
        
        const hasAgreed = localStorage.getItem('safety_agreed');
        if (!hasAgreed) {
            setShowSafetyModal(true);
        }
    }, []);

    const handleAgree = () => {
        if (isAgreed) {
            localStorage.setItem('safety_agreed', 'true');
            setShowSafetyModal(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [selectedCategory]);

    const fetchListings = async () => {
        const apiUrl = selectedCategory === 'All' 
            ? '/api/listings' 
            : `/api/listings?category=${selectedCategory}`;
            
        try {
            setLoading(true);
            const { data } = await axios.get(apiUrl);
            setListings(data);
            setLoading(false);
        } catch (error) {
            console.error('❌ Failed to fetch listings:', error);
            if (error.response) {
                console.error('Server responded with:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('No response received. Check CORS or if the backend is down. URL:', axios.defaults.baseURL + apiUrl);
            }
            setLoading(false);
        }
    };

    const calculateDiscount = (original, discounted) => {
        return Math.round(((original - discounted) / (original || 1)) * 100);
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&blur=2";
        if (imagePath.startsWith('http')) return imagePath;
        const apiBase = axios.defaults.baseURL || '';
        return `${apiBase}/${imagePath}`;
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div className="home-container">
            {/* Food Safety & Responsibility Modal */}
            {showSafetyModal && (
                <div className="modal-overlay">
                    <div className="lux-modal safety-modal">
                        <div className="modal-header">
                            <span className="modal-icon" style={{fontSize: '2rem'}}>🛡️</span>
                            <h2 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>Safety & Responsibility</h2>
                        </div>
                        
                        <div className="modal-body">
                            <p className="safety-text-compact">
                                Consume food within <strong>4 hours</strong> and check quality before consumption. 
                                Surplus Market is a facilitator; restaurants carry full responsibility for food safety. 
                                The company is not liable for risks or issues arising from consumption.
                            </p>
                            
                            <span className="policy-link-locked">Read Policy</span>
                            
                            <label className="agree-checkbox-container" style={{justifyContent: 'center', marginTop: '1.5rem'}}>
                                <input 
                                    type="checkbox" 
                                    checked={isAgreed} 
                                    onChange={(e) => setIsAgreed(e.target.checked)} 
                                />
                                <span className="agree-text" style={{fontSize: '0.8rem'}}>I agree to follow safety protocols.</span>
                            </label>
                        </div>
                        
                        <div className="modal-actions" style={{marginTop: '1rem'}}>
                            <button 
                                className={`btn-modal-confirm ${!isAgreed ? 'disabled' : ''}`} 
                                onClick={handleAgree}
                                disabled={!isAgreed}
                                style={{padding: '0.75rem'}}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Category Filter Bar */}
            <div className="filter-section category-top" id="marketplace" style={{ paddingTop: '0' }}>
                <h2 className="filter-title">Browse Marketplace</h2>
                <div className="filter-bar">
                    <button 
                        className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('All')}
                    >
                        🍽️ All
                    </button>
                    <button 
                        className={`filter-btn ${selectedCategory === 'Meals' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Meals')}
                    >
                        🍛 Meals
                    </button>
                    <button 
                        className={`filter-btn ${selectedCategory === 'Bakery' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('Bakery')}
                    >
                        🥐 Bakery
                    </button>
                </div>
            </div>
            
            {/* Listings Grid - Comes right after categories */}
            {listings.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <h3>No deals available right now</h3>
                    <p>Check back soon for fresh surplus food deals from your favorite local businesses!</p>
                    <Link to="/register-vendor" className="btn btn-primary">Join as Restaurant</Link>
                </div>
            ) : (
                <div className="listings-grid">
                    {listings.map(listing => {
                        const isSoldOut = listing.status === 'sold_out';
                        const CardWrapper = isSoldOut ? 'div' : Link;
                        
                        return (
                            <CardWrapper 
                                to={!isSoldOut ? `/listing/${listing._id}` : undefined} 
                                key={listing._id} 
                                className={`listing-card ${listing.status}`}
                            >
                                <div className="listing-image-container">
                                    <img 
                                        src={getImageUrl(listing.image)}
                                        alt={listing.title || listing.vendor?.name}
                                        className="listing-image"
                                        loading="lazy"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&blur=2'; }}
                                    />
                                    {isSoldOut ? (
                                        <div className="sold-out-badge">SOLD OUT</div>
                                    ) : (
                                        <>
                                            <div className="discount-badge">
                                                {calculateDiscount(listing.originalPrice, listing.discountedPrice)}% OFF
                                            </div>
                                            <div className="quantity-badge">
                                                {listing.remainingQuantity} left
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                <div className="listing-content">
                                    <div className="vendor-info">
                                        <span className="vendor-name">{listing.vendor?.name || 'Unknown Restaurant'}</span>
                                        {listing.vendor.rating > 0 && (
                                            <span className="vendor-rating">★ {listing.vendor.rating.toFixed(1)}</span>
                                        )}
                                    </div>
                                    
                                    <h3 className="listing-title">{listing.title}</h3>
                                    
                                    <div className="listing-footer">
                                        {isSoldOut ? (
                                            <div className="next-drop-msg">Wait for next drop</div>
                                        ) : (
                                            <>
                                                <div className="price-container">
                                                    <span className="price-original">₹{listing.originalPrice}</span>
                                                    <span className="price-discounted">₹{listing.discountedPrice}</span>
                                                </div>
                                                
                                                <div className="pickup-time">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10"/>
                                                        <path d="M12 6v6l4 2"/>
                                                    </svg>
                                                    <span>{new Date(listing.pickupStart).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardWrapper>
                        );
                    })}
                </div>
            )}

            {/* Thrissur Cultural Stats Bar - Moved to Bottom */}
            <div className="stats-bar kerala-themed stats-bar-bottom">
                <div className="kerala-pattern-left"></div>
                <div className="stat-item">
                    <span className="stat-icon">🐘</span>
                    <span className="stat-number">{listings.length}+</span>
                    <span className="stat-label">Active Deals in Thrissur</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🌴</span>
                    <span className="stat-number">50K+</span>
                    <span className="stat-label">Happy Customers</span>
                </div>
                <div className="stat-item">
                    <span className="stat-icon">🍛</span>
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Partner Businesses</span>
                </div>
                <div className="kerala-pattern-right"></div>
            </div>

            {/* Business CTA Section */}
            <section className="business-cta">
                <div className="business-cta-content">
                    <h2>Are you a restaurant, bakery, or café?</h2>
                    <p>Join our network of sustainable businesses. Reduce waste, reach new customers, and generate additional revenue from surplus food.</p>
                    <Link to="/register-vendor" className="btn btn-business">Join as Restaurant Owner</Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
