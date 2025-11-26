export interface Coordinates {
    lat: number;
    lon: number;
  }
  
  export interface City {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
  }
  
  export interface Weather {
    id: number;
    main: string;
    description: string;
    icon: string;
  }
  
  export interface MainWeatherData {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  }
  
  export interface Wind {
    speed: number;
    deg: number;
    gust?: number;
  }
  
  export interface CurrentWeather {
    coord: Coordinates;
    weather: Weather[];
    main: MainWeatherData;
    visibility: number;
    wind: Wind;
    clouds: {
      all: number;
    };
    dt: number;
    sys: {
      country: string;
      sunrise: number;
      sunset: number;
    };
    timezone: number;
    id: number;
    name: string;
  }
  
  export interface ForecastItem {
    dt: number;
    main: MainWeatherData;
    weather: Weather[];
    clouds: {
      all: number;
    };
    wind: Wind;
    visibility: number;
    pop: number;
    dt_txt: string;
  }
  
  export interface Forecast {
    list: ForecastItem[];
    city: {
      id: number;
      name: string;
      coord: Coordinates;
      country: string;
      timezone: number;
    };
  }
  
  export interface AirPollution {
    list: Array<{
      main: {
        aqi: 1 | 2 | 3 | 4 | 5;
      };
      components: {
        co: number;
        no: number;
        no2: number;
        o3: number;
        so2: number;
        pm2_5: number;
        pm10: number;
        nh3: number;
      };
      dt: number;
    }>;
  }