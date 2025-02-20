export type Location = {
  id: string
  name: string
  region: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

export const locations = [
  { 
    id: 'ny',
    name: 'New York',
    region: 'East Coast',
    country: 'United States',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  { 
    id: 'ldn',
    name: 'London',
    region: 'Greater London',
    country: 'United Kingdom',
    coordinates: { lat: 51.5074, lng: -0.1278 }
  },
  { 
    id: 'par',
    name: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  { 
    id: 'tk',
    name: 'Tokyo',
    region: 'Kantō',
    country: 'Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  { 
    id: 'mil',
    name: 'Milan',
    region: 'Lombardy',
    country: 'Italy',
    coordinates: { lat: 45.4642, lng: 9.1900 }
  }
] as const

export const getLocationById = (id: string) => 
  locations.find(location => location.id === id) 