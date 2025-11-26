import { useState, useEffect, useMemo } from 'react';
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

    const effectType = useMemo(() => {
        if (!weather || !weather.weather || weather.weather.length === 0) {
            return null;
        }

        const weatherMain = weather.weather[0].main.toLowerCase();

        if (weatherMain === 'rain' || weatherMain === 'drizzle' || weatherMain === 'thunderstorm') {
            return 'rain';
        }
        else if (weatherMain === 'snow') {
            return 'snow';
        }
        else if (weatherMain === 'mist' || weatherMain === 'fog' || weatherMain === 'haze') {
            return 'fog';
        }

        return null;
    }, [weather]);

    const rainDrops = useMemo(() => {
        if (effectType !== 'rain') return [];
        return Array.from({ length: 30 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 0.5 + Math.random() * 0.5
        }));
    }, [effectType]);

    const snowflakes = useMemo(() => {
        if (effectType !== 'snow') return [];
        return Array.from({ length: 20 }, (_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 3,
            duration: 3 + Math.random() * 2
        }));
    }, [effectType]);

    if (!effectType) {
        return null;
    }

    return (
        <div className={styles.weatherEffects} data-effect={effectType}>
            {effectType === 'rain' && (
                <>
                    {rainDrops.map((drop) => (
                        <div key={drop.id} className={styles.raindrop} style={{
                            left: `${drop.left}%`,
                            animationDelay: `${drop.delay}s`,
                            animationDuration: `${drop.duration}s`
                        }}></div>
                    ))}
                </>
            )}
            {effectType === 'snow' && (
                <>
                    {snowflakes.map((flake) => (
                        <div key={flake.id} className={styles.snowflake} style={{
                            left: `${flake.left}%`,
                            animationDelay: `${flake.delay}s`,
                            animationDuration: `${flake.duration}s`
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

