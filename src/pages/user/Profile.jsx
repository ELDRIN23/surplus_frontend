import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import './Profile.css';

const UserProfile = () => {
    const { user, logout } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders', 'cart'
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();

    // Profile Edit State
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchOrders();
            fetchCart();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/users/profile', config);
            setFormData({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: ''
            });
            if (data.image) setPreviewUrl(`/${data.image}`);
        } catch (error) {
            console.error('Fetch Profile Error:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/orders/myorders', config);
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Orders Error:', error);
        }
    };

    const fetchCart = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/users/cart', config);
            setCart(data);
        } catch (error) {
            console.error('Fetch Cart Error:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            const data = new FormData();
            data.append('name', formData.name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            if (formData.password) data.append('password', formData.password);
            if (profileImage) data.append('image', profileImage);

            const { data: updatedUser } = await axios.put('/api/users/profile', data, config);
            
            // Update local storage and context
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const newData = { ...userInfo, ...updatedUser };
            localStorage.setItem('userInfo', JSON.stringify(newData));
            
            setEditMode(false);
            alert('Profile updated successfully!');
            window.location.reload(); // Refresh to update all UI
        } catch (error) {
            alert(error.response?.data?.message || 'Update failed');
        }
    };

    const handleRemoveFromCart = async (listingId) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`/api/users/cart/${listingId}`, config);
            fetchCart();
        } catch (error) {
            alert('Failed to remove item');
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('WARNING: Are you absolutely sure? This will delete your entire account and order history forever. This cannot be undone.')) {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete('/api/users/profile', config);
                logout();
                navigate('/login');
            } catch (error) {
                alert('Account deletion failed');
            }
        }
    };

    const getFirstLetter = (name) => name ? name.charAt(0).toUpperCase() : '?';

    if (loading) return <div className="loader"></div>;

    return (
        <div className="profile-container">
            <div className="profile-sidebar">
                <div className="profile-card-mini">
                    <div className="profile-avatar-large">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Profile" />
                        ) : (
                            <div className="avatar-letter">{getFirstLetter(formData.name)}</div>
                        )}
                    </div>
                    <h3>{formData.name}</h3>
                    <p className="profile-role">Verified User</p>
                </div>

                <nav className="profile-nav">
                    <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>👤 Personal Info</button>
                    <button className={activeTab === 'cart' ? 'active' : ''} onClick={() => setActiveTab('cart')}>🛒 My Cart ({cart.length})</button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>📜 Order History</button>
                    <button className="delete-btn-nav" onClick={handleDeleteAccount}>🗑️ Delete Account</button>
                </nav>
            </div>

            <main className="profile-content">
                {activeTab === 'profile' && (
                    <div className="profile-card section-animate">
                        <header className="section-header">
                            <h2>Personal Information</h2>
                            {!editMode && <button className="btn btn-secondary btn-sm" onClick={() => setEditMode(true)}>Edit Details</button>}
                        </header>

                        {editMode ? (
                            <form className="profile-form" onSubmit={handleUpdateProfile}>

                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>New Password (Optional)</label>
                                    <input type="password" placeholder="Leave blank to keep current" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-view-data">
                                <div className="data-item">
                                    <label>Name</label>
                                    <p>{formData.name}</p>
                                </div>
                                <div className="data-item">
                                    <label>Email</label>
                                    <p>{formData.email}</p>
                                </div>
                                <div className="data-item">
                                    <label>Phone</label>
                                    <p>{formData.phone}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'cart' && (
                    <div className="profile-card section-animate">
                        <header className="section-header">
                            <h2>Your Shopping Cart</h2>
                            <span className="badge badge-warning">{cart.length} items</span>
                        </header>

                        {cart.length === 0 ? (
                            <div className="empty-profile-state">
                                🛒 <p>Your cart is empty. Explore deals in the marketplace!</p>
                                <Link to="/" className="btn btn-primary">Browse Food</Link>
                            </div>
                        ) : (
                            <div className="cart-list">
                                {cart.map(item => (
                                    <div key={item._id} className="cart-item">
                                        <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&blur=2" alt="" className="cart-thumb" />
                                        <div className="cart-details">
                                            <h4>{item.listingId.title}</h4>
                                            <p>{item.quantity} x ₹{item.listingId.discountedPrice}</p>
                                        </div>
                                        <div className="cart-actions">
                                            <Link to={`/listing/${item.listingId._id}`} className="btn btn-secondary btn-sm">Buy Now</Link>
                                            <button className="btn-icon delete" onClick={() => handleRemoveFromCart(item.listingId._id)}>🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="profile-card section-animate">
                        <header className="section-header">
                            <h2>Purchase History</h2>
                        </header>

                        {orders.length === 0 ? (
                            <div className="empty-profile-state">
                                📜 <p>No orders found. Time to save some delicious surplus food!</p>
                            </div>
                        ) : (
                            <div className="orders-table-wrapper">
                                <table className="orders-table">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Restaurant</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td>{order.items[0]?.listing?.title}</td>
                                                <td>{order.vendor?.name}</td>
                                                <td>₹{order.totalAmount}</td>
                                                <td>
                                                    <span className={`status-badge ${order.orderStatus}`}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    {order.orderStatus === 'placed' && (
                                                        <button onClick={() => setSelectedOrder(order)} className="btn btn-primary btn-xs">Pickup Info</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Luxurious Modal for Pickup */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="lux-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <header className="modal-header">
                            <span className="modal-icon">📦</span>
                            <h2>Pickup Verification</h2>
                            <p>Show this code to the restaurant staff</p>
                        </header>
                        
                        <div className="modal-body" style={{ textAlign: 'center' }}>
                            <div style={{ background: '#fff', padding: '15px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px' }}>
                                <QRCodeCanvas value={selectedOrder._id} size={150} />
                            </div>
                            <div className="pickup-code-display" style={{ background: 'rgba(212, 175, 55, 0.1)', padding: '15px', borderRadius: '12px' }}>
                                <small style={{ color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Manual Entry Code</small>
                                <h3 style={{ fontSize: '2rem', letterSpacing: '5px', margin: '5px 0' }}>{selectedOrder.pickupCode}</h3>
                            </div>
                        </div>
                        <button className="btn btn-secondary btn-block" onClick={() => setSelectedOrder(null)}>Close Window</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
