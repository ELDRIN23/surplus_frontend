import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import FakeRazorpay from '../components/FakeRazorpay';
import './ListingDetail.css';

const ListingDetail = () => {
    const { id } = useParams();
    const [listing, setListing] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState(null);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const { data } = await axios.get(`/api/listings/${id}`);
                setListing(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('/api/users/cart', {
                listingId: listing._id,
                quantity: parseInt(quantity)
            }, config);
            alert('Added to cart!');
        } catch (error) {
            alert('Failed to add to cart');
        }
    };

    const handleBuy = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const { data: orderData } = await axios.post('/api/orders', {
                vendorId: listing.vendor._id,
                items: [{ listingId: listing._id, quantity: parseInt(quantity) }]
            }, config);

            setPendingOrderId(orderData.order._id);
            setIsPaymentModalOpen(true);

        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Order failed');
        }
    };

    const handlePaymentSuccess = async (paymentId) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.post(`/api/orders/${pendingOrderId}/simulate-payment`, { paymentId }, config);
            setIsPaymentModalOpen(false);
            navigate('/profile'); 
        } catch (error) {
            console.error('Simulation sync failed', error);
            alert('Payment recorded but sync failed.');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&blur=2";
        if (imagePath.startsWith('http')) return imagePath;
        const apiBase = axios.defaults.baseURL || '';
        return `${apiBase}/${imagePath}`;
    };

    if (loading) return <div className="loader"></div>;
    if (!listing) return <div>Listing not found</div>;

    return (
        <div className="card">
            <div className="listing-detail-container">
                <div className="listing-detail-image">
                    <img 
                        src={getImageUrl(listing.image)}
                        alt={listing.title} 
                    />
                </div>
                
                <div className="listing-detail-info">
                    <p className="listing-vendor-name">{listing.vendor?.name}</p>
                    <h1>{listing.title}</h1>
                    <p>{listing.description}</p>
                    
                    <div className="listing-price-tag">
                        <span className="listing-price-now">₹{listing.discountedPrice}</span>
                        <span className="listing-price-old">₹{listing.originalPrice}</span>
                    </div>

                    <div className="pickup-info-box">
                        <h4>Pickup Window</h4>
                        <div className="pickup-time-range">
                            {new Date(listing.pickupStart).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                            {new Date(listing.pickupEnd).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>

                    <div className="buy-section">
                        <div className="quantity-selector">
                            <label>Quantity:</label>
                            <input 
                                type="number" 
                                className="form-group input"
                                min="1" 
                                max={listing.remainingQuantity} 
                                value={quantity} 
                                onChange={(e) => setQuantity(e.target.value)} 
                            />
                            <span>{listing.remainingQuantity} left</span>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={handleAddToCart} className="btn btn-secondary btn-block" style={{ flex: 1 }} disabled={listing.status !== 'active'}>
                                Add to Cart
                            </button>
                            <button onClick={handleBuy} className="btn btn-primary btn-block" style={{ flex: 1 }} disabled={listing.status !== 'active'}>
                                {listing.status === 'active' ? `Buy Now (₹${listing.discountedPrice * quantity})` : 'Sold Out'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <FakeRazorpay 
                isOpen={isPaymentModalOpen}
                amount={listing.discountedPrice * quantity}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={handlePaymentSuccess}
                userName={user?.name}
                userEmail={user?.email}
            />
        </div>
    );
};

export default ListingDetail;
