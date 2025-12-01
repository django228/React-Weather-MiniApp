import styles from './ThreeHourForecast.module.scss';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import type { Forecast, ForecastItem } from '../../types/weather';
import { weatherApi } from '../../services/weatherService';
import useLocation from '../../hooks/useLocation';
import i18n from '../../shared/configs/i18n/i18n';
import Loader from '../Loader/Loader';
import ErrorPage from '../ErrorPage/ErrorPage';

const ThreeHourForecast = () => {
    const { t } = useTranslation();
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { latitude, longitude } = useLocation();
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [units, setUnits] = useState<'metric' | 'imperial'>(() => {
        const saved = localStorage.getItem('weather-app-units') as 'metric' | 'imperial' | null;
        return saved || 'metric';
    });

    useEffect(() => {
        const handleUnitsChange = () => {
            const saved = localStorage.getItem('weather-app-units') as 'metric' | 'imperial' | null;
            if (saved) {
                setUnits(saved);
            }
        };

        window.addEventListener('unitsChanged', handleUnitsChange);
        return () => {
            window.removeEventListener('unitsChanged', handleUnitsChange);
        };
    }, []);

    useEffect(() => {
        const savedCoords = localStorage.getItem('weather-app-coords');
        if (savedCoords) {
            try {
                const parsed = JSON.parse(savedCoords);
                setCoords({ lat: parsed.lat, lon: parsed.lon });
            } catch (e) {
                console.error('Ошибка парсинга координат:', e);
            }
        } else if (latitude && longitude) {
            setCoords({ lat: latitude, lon: longitude });
        } else if (!latitude && !longitude) {
            setIsLoading(false);
        }
    }, [latitude, longitude]);

    useEffect(() => {
        const handleCityUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.lat && customEvent.detail?.lon) {
                setCoords({ lat: customEvent.detail.lat, lon: customEvent.detail.lon });
            } else {
                const savedCoords = localStorage.getItem('weather-app-coords');
                if (savedCoords) {
                    try {
                        const parsed = JSON.parse(savedCoords);
                        setCoords({ lat: parsed.lat, lon: parsed.lon });
                    } catch (e) {
                        console.error('Ошибка парсинга координат:', e);
                    }
                }
            }
        };

        window.addEventListener('cityUpdated', handleCityUpdate);
        return () => {
            window.removeEventListener('cityUpdated', handleCityUpdate);
        };
    }, []);

    useEffect(() => {
        const fetchForecast = async () => {
            const lat = coords?.lat || latitude;
            const lon = coords?.lon || longitude;

            if (!lat || !lon) {
                setIsLoading(true);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const lang = i18n.language === 'ru' ? 'ru' : 'en';
                const forecastData = await weatherApi.getForecast(
                    lat,
                    lon,
                    units,
                    lang
                );
                setForecast(forecastData);
            } catch (err) {
                console.error('Ошибка получения прогноза:', err);
                setError(err instanceof Error ? err.message : 'Не удалось загрузить прогноз');
            } finally {
                setIsLoading(false);
            }
        };

        if (coords || (latitude && longitude)) {
            fetchForecast();
        }
    }, [coords, latitude, longitude, units]);

    if (isLoading) {
        return (
            <div className={styles.forecastWrapper}>
                <Loader message={t('Loading forecast...') || 'Загрузка прогноза...'} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.forecastWrapper}>
                <ErrorPage 
                    message={error}
                    onRetry={() => {
                        if (coords || (latitude && longitude)) {
                            const lat = coords?.lat || latitude;
                            const lon = coords?.lon || longitude;
                            if (lat && lon) {
                                const fetchForecast = async () => {
                                    setIsLoading(true);
                                    setError(null);
                                    try {
                                        const lang = i18n.language === 'ru' ? 'ru' : 'en';
                                        const forecastData = await weatherApi.getForecast(
                                            lat,
                                            lon,
                                            units,
                                            lang
                                        );
                                        setForecast(forecastData);
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : 'Не удалось загрузить прогноз');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                };
                                fetchForecast();
                            }
                        }
                    }}
                />
            </div>
        );
    }

    if (!forecast || !forecast.list || forecast.list.length === 0) {
        return null;
    }

    const now = new Date();
    const threeHourForecast = forecast.list
        .filter(item => {
            const itemDate = new Date((item.dt + forecast.city.timezone) * 1000);
            return itemDate > now;
        })
        .slice(0, 3);

    if (threeHourForecast.length === 0) {
        return null;
    }

    const formatTime = (timestamp: number, timezone: number) => {
        const date = new Date((timestamp + timezone) * 1000);
        const lang = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
        return date.toLocaleTimeString(lang, {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getWindUnit = () => {
        return units === 'metric' ? t('km/h') : 'mph';
    };

    const getWindSpeed = (speed: number) => {
        if (units === 'imperial') {
            return Math.round(speed * 2.237);
        }
        return Math.round(speed * 3.6);
    };

    return (
        <div className={styles.forecastWrapper}>
            <div className={styles.forecastContainer}>
                <div className={styles.forecastHeader}>
                    <h2 className={styles.forecastTitle}>{t('3-Hour Forecast')}</h2>
                </div>
                <div className={styles.forecastList}>
                    {threeHourForecast.map((item, index) => {
                        const temperature = Math.round(item.main.temp);
                        const icon = item.weather[0]?.icon || '';
                        const description = item.weather[0]?.description || '';
                        const windSpeed = getWindSpeed(item.wind.speed);
                        const precipitation = Math.round(item.pop * 100);

                        return (
                            <div key={index} className={styles.forecastItem}>
                                <div className={styles.forecastTime}>
                                    {formatTime(item.dt, forecast.city.timezone)}
                                </div>
                                <div className={styles.forecastIcon}>
                                    <img 
                                        src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                                        alt={description}
                                        className={styles.weatherIcon}
                                    />
                                </div>
                                <div className={styles.forecastTemp}>
                                    {temperature}°
                                </div>
                                <div className={styles.forecastDetails}>
                                    <div className={styles.forecastWind}>
                                        💨 {windSpeed} {getWindUnit()}
                                    </div>
                                    {precipitation > 0 && (
                                        <div className={styles.forecastPrecip}>
                                            🌧️ {precipitation}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ThreeHourForecast;

