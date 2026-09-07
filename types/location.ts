export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  avgRating: number;
  createdAt: string;
}

export interface SunsetTime {
  date: string;
  tzId: string;
  utcOffset: string;
  sunrise: string;
  sunset: string;
  solarNoon: string;
  dayLengthSeconds: number;
}
