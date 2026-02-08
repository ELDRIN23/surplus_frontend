import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
             if (data.role === 'admin') navigate('/admin-dashboard');
             else if (data.role === 'vendor') navigate('/vendor-dashboard');
             else navigate('/'); // User
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }} className="card">
            <h2 className="text-center">Login</h2>
            {error && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Login</button>
            </form>
            <p className="text-center" style={{ marginTop: '15px' }}>
                New User? <Link to="/register-user">Register here</Link>
            </p>
             <p className="text-center">
                Are you a Vendor? <Link to="/register-vendor">Register Business</Link>
            </p>
        </div>
    );
};

export default Login;
