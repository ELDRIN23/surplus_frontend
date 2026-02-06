import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AiSupportBot from './components/AiSupportBot';


// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import RegisterUser from './pages/RegisterUser';
import RegisterVendor from './pages/RegisterVendor';
import ListingDetail from './pages/ListingDetail';

// Reorganized Imports
import UserDashboard from './pages/user/Dashboard';
import VendorDashboard from './pages/vendor/Dashboard';
import VendorOrders from './pages/vendor/Orders';
import CreateListing from './pages/vendor/CreateListing';
import EditListing from './pages/vendor/EditListing';
import AdminDashboard from './pages/admin/Dashboard';
import UserProfile from './pages/user/Profile';


function App() {


  return (
    <AuthProvider>

      <Router>
        <div className="App">

          <Navbar />
          <div className="container" style={{ paddingTop: '20px', paddingBottom: '50px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register-user" element={<RegisterUser />} />
              <Route path="/register-vendor" element={<RegisterVendor />} />
              <Route path="/listing/:id" element={<ListingDetail />} />

              {/* User Routes */}
              <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                 <Route path="/my-orders" element={<UserDashboard />} />
                 <Route path="/profile" element={<UserProfile />} />
              </Route>

              {/* Vendor & Admin Routes for Management */}
              <Route element={<ProtectedRoute allowedRoles={['vendor', 'admin']} />}>
                 <Route path="/vendor/edit-listing/:id" element={<EditListing />} />
              </Route>

              {/* Strict Vendor Routes */}
              <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
                 <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                 <Route path="/vendor/create-listing" element={<CreateListing />} />
                 <Route path="/vendor/orders" element={<VendorOrders />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                 <Route path="/admin-dashboard" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </div>
          <AiSupportBot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
