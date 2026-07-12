import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getVehicleLocationsAPI } from '../api/vehicles';

// Fix for default marker icons in Leaflet when using Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored icons
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const greenIcon = createIcon('green');
const blueIcon = createIcon('blue');
const redIcon = createIcon('red');

const getMarkerIcon = (status) => {
  if (status === 'Available') return greenIcon;
  if (status === 'On Trip') return blueIcon;
  return redIcon; // In Shop or others
};

const FleetMap = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const data = await getVehicleLocationsAPI();
      setVehicles(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch vehicle locations', err);
    }
  };

  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6 text-text-primary">Loading map...</div>;
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-text-primary font-mono tracking-tight">Fleet Map</h1>
      <div className="flex-1 rounded-xl overflow-hidden shadow-lg border border-default z-0 relative">
        <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vehicles.map((v) => (
            v.latitude && v.longitude ? (
              <Marker key={v.id} position={[v.latitude, v.longitude]} icon={getMarkerIcon(v.status)}>
                <Popup>
                  <div className="text-gray-800">
                    <h3 className="font-bold text-lg">{v.name}</h3>
                    <p className="text-sm">Reg: <span className="font-mono">{v.reg_no}</span></p>
                    {v.driver_name && <p className="text-sm">Driver: {v.driver_name}</p>}
                    <p className="text-sm">Status: <span className="font-semibold">{v.status}</span></p>
                    <p className="text-sm">Capacity: {v.capacity} kg</p>
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default FleetMap;
