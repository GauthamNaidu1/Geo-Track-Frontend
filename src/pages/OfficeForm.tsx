import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import { LatLng } from 'leaflet'
import api from '../services/api'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
import L from 'leaflet'
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png'
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

// Component to handle map clicks
function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng.wrap())
    },
  })

  return position === null ? null : <Marker position={position} />
}

export default function OfficeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    latitude: 37.7749, // Default: San Francisco
    longitude: -122.4194,
    radiusMeters: 100,
    timezone: 'America/Los_Angeles',
  })

  const [position, setPosition] = useState<LatLng | null>(
    new LatLng(37.7749, -122.4194)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      fetchOffice()
    }
  }, [id])

  useEffect(() => {
    if (position) {
      setFormData(prev => ({
        ...prev,
        latitude: position.lat,
        longitude: position.lng,
      }))
    }
  }, [position])

  const fetchOffice = async () => {
    try {
      const response = await api.get(`/offices/${id}`)
      const office = response.data.office
      setFormData({
        name: office.name,
        latitude: office.latitude,
        longitude: office.longitude,
        radiusMeters: office.radiusMeters,
        timezone: office.timezone,
      })
      setPosition(new LatLng(office.latitude, office.longitude))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load office')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isEdit) {
        await api.put(`/offices/${id}`, formData)
      } else {
        await api.post('/offices', formData)
      }
      navigate('/offices')
    } catch (err: any) {
      console.error('Submit error details:', err.response?.data)
      console.error('ID used for PUT:', id)
      console.error('FormData sent:', formData)
      setError(err.response?.data?.message || 'Failed to save office')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleCoordinateChange = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [field]: numValue,
      }))
      if (field === 'latitude') {
        setPosition(prev => new LatLng(numValue, prev ? prev.lng : formData.longitude))
      } else {
        setPosition(prev => new LatLng(prev ? prev.lat : formData.latitude, numValue))
      }
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary dark:text-white">
            {isEdit ? 'Edit Office' : 'Add New Office'}
          </h1>
          <p className="text-text-secondary dark:text-slate-400 mt-1">
            {isEdit ? 'Update office location and geofence' : 'Create a new office location'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Office Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-text-primary dark:text-white">
              Office Details
            </h2>

            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                Office Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Main Office"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Geofence Radius (meters) *
                </label>
                <input
                  type="number"
                  name="radiusMeters"
                  value={formData.radiusMeters}
                  onChange={handleChange}
                  required
                  min="10"
                  max="10000"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-text-secondary dark:text-slate-400 mt-1">
                  Range: 10-10,000 meters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Timezone *
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="UTC">UTC</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location Selection */}
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-text-primary dark:text-white">
              Location & Geofence
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
                  required
                  min="-90"
                  max="90"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
                  required
                  min="-180"
                  max="180"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <p className="text-sm text-text-secondary dark:text-slate-400 mb-2">
                Click on the map to set the office location. The circle shows the geofence radius.
              </p>
              <div className="h-96 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
                <MapContainer
                  center={[formData.latitude, formData.longitude]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  key={`${formData.latitude}-${formData.longitude}`}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker position={position} setPosition={setPosition} />
                  {position && (
                    <Circle
                      center={position}
                      radius={formData.radiusMeters}
                      pathOptions={{
                        color: '#2563EB',
                        fillColor: '#2563EB',
                        fillOpacity: 0.2,
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEdit ? 'Update Office' : 'Create Office'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/offices')}
              className="flex-1 bg-slate-200 dark:bg-slate-700 text-text-primary dark:text-white py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
