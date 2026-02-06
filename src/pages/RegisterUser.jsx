import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';

const RegisterUser = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    
    // Location State
    const [place, setPlace] = useState('');
    const [district, setDistrict] = useState('');
    const [state, setState] = useState('');
    const [coordinates, setCoordinates] = useState(null);

    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    
    const { registerUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('phone', phone);
            
            // Append location data
            formData.append('place', place);
            formData.append('district', district);
            formData.append('state', state);
            if (coordinates) formData.append('coordinates', JSON.stringify(coordinates));

            if (image) formData.append('image', image);

            await registerUser(formData);
            navigate('/');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }} className="card">
            <h2 className="text-center" style={{ marginBottom: '1.5rem' }}>Join as User</h2>
            {error && <div className="badge badge-danger" style={{ marginBottom: '1rem', width: '100%' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Profile Photo (Optional)</label>
                    <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ padding: '10px 0' }} />
                </div>
                <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Phone</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                {/* Location Picker */}
                <div className="form-group" style={{marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '20px'}}>
                    <h4 style={{marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Location</h4>
                    <LocationPicker onLocationSelect={(loc) => {
                        setPlace(loc.city || '');
                        setDistrict(loc.district || '');
                        setState(loc.state || '');
                        setCoordinates(loc.coordinates);
                    }} />
                    
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px'}}>
                        <input placeholder="City/Place" value={place} onChange={(e) => setPlace(e.target.value)} className="form-control" style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: '#fff'}} />
                        <input placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} className="form-control" style={{width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: '#fff'}} />
                    </div>
                    <input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="form-control" style={{width: '100%', padding: '10px', marginTop: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'var(--bg-card)', color: '#fff'}} />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
            </form>
        </div>
    );
};

export default RegisterUser;
