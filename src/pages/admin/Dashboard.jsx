import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Dashboard.css';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [vendors, setVendors] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [vendorListings, setVendorListings] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('vendors'); // 'vendors', 'listings', 'users', 'user-orders'
    const [deleteModal, setDeleteModal] = useState({ show: false, vendorId: null, vendorName: '' });

    useEffect(() => {
        if (user?.token) {
            if (view === 'vendors') fetchVendors();
            if (view === 'users') fetchUsers();
        }
    }, [user, view]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/admin/vendors', config);
            setVendors(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Vendors Error:', error);
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/admin/users', config);
            setUsersList(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (error) {
            console.error('Fetch Users Error:', error);
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/admin/vendors/${id}/toggle`, {}, config);
            setVendors(prev => prev.map(v => v._id === id ? data.vendor : v));
        } catch (error) {
            console.error('Toggle Status Error:', error);
            alert('Failed to update restaurant status');
        }
    };

    const handleToggleUserBlock = async (id) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/admin/users/${id}/toggle`, {}, config);
            setUsersList(prev => prev.map(u => u._id === id ? data.user : u));
        } catch (error) {
            console.error('Toggle User Block Error:', error);
            alert('Failed to update user status');
        }
    };

    const openDeleteModal = (vendor) => {
        setDeleteModal({ show: true, vendorId: vendor._id, vendorName: vendor.name });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, vendorId: null, vendorName: '' });
    };

    const handlePermanentDelete = async () => {
        if (!deleteModal.vendorId) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/admin/vendors/${deleteModal.vendorId}`, config);
            setVendors(prev => prev.filter(v => v._id !== deleteModal.vendorId));
            closeDeleteModal();
            alert('Restaurant permanently removed.');
        } catch (error) {
            console.error('Permanent Delete Error:', error);
            alert('Failed to delete restaurant');
        }
    };

    const handleViewListings = async (vendor) => {
        try {
            setLoading(true);
            setSelectedVendor(vendor);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`/api/admin/vendors/${vendor._id}/listings`, config);
            setVendorListings(data);
            setView('listings');
            setLoading(false);
        } catch (error) {
            console.error('Fetch Listings Error:', error);
            alert('Failed to fetch restaurant inventory');
            setLoading(false);
        }
    };

    const handleViewUserActivity = async (targetUser) => {
        try {
            setLoading(true);
            setSelectedUser(targetUser);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`/api/admin/users/${targetUser._id}/orders`, config);
            setUserOrders(data);
            setView('user-orders');
            setLoading(false);
        } catch (error) {
            console.error('Fetch User Activity Error:', error);
            alert('Failed to fetch user history');
            setLoading(false);
        }
    };

    const handleDeleteListing = async (listingId) => {
        if (!window.confirm('Remove this food item?')) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/listings/${listingId}`, config);
            setVendorListings(prev => prev.filter(l => l._id !== listingId));
        } catch (error) {
            console.error('Delete Listing Error:', error);
            alert('Failed to remove item');
        }
    };

    if (loading && view !== 'listings' && view !== 'user-orders') return (
        <div className="admin-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
             <div className="loader"></div>
        </div>
    );

    return (
        <div className="admin-container">
            {/* Luxurious Delete Modal */}
            {deleteModal.show && (
                <div className="modal-overlay">
                    <div className="lux-modal">
                        <span className="modal-icon">⚠️</span>
                        <h2>Permanent Removal</h2>
                        <p>Are you certain you want to permanently delete <strong>{deleteModal.vendorName}</strong>? This action will erase the restaurant profile and all their food listings forever.</p>
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={closeDeleteModal}>Keep Restaurant</button>
                            <button className="btn-modal-confirm" onClick={handlePermanentDelete}>Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}

            <header className="admin-header">
                <h1>Admin command centre</h1>
                <div className="admin-nav">
                    <button 
                        className={`admin-nav-btn ${view === 'vendors' ? 'active' : ''}`} 
                        onClick={() => setView('vendors')}
                    >
                        Restaurants
                    </button>
                    <button 
                        className={`admin-nav-btn ${view === 'users' ? 'active' : ''}`} 
                        onClick={() => setView('users')}
                    >
                        Platform Users
                    </button>
                    {view === 'listings' && (
                        <button className="admin-nav-btn active">
                            {selectedVendor?.name}'s Inventory
                        </button>
                    )}
                    {view === 'user-orders' && (
                        <button className="admin-nav-btn active">
                            {selectedUser?.name}'s Activity
                        </button>
                    )}
                </div>
            </header>

            <main className="admin-main">
                {view === 'vendors' && (
                    <div className="admin-card-grid">
                        {vendors.map(vendor => (
                            <div key={vendor._id} className={`admin-vendor-card ${!vendor.isApproved ? 'disabled' : ''}`}>
                                <div className="vendor-card-header">
                                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                        <img 
                                            src={
                                                (vendor.image ? vendor.image : 'placeholder-restaurant.jpg')
                                                .startsWith('http') 
                                                    ? vendor.image 
                                                    : `${import.meta.env.VITE_API_URL || ''}/${(vendor.image || 'placeholder-restaurant.jpg').replace(/^\//, '')}`
                                            } 
                                            alt={vendor.name} 
                                            className="vendor-avatar"
                                            onError={(e) => { e.target.src = '/placeholder-restaurant.jpg'; }}
                                        />
                                        <div>
                                            <h3 style={{margin: 0, fontSize: '1.2rem'}}>{vendor.name}</h3>
                                            <span className={`status-pill ${vendor.isApproved ? 'approved' : 'blocked'}`}>
                                                {vendor.isApproved ? '✅ LIVE' : '⏳ PENDING'}
                                            </span>
                                        </div>
                                    </div>
                                    <button 
                                        className="btn-delete-vendor" 
                                        onClick={() => openDeleteModal(vendor)}
                                        title="Delete Permanently"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                
                                <div style={{marginTop: '1rem'}}>
                                    <p className="vendor-meta">👤 <strong>Owner:</strong> {vendor.ownerName}</p>
                                    <p className="vendor-meta">📧 <strong>Email:</strong> {vendor.email}</p>
                                    <p className="vendor-meta">📞 <strong>Phone:</strong> {vendor.phone}</p>
                                </div>
                                
                                <div className="admin-card-actions">
                                    <button 
                                        onClick={() => handleViewListings(vendor)} 
                                        className="btn btn-secondary btn-sm"
                                    >
                                        Manage Inventory
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(vendor._id)} 
                                        className={`btn btn-sm ${vendor.isApproved ? 'btn-danger' : 'btn-success'}`}
                                    >
                                        {vendor.isApproved ? 'DISABLE RESTAURANT' : 'APPROVE & ACTIVATE'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'users' && (
                    <div className="admin-card-grid">
                        {usersList.map(item => (
                            <div key={item._id} className={`admin-vendor-card ${item.isBlocked ? 'disabled' : ''}`}>
                                <div className="vendor-card-header">
                                    <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                                        <div className="vendor-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-primary)', color: '#000', fontSize: '1.5rem', fontWeight: '800' }}>
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 style={{margin: 0, fontSize: '1.2rem'}}>{item.name}</h3>
                                            <span className={`status-pill ${!item.isBlocked ? 'approved' : 'blocked'}`}>
                                                {!item.isBlocked ? '🟢 ACTIVE' : '🔴 DISABLED'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{marginTop: '1rem'}}>
                                    <p className="vendor-meta">📧 <strong>Email:</strong> {item.email}</p>
                                    <p className="vendor-meta">📞 <strong>Phone:</strong> {item.phone}</p>
                                    <p className="vendor-meta">📅 <strong>Joined:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                                
                                <div className="admin-card-actions">
                                    <button 
                                        onClick={() => handleViewUserActivity(item)} 
                                        className="btn btn-secondary btn-sm"
                                    >
                                        View Order History
                                    </button>
                                    <button 
                                        onClick={() => handleToggleUserBlock(item._id)} 
                                        className={`btn btn-sm ${!item.isBlocked ? 'btn-danger' : 'btn-success'}`}
                                    >
                                        {!item.isBlocked ? 'DISABLE ACCOUNT' : 'RE-ENABLE ACCOUNT'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'listings' && (
                    <div className="admin-listing-view">
                        <div className="view-header">
                            <button className="back-link" onClick={() => setView('vendors')}>← Back to Command</button>
                            <h2>Reviewing Inventory: {selectedVendor?.name}</h2>
                        </div>
                        
                        {vendorListings.length === 0 ? (
                            <p className="empty-msg">No inventory history found.</p>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Food Item</th>
                                            <th>Details</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendorListings.map(listing => (
                                            <tr key={listing._id}>
                                                <td data-label="Food Item">
                                                    <div className="table-item-info">
                                                        <img src={listing.image ? `/${listing.image}` : '/placeholder-food.jpg'} alt="" />
                                                        <span>{listing.title}</span>
                                                    </div>
                                                </td>
                                                <td data-label="Details">
                                                    <div>₹{listing.discountedPrice}</div>
                                                    <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{listing.remainingQuantity} left</div>
                                                </td>
                                                <td data-label="Status">
                                                    <span className={`status-badge ${listing.status}`}>{listing.status}</span>
                                                </td>
                                                <td data-label="Actions">
                                                    <div className="table-actions">
                                                        <Link title="Edit Details" to={`/vendor/edit-listing/${listing._id}`} className="btn-icon edit">✎</Link>
                                                        <button title="Remove Listing" onClick={() => handleDeleteListing(listing._id)} className="btn-icon delete">🗑</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {view === 'user-orders' && (
                    <div className="admin-listing-view">
                        <div className="view-header">
                            <button className="back-link" onClick={() => setView('users')}>← Back to Users</button>
                            <h2>Order History: {selectedUser?.name}</h2>
                        </div>
                        
                        {userOrders.length === 0 ? (
                            <p className="empty-msg">This user hasn't placed any orders yet.</p>
                        ) : (
                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Restaurant</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userOrders.map(order => (
                                            <tr key={order._id}>
                                                <td data-label="Order ID">#{order._id.slice(-6)}</td>
                                                <td data-label="Restaurant">{order.vendor?.name || 'Unknown'}</td>
                                                <td data-label="Amount">₹{order.totalAmount}</td>
                                                <td data-label="Status">
                                                    <span className={`status-badge ${order.orderStatus}`}>
                                                        {order.orderStatus.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td data-label="Date">{new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
