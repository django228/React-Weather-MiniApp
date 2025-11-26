import type { City, CurrentWeather, Forecast, AirPollution } from "../types/weather";

const API_KEY = import.meta.env.VITE_OWM_API_KEY;
const BASE_URL = 'https://api.openweathermap.org';

if (!API_KEY || API_KEY === 'your_api_key_here') {
  console.warn('OpenWeatherMap API ключ не настроен. Установите VITE_OWM_API_KEY в файле .env');
}

class WeatherApiService {
  private async fetchData<T>(url: string): Promise<T> {
    if (!API_KEY || API_KEY === 'your_api_key_here') {
      throw new Error('API ключ не настроен. Пожалуйста, создайте файл .env и добавьте VITE_OWM_API_KEY=your_api_key');
    }

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API ключ недействителен или отсутствует. Проверьте VITE_OWM_API_KEY в файле .env');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async searchCities(cityName: string): Promise<City[]> {
    const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${API_KEY}`;
    return this.fetchData<City[]>(url);
  }

  async getCityByCoords(lat: number, lon: number): Promise<City[]> {
    const url = `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    return this.fetchData<City[]>(url);
  }

  async getCurrentWeather(
    lat: number, 
    lon: number, 
    units: 'metric' | 'imperial' = 'metric',
    lang: 'ru' | 'en' = 'ru'
  ): Promise<CurrentWeather> {
    const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${API_KEY}`;
    return this.fetchData<CurrentWeather>(url);
  }

  async getForecast(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' = 'metric',
    lang: 'ru' | 'en' = 'ru'
  ): Promise<Forecast> {
    const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&lang=${lang}&appid=${API_KEY}`;
    return this.fetchData<Forecast>(url);
  }

  async getAirPollution(lat: number, lon: number): Promise<AirPollution> {
    const url = `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    return this.fetchData<AirPollution>(url);
  }

  async getAllWeatherData(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' = 'metric',
    lang: 'ru' | 'en' = 'ru'
  ) {
    const [current, forecast, pollution, city] = await Promise.all([
      this.getCurrentWeather(lat, lon, units, lang),
      this.getForecast(lat, lon, units, lang),
      this.getAirPollution(lat, lon),
      this.getCityByCoords(lat, lon)
    ]);

    return {
      current,
      forecast,
      pollution,
      city: city[0] || null
    };
  }
}

export const weatherApi = new WeatherApiService();