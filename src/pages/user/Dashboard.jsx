import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';

const UserDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null); // For QR Modal
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/orders/myorders', config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="loader"></div>;

    return (
        <div>
            <h2>My Orders</h2>
            {orders.length === 0 ? <p>No orders yet.</p> : (
                <div className="grid-3">
                    {orders.map(order => (
                        <div key={order._id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3>Order #{order._id.slice(-6)}</h3>
                                <span className={`badge badge-${order.orderStatus === 'placed' ? 'success' : order.orderStatus === 'collected' ? 'warning' : 'danger'}`}>
                                    {order.orderStatus}
                                </span>
                            </div>
                            <p><strong>Vendor:</strong> {order.vendor.name}</p>
                            <p><strong>Items:</strong></p>
                            <ul>
                                {order.items.map((item, index) => (
                                    <li key={index}>
                                        {item.quantity} x {item.listing.title}
                                    </li>
                                ))}
                            </ul>
                            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                            
                            {order.orderStatus === 'placed' && (
                                <button onClick={() => setSelectedOrder(order)} className="btn btn-primary btn-block">
                                    Show Pickup QR
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Luxurious Modal for QR & Pickup Code */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="lux-modal safety-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <span className="modal-icon">📦</span>
                            <h2>Pickup Details</h2>
                            <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Show this to the restaurant owner</p>
                        </div>
                        
                        <div className="modal-body" style={{ textAlign: 'center' }}>
                            <div style={{ 
                                background: '#fff', 
                                padding: '20px', 
                                borderRadius: '24px', 
                                display: 'inline-block',
                                marginBottom: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}>
                                <QRCodeCanvas value={selectedOrder._id} size={180} />
                            </div>

                            <div className="pickup-code-display" style={{ 
                                background: 'rgba(212, 175, 55, 0.1)', 
                                border: '1px dashed var(--accent-primary)',
                                padding: '15px',
                                borderRadius: '16px',
                                margin: '10px 0 20px'
                            }}>
                                <span style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-primary)', marginBottom: '5px' }}>
                                    Manual Verification Code
                                </span>
                                <strong style={{ fontSize: '2.5rem', letterSpacing: '8px', color: '#fff' }}>
                                    {selectedOrder.pickupCode || '----'}
                                </strong>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                Order ID: {selectedOrder._id}
                            </p>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary btn-block">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
