export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  uv: number;
  location?: { lat: number; lon: number };
}

export const fetchRealTimeWeather = async (): Promise<WeatherData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`
          );
          const data = await response.json();
          const current = data.current;

          const getCondition = (code: number) => {
            if (code === 0) return 'Clear';
            if (code <= 3) return 'Partly Cloudy';
            if (code <= 48) return 'Cloudy';
            if (code <= 67) return 'Rainy';
            return 'Unknown';
          };

          resolve({
            temp: Math.round(current.temperature_2m),
            condition: getCondition(current.weather_code),
            humidity: current.relative_humidity_2m,
            uv: 3,
            location: { lat: latitude, lon: longitude }
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(error.message),
      { timeout: 5000 }
    );
  });
};
