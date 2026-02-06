import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix for Leaflet marker icons not showing in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when coords change
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

const LocationPicker = ({ onLocationSelect }) => {
    const [location, setLocation] = useState(null);
    const [addressDetails, setAddressDetails] = useState(null);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [error, setError] = useState('');

    const detectLocation = (e) => {
        e.preventDefault(); // Prevent form submission
        setLoading(true);
        setError('');

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
            
            // Reverse Geocoding via Nominatim (OpenStreetMap)
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                if (data && data.address) {
                    const city = data.address.city || data.address.town || data.address.village;
                    const district = data.address.state_district || data.address.county;
                    const state = data.address.state;
                    const formatted = data.display_name;

                    setAddressDetails({
                        city,
                        district,
                        state,
                        formattedAddress: formatted,
                        coordinates: { lat: latitude, lng: longitude }
                    });
                    
                    setAddress(`${city || 'Unknown'}, ${district || state}`);
                }
            } catch (err) {
                console.error("Geocoding failed", err);
                setAddress("Location Detected");
                // Fallback struct even if geocoding fails
                setAddressDetails({
                    coordinates: { lat: latitude, lng: longitude }
                });
            } finally {
                setLoading(false);
                setShowMap(true); // Auto open map to confirm
            }
        }, (err) => {
            console.error(err);
            setError('Unable to retrieve location');
            setLoading(false);
        });
    };

    const confirmLocation = () => {
        if (addressDetails && onLocationSelect) {
            onLocationSelect(addressDetails);
        }
        setShowMap(false);
    };

    return (
        <div className="location-picker-container">
            <button className="location-btn" onClick={detectLocation} title="Detect Location">
                <span className="location-icon">📍</span>
                {loading ? 'Locating...' : (address || 'Set Location')}
            </button>

            {showMap && location && (
                <div className="map-modal-overlay">
                    <div className="map-modal">
                        <div className="map-header">
                            <h3>Confirm Location</h3>
                            <button type="button" className="close-map-btn" onClick={() => setShowMap(false)}>×</button>
                        </div>
                        <div className="map-content">
                            <MapContainer center={[location.lat, location.lng]} zoom={13} scrollWheelZoom={false} style={{ height: '300px', width: '100%' }}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[location.lat, location.lng]}>
                                    <Popup>
                                        You are here! <br /> {address}
                                    </Popup>
                                </Marker>
                                <ChangeView center={[location.lat, location.lng]} />
                            </MapContainer>
                        </div>
                        <div className="map-footer">
                            <p className="detected-text">Detected: <strong>{address}</strong></p>
                            <button type="button" className="btn-confirm-location" onClick={confirmLocation}>Confirm & Use</button>
                        </div>
                    </div>
                </div>
            )}
            
            {error && <div className="location-error">{error}</div>}
        </div>
    );
};

export default LocationPicker;
