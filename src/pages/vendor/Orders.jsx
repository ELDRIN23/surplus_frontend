import { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

const VendorOrders = () => {
    const [orders, setOrders] = useState([]);
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);

    const fetchOrders = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/vendors/orders', config);
            setOrders(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (scanning) {
            const scanner = new Html5QrcodeScanner(
                "reader", 
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render(async (decodedText, decodedResult) => {
                scanner.clear();
                setScanning(false);
                await handleScan(decodedText);
            }, (error) => {
                // console.warn(error);
            });

            return () => {
                scanner.clear().catch(error => console.error("Failed to clear html5-qrcode scanner. ", error));
            };
        }
    }, [scanning]);

    const [manualCode, setManualCode] = useState('');

    const handleVerifyCode = async () => {
        if (!manualCode || manualCode.length !== 4) {
            alert('Please enter a valid 4-digit code');
            return;
        }
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/vendors/verify-code', { pickupCode: manualCode }, config);
            setScanResult({ success: true, message: data.message });
            setManualCode('');
            fetchOrders();
        } catch (error) {
            setScanResult({ success: false, message: error.response?.data?.message || 'Verification Failed' });
        }
    };

    return (
        <div className="vendor-orders-container">
            <h2 className="luxury-title">Order Management</h2>
            
            <div className="verification-controls" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <button 
                        onClick={() => { setScanning(!scanning); setScanResult(null); }} 
                        className={`btn ${scanning ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ width: '100%', height: '50px' }}
                    >
                        {scanning ? '🛑 Stop Scanner' : '📷 Open QR Scanner'}
                    </button>
                    {scanning && <div id="reader" style={{ width: '100%', marginTop: '15px', borderRadius: '12px', overflow: 'hidden' }}></div>}
                </div>

                <div className="divider-vertical" style={{ width: '1px', height: '50px', background: 'var(--border-light)', display: 'none' }}></div>

                <div className="manual-verify" style={{ flex: 1, minWidth: '250px', display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        maxLength="4" 
                        placeholder="Enter 4-digit code" 
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value.replace(/\D/g, ''))}
                        style={{ flex: 1, height: '50px', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: '12px', color: '#fff' }}
                    />
                    <button onClick={handleVerifyCode} className="btn btn-primary" style={{ height: '50px', padding: '0 20px' }}>
                        Verify
                    </button>
                </div>
            </div>

            {scanResult && (
                <div className={`badge badge-${scanResult.success ? 'success' : 'danger'}`} style={{ display: 'block', marginBottom: '20px', padding: '15px', borderRadius: '12px', textAlign: 'center', fontSize: '1rem' }}>
                    {scanResult.success ? '✅ ' : '❌ '}{scanResult.message}
                </div>
            )}

            <div className="grid-3">
                {orders.map(order => (
                    <div key={order._id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h4>Order #{order._id.slice(-6)}</h4>
                            <span className={`badge badge-${order.orderStatus === 'placed' ? 'success' : 'warning'}`}>
                                {order.orderStatus}
                            </span>
                        </div>
                        <p>User: {order.user.name}</p>
                        <p>Total: ₹{order.totalAmount}</p>
                        <p>Items: {order.items.length}</p>
                         {order.orderStatus === 'placed' && (
                             <button onClick={() => handleScan(order._id)} className="btn btn-secondary btn-block" style={{ marginTop: '10px' }}>
                                 Manual Collect (Simulate Scan)
                             </button>
                         )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VendorOrders;
