import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateListing = () => {
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

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFile = (e) => setImage(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);

        try {
             const token = JSON.parse(localStorage.getItem('userInfo')).token;
             const config = { headers: { Authorization: `Bearer ${token}` } };
             await axios.post('/api/listings', data, config);
             navigate('/vendor-dashboard');
        } catch (error) {
            alert('Error creating listing');
            console.error(error);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="card">
            <h2 style={{ marginBottom: '2rem' }}>Add New Listing</h2>
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
                    <input name="originalPrice" type="number" onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Discounted Price</label>
                    <input name="discountedPrice" type="number" onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Quantity (Bundles)</label>
                    <input name="quantity" type="number" onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Pickup Start Time</label>
                    <input name="pickupStart" type="datetime-local" onChange={handleChange} required />
                </div>
                 <div className="form-group">
                    <label>Pickup End Time</label>
                    <input name="pickupEnd" type="datetime-local" onChange={handleChange} required />
                </div>

                <button type="submit" className="btn btn-primary btn-block">Create Listing</button>
            </form>
        </div>
    );
};

export default CreateListing;
