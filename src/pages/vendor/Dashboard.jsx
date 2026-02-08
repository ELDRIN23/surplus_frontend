import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Dashboard.css';

const RestaurantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [listings, setListings] = useState([]);
    const [restaurantInfo, setRestaurantInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (!userInfo) return;
                
                const token = userInfo.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                // Fetch profile to get restaurant name
                const profileRes = await axios.get('/api/vendors/profile', config);
                setRestaurantInfo(profileRes.data);
                
                // Fetch listings
                const listingsRes = await axios.get('/api/vendors/listings', config);
                setListings(listingsRes.data);
                
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to remove this listing?')) {
             try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`/api/listings/${id}`, config);
                setListings(listings.filter(l => l._id !== id));
             } catch (error) {
                 alert('Failed to delete');
             }
        }
    }

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&blur=2";
        if (imagePath.startsWith('http')) return imagePath;
        const apiBase = axios.defaults.baseURL || '';
        return `${apiBase}/${imagePath}`;
    };

    if (loading) return <div className="loader"></div>;

    if (restaurantInfo && !restaurantInfo.isApproved) {
        return (
            <div className="dashboard-container">
                <div className="pending-approval-view card">
                    <div className="pending-icon">⏳</div>
                    <h1>Registration Received!</h1>
                    <p>Welcome to Surplus Market, <strong>{restaurantInfo.name}</strong>.</p>
                    <div className="pending-notice-box">
                        <h3>Admin Approval Needed</h3>
                        <p>Your account is currently under review by our admin team. Once approved, you will be able to start listing your surplus food and accepting orders.</p>
                        <p>This usually takes 24-48 hours. We will notify you via email at <strong>{restaurantInfo.email}</strong> once your account is active.</p>
                    </div>
                    <Link to="/" className="btn btn-secondary">Go to Marketplace</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Restaurant Owner Dashboard</h1>
                    <p className="welcome-text">Welcome back, <strong>{restaurantInfo?.name || 'Restaurant Owner'}</strong></p>
                </div>
                <div className="header-actions">
                     <Link to="/vendor/orders" className="btn btn-secondary">Orders</Link>
                     <Link to="/vendor/create-listing" className="btn btn-primary">Add New Item</Link>
                </div>
            </header>

            <section className="listings-section">
                <div className="section-title-row">
                    <h3>My Live Listings</h3>
                    <span className="badge-count">{listings.length} items</span>
                </div>
                
                {listings.length === 0 ? (
                    <div className="empty-dashboard">
                        <p>You don't have any active listings.</p>
                        <Link to="/vendor/create-listing" className="btn btn-primary">Create Your First Listing</Link>
                    </div>
                ) : (
                    <div className="listings-grid">
                        {listings.map(listing => (
                             <div key={listing._id} className="listing-manage-card">
                                <div className="card-img-container">
                                    <img src={getImageUrl(listing.image)} alt={listing.title} />
                                    <span className={`status-badge ${listing.status}`}>{listing.status}</span>
                                </div>
                                <div className="card-info">
                                    <h4>{listing.title}</h4>
                                    <div className="info-row">
                                        <span>Quantity: <strong>{listing.remainingQuantity} / {listing.quantity}</strong></span>
                                        <span>Price: <strong>₹{listing.discountedPrice}</strong></span>
                                    </div>
                                    <div className="card-actions">
                                        <Link to={`/vendor/edit-listing/${listing._id}`} className="btn btn-edit">Edit</Link>
                                        <button onClick={() => handleDelete(listing._id)} className="btn btn-delete">Delete</button>
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default RestaurantDashboard;
