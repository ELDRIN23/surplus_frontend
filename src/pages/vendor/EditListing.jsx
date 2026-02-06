import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditListing = () => {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: '', 
        description: '', 
        category: 'Meals',
        originalPrice: '', 
        discountedPrice: '', 
        quantity: '', 
        pickupStart: '', 
        pickupEnd: ''
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const checkApproval = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('userInfo')).token;
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('/api/vendors/profile', config);
                if (!data.isApproved) {
                    navigate('/vendor-dashboard');
                }
            } catch (error) {
                navigate('/login');
            }
        };
        checkApproval();
    }, [navigate]);

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const { data } = await axios.get(`/api/listings/${id}`);
                setFormData({
                    title: data.title,
                    description: data.description,
                    category: data.category || 'Meals',
                    originalPrice: data.originalPrice,
                    discountedPrice: data.discountedPrice,
                    quantity: data.quantity,
                    pickupStart: new Date(data.pickupStart).toISOString().slice(0, 16),
                    pickupEnd: new Date(data.pickupEnd).toISOString().slice(0, 16)
                });
                setLoading(false);
            } catch (error) {
                console.error(error);
                alert('Error fetching listing');
                navigate('/vendor-dashboard');
            }
        };
        fetchListing();
    }, [id, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFile = (e) => setImage(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
             const userInfo = JSON.parse(localStorage.getItem('userInfo'));
             const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
             await axios.put(`/api/listings/${id}`, data, config);
             
             // Check role for redirection
             if (userInfo.role === 'admin') {
                navigate('/admin-dashboard');
             } else {
                navigate('/vendor-dashboard');
             }
        } catch (error) {
            alert('Error updating listing');
            console.error(error);
        }
    };

    if (loading) return <div className="loader"></div>;

    return (
        <div style={{ maxWidth: '600px', margin: '2rem auto' }} className="card">
            <h2>Edit Listing</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'none', fontWeight: 'normal' }}>
                            <input type="radio" name="category" value="Meals" checked={formData.category === 'Meals'} onChange={handleChange} style={{ width: 'auto' }} />
                            Meals
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'none', fontWeight: 'normal' }}>
                            <input type="radio" name="category" value="Bakery" checked={formData.category === 'Bakery'} onChange={handleChange} style={{ width: 'auto' }} />
                            Bakery
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'none', fontWeight: 'normal' }}>
                            <input type="radio" name="category" value="Both" checked={formData.category === 'Both'} onChange={handleChange} style={{ width: 'auto' }} />
                            Both
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                </div>
                 <div className="form-group">
                    <label>Original Price</label>
                    <input name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Discounted Price</label>
                    <input name="discountedPrice" type="number" value={formData.discountedPrice} onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Quantity (Bundles)</label>
                    <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Pickup Start Time</label>
                    <input name="pickupStart" type="datetime-local" value={formData.pickupStart} onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Pickup End Time</label>
                    <input name="pickupEnd" type="datetime-local" value={formData.pickupEnd} onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Image (Optional)</label>
                    <input type="file" onChange={handleFile} accept="image/*" />
                    <p style={{fontSize: '0.8rem', color: '#888'}}>Leave blank to keep existing image</p>
                </div>
                <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
                    <button type="submit" className="btn btn-primary" style={{flex: 1}}>Update Listing</button>
                    <button type="button" onClick={() => navigate('/vendor-dashboard')} className="btn btn-secondary" style={{flex: 1}}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditListing;
