const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  Gorakhpur: { lat: 26.7606, lon: 83.3732 },
  Nashik: { lat: 20.0110, lon: 73.7903 },
  Jaipur: { lat: 26.9124, lon: 75.7873 },
  Indore: { lat: 22.7196, lon: 75.8577 },
  Ludhiana: { lat: 30.9010, lon: 75.8523 },
};

export const weatherService = {
  async getCurrentWeather(lat: number, lon: number) {
    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
      throw new Error("WEATHER_API_KEY is missing from environment variables.");
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    
    // In Node.js >= 18, fetch is available globally.
    // If running in older node, node-fetch might be required, but assuming native fetch is available.
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
       throw new Error(`OpenWeatherMap API failed with status ${response.status}`);
    }
    return response.json();
  },

  async detectSevereWeatherAlerts(district: string) {
    try {
      const coords = DISTRICT_COORDS[district];
      if (!coords) return [];

      const weatherData = await this.getCurrentWeather(coords.lat, coords.lon);
      const alerts = [];

      const temp = weatherData.main?.temp;
      const windSpeed = weatherData.wind?.speed;
      const rain1h = weatherData.rain?.['1h'] || 0;

      if (rain1h > 10) {
        alerts.push({
          id: `weather-rain-${district}-${Date.now()}`,
          type: 'weather' as const,
          severity: 'Critical' as const,
          state: 'Unknown',
          district,
          condition: 'Heavy Rain Warning',
          description: `Extremely heavy rainfall (${rain1h}mm/hr) detected in ${district}.`,
          recommendation: 'Delay harvest by 2-3 days and ensure field drainage.',
          createdAt: new Date().toISOString()
        });
      }

      if (temp !== undefined && temp < 4) {
        alerts.push({
          id: `weather-frost-${district}-${Date.now()}`,
          type: 'weather' as const,
          severity: 'Critical' as const,
          state: 'Unknown',
          district,
          condition: 'Frost Warning',
          description: `Temperatures have dropped to ${temp}°C in ${district}, posing a frost risk to sensitive crops.`,
          recommendation: 'Apply light irrigation to fields to raise ambient temperature.',
          createdAt: new Date().toISOString()
        });
      }

      if (temp !== undefined && temp > 42) {
        alerts.push({
          id: `weather-heat-${district}-${Date.now()}`,
          type: 'weather' as const,
          severity: 'Warning' as const,
          state: 'Unknown',
          district,
          condition: 'Heatwave Warning',
          description: `Extreme temperatures of ${temp}°C detected in ${district}.`,
          recommendation: 'Increase irrigation frequency and avoid spraying chemicals at noon.',
          createdAt: new Date().toISOString()
        });
      }

      if (windSpeed !== undefined && windSpeed > 15) {
        alerts.push({
          id: `weather-wind-${district}-${Date.now()}`,
          type: 'weather' as const,
          severity: 'Warning' as const,
          state: 'Unknown',
          district,
          condition: 'High Wind Warning',
          description: `Strong winds (${windSpeed} m/s) detected in ${district}.`,
          recommendation: 'Secure tall crops and postpone pesticide spraying.',
          createdAt: new Date().toISOString()
        });
      }

      return alerts;
    } catch (err) {
      console.warn(`[weatherService] Failed to fetch weather for ${district}:`, err);
      return [];
    }
  }
};
