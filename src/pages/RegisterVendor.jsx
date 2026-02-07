import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';

const RegisterVendor = () => {
    const [formData, setFormData] = useState({
        name: '', ownerName: '', email: '', password: '', phone: '', address: '', description: '', licenseNumber: '',
        place: '', district: '', state: ''
    });
    const [image, setImage] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [error, setError] = useState('');
    
    const { registerVendor } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFile = (e) => setImage(e.target.files[0]);

    // Callback when location is picked/detected
    const handleLocationSelect = (locData) => {
        if (locData.coordinates) setCoordinates(locData.coordinates);
        
        // Auto-fill address fields if available from reverse geocoding
        setFormData(prev => ({
            ...prev,
            place: locData.city || prev.place,
            district: locData.district || prev.district,
            state: locData.state || prev.state,
            address: locData.formattedAddress || prev.address
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);
        if (coordinates) data.append('coordinates', JSON.stringify(coordinates));

        try {
            await registerVendor(data);
            navigate('/vendor-dashboard');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="card">
            <h2 className="text-center">Register Restaurant</h2>
            {error && <div className="badge badge-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Restaurant Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Owner Name</label>
                    <input name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                </div>
                
                {/* Location Section */}
                <div className="form-section-divider">
                    <h4 style={{marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '5px'}}>Location Details</h4>
                    
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    
                    <div className="grid-2-col" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                        <div className="form-group">
                            <label>Place / City</label>
                            <input name="place" value={formData.place} onChange={handleChange} placeholder="e.g. Thrissur" required />
                        </div>
                        <div className="form-group">
                            <label>District</label>
                            <input name="district" value={formData.district} onChange={handleChange} placeholder="e.g. Thrissur" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>State</label>
                        <input name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Kerala" required />
                    </div>
                    <div className="form-group">
                        <label>Full Address</label>
                        <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Building, Street, Landmark..." required></textarea>
                    </div>
                </div>


                <div className="form-group">
                    <label>Email</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>License Number</label>
                    <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-block">Register Business</button>
            </form>
        </div>
    );
};

export default RegisterVendor;
