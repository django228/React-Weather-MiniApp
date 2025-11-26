import { useState, useEffect } from 'react';
import type { CurrentWeather } from '../../types/weather';
import styles from './WeatherEffects.module.scss';

const WeatherEffects = () => {
    const [weather, setWeather] = useState<CurrentWeather | null>(null);

    useEffect(() => {
        const handleWeatherUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.weather) {
                setWeather(customEvent.detail.weather);
            }
        };

        window.addEventListener('weatherUpdated', handleWeatherUpdate);

        const savedWeather = localStorage.getItem('weather-app-current-weather');
        if (savedWeather) {
            try {
                const parsed = JSON.parse(savedWeather);
                setWeather(parsed);
            } catch (e) {
                console.error('Ошибка парсинга погоды:', e);
            }
        }

        return () => {
            window.removeEventListener('weatherUpdated', handleWeatherUpdate);
        };
    }, []);

    if (!weather || !weather.weather || weather.weather.length === 0) {
        return null;
    }

    const weatherMain = weather.weather[0].main.toLowerCase();

    let effectType: 'rain' | 'snow' | 'fog' | null = null;

    if (weatherMain === 'rain' || weatherMain === 'drizzle' || weatherMain === 'thunderstorm') {
        effectType = 'rain';
    }
    else if (weatherMain === 'snow') {
        effectType = 'snow';
    }
    else if (weatherMain === 'mist' || weatherMain === 'fog' || weatherMain === 'haze') {
        effectType = 'fog';
    }

    if (!effectType) {
        return null;
    }

    return (
        <div className={styles.weatherEffects} data-effect={effectType}>
            {effectType === 'rain' && (
                <>
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div key={i} className={styles.raindrop} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 2}s`,
                            animationDuration: `${0.5 + Math.random() * 0.5}s`
                        }}></div>
                    ))}
                </>
            )}
            {effectType === 'snow' && (
                <>
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={styles.snowflake} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}>❄</div>
                    ))}
                </>
            )}
            {effectType === 'fog' && (
                <div className={styles.fog}>
                    <div className={styles.fogLayer}></div>
                    <div className={styles.fogLayer}></div>
                    <div className={styles.fogLayer}></div>
                </div>
            )}
        </div>
    );
};

export default WeatherEffects;

