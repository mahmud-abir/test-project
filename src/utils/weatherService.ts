export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  uvIndex: number;
  locationName: string;
  isRealLocation: boolean;
}

export const getWeatherData = async (
  lat: number,
  lon: number,
  locationName: string = 'Current Location',
  isRealLocation: boolean = true
): Promise<WeatherData> => {
  try {
    // Using Open-Meteo Free API (No Key Required)
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&timezone=auto`
    );

    if (!response.ok) throw new Error('Weather API failed');

    const data = await response.json();
    const current = data.current_weather;
    
    // Simple condition mapping based on weather code
    const code = current.weathercode;
    let condition = 'Clear';
    if (code > 0 && code <= 3) condition = 'Partly Cloudy';
    if (code >= 45 && code <= 48) condition = 'Foggy';
    if (code >= 51 && code <= 67) condition = 'Rainy';
    if (code >= 71 && code <= 77) condition = 'Snowy';
    if (code >= 80 && code <= 99) condition = 'Stormy';

    // Get humidity from hourly data (current hour)
    const hour = new Date().getHours();
    const humidity = data.hourly.relativehumidity_2m[hour] || 50;

    return {
      temp: Math.round(current.temperature),
      condition,
      humidity,
      uvIndex: Math.round(current.temperature / 5), // Simulated UV based on temp for free tier
      locationName,
      isRealLocation,
    };
  } catch (error) {
    console.error('Weather fetch error:', error);
    // Fallback to Busan data if API fails
    return {
      temp: 22,
      condition: 'Clear',
      humidity: 60,
      uvIndex: 4,
      locationName: 'Busan (Fallback)',
      isRealLocation: false,
    };
  }
};
