import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [theme, setTheme] = useState('dark');

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="container">
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    SURPLUZ <span>MARKET</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto', marginRight: '20px' }}>
                    <button 
                        onClick={toggleTheme} 
                        style={{
                            background: 'none', 
                            border: '1px solid var(--border-light)', 
                            borderRadius: '50%', 
                            width: '40px', 
                            height: '40px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            color: 'var(--text-primary)'
                        }}
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>

                {/* Hamburger Button */}
                <button 
                    className={`hamburger ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Navigation Menu */}
                <ul className={`navbar-nav ${isMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/" className="nav-link" onClick={closeMenu}>Marketplace</Link></li>
                    
                    {user ? (
                        <>
                            {user.role === 'user' && (
                                <>
                                    <li><Link to="/profile" className="nav-link" onClick={closeMenu}>My Account</Link></li>
                                    <li><Link to="/profile" className="nav-link" onClick={() => { closeMenu(); /* Navigate to profile but maybe auto-switch tab? For now just link to profile */ }}>Cart</Link></li>
                                </>
                            )}
                            {user.role === 'vendor' && (
                                <li><Link to="/vendor-dashboard" className="nav-link" onClick={closeMenu}>Restaurant Dashboard</Link></li>
                            )}
                            {user.role === 'admin' && (
                                <li><Link to="/admin-dashboard" className="nav-link admin-link" onClick={closeMenu}>👑 <strong>Admin</strong></Link></li>
                            )}
                            <li>
                                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className="nav-link" onClick={closeMenu}>Login</Link></li>
                            <li><Link to="/register-user" className="btn btn-primary" onClick={closeMenu}>Join</Link></li>
                        </>
                    )}
                </ul>

                {/* Overlay */}
                {isMenuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
            </div>
        </nav>
    );
};

export default Navbar;
