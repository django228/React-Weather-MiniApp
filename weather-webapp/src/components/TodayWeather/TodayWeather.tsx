import styles from './TodayWeather.module.scss';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import type { CurrentWeather } from '../../types/weather';
import { weatherApi } from '../../services/weatherService';
import useLocation from '../../hooks/useLocation';
import i18n from '../../shared/configs/i18n/i18n';
import Loader from '../Loader/Loader';
import ErrorPage from '../ErrorPage/ErrorPage';

import WindIcon from '../../assets/metrics/wind-icon.svg';
import HumidityIcon from '../../assets/metrics/humidity-icon.svg';
import PressureIcon from '../../assets/metrics/pressure-icon.svg';
import VisibilityIcon from '../../assets/metrics/visibility-icon.svg';

const TodayWeather = () => {
    const { t } = useTranslation();
    const [weather, setWeather] = useState<CurrentWeather | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { latitude, longitude, getLocation } = useLocation();
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [units, setUnits] = useState<'metric' | 'imperial'>(() => {
        const saved = localStorage.getItem('weather-app-units') as 'metric' | 'imperial' | null;
        return saved || 'metric';
    });

    useEffect(() => {
        const savedCoords = localStorage.getItem('weather-app-coords');
        if (savedCoords) {
            try {
                const parsed = JSON.parse(savedCoords);
                setCoords({ lat: parsed.lat, lon: parsed.lon });
            } catch (e) {
                console.error('Ошибка парсинга координат:', e);
            }
        } else if (!latitude || !longitude) {
            getLocation();
        }
    }, []);

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

        const handleUnitsChange = () => {
            const saved = localStorage.getItem('weather-app-units') as 'metric' | 'imperial' | null;
            if (saved) {
                setUnits(saved);
            }
        };

        window.addEventListener('cityUpdated', handleCityUpdate);
        window.addEventListener('unitsChanged', handleUnitsChange);
        return () => {
            window.removeEventListener('cityUpdated', handleCityUpdate);
            window.removeEventListener('unitsChanged', handleUnitsChange);
        };
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            const lat = coords?.lat || latitude;
            const lon = coords?.lon || longitude;

            if (!lat || !lon) {
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const lang = i18n.language === 'ru' ? 'ru' : 'en';
                const currentWeather = await weatherApi.getCurrentWeather(
                    lat,
                    lon,
                    units,
                    lang
                );
                setWeather(currentWeather);
                localStorage.setItem('weather-app-current-weather', JSON.stringify(currentWeather));
                window.dispatchEvent(new CustomEvent('weatherUpdated', { 
                    detail: { weather: currentWeather } 
                }));
            } catch (err) {
                console.error('Ошибка получения погоды:', err);
                setError(err instanceof Error ? err.message : 'Не удалось загрузить данные о погоде');
            } finally {
                setIsLoading(false);
            }
        };

        if (coords || (latitude && longitude)) {
            fetchWeather();
        }
    }, [coords, latitude, longitude, units]);

    if (isLoading) {
        return (
            <div className={styles.todayWeatherWrapper}>
                <Loader message={t('Loading...') || 'Загрузка...'} />
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.todayWeatherWrapper}>
                <ErrorPage 
                    message={error} 
                    onRetry={() => {
                        if (coords || (latitude && longitude)) {
                            const lat = coords?.lat || latitude;
                            const lon = coords?.lon || longitude;
                            if (lat && lon) {
                                const fetchWeather = async () => {
                                    setIsLoading(true);
                                    setError(null);
                                    try {
                                        const lang = i18n.language === 'ru' ? 'ru' : 'en';
                                        const currentWeather = await weatherApi.getCurrentWeather(
                                            lat,
                                            lon,
                                            units,
                                            lang
                                        );
                                        setWeather(currentWeather);
                                    } catch (err) {
                                        setError(err instanceof Error ? err.message : 'Не удалось загрузить данные о погоде');
                                    } finally {
                                        setIsLoading(false);
                                    }
                                };
                                fetchWeather();
                            }
                        }
                    }}
                />
            </div>
        );
    }

    if (!weather) {
        return null;
    }

    const weatherIcon = weather.weather[0]?.icon;
    const temperature = Math.round(weather.main.temp);
    const condition = weather.weather[0]?.description || '';
    const getWindSpeed = () => {
        if (units === 'imperial') {
            return Math.round(weather.wind.speed * 2.237);
        }
        return Math.round(weather.wind.speed * 3.6);
    };
    const windSpeed = getWindSpeed();
    const getWindUnit = () => {
        return units === 'metric' ? t('km/h') : 'mph';
    };
    const humidity = weather.main.humidity;
    const pressure = weather.main.pressure;
    const getVisibility = () => {
        if (!weather.visibility) return null;
        if (units === 'imperial') {
            return Math.round(weather.visibility / 1609.34);
        }
        return Math.round(weather.visibility / 1000);
    };
    const visibility = getVisibility();
    const getVisibilityUnit = () => {
        return units === 'metric' ? t('km') : 'mi';
    };

    const formatDate = (timestamp: number, timezone: number) => {
        const date = new Date((timestamp + timezone) * 1000);
        const lang = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
        return date.toLocaleDateString(lang, {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const currentDate = formatDate(weather.dt, weather.timezone);

    return (
        <div className={styles.todayWeatherWrapper}>
            <div className={styles.todayWeatherContainer}>
                <div className={styles.dateSection}>
                    <div className={styles.date}>{currentDate}</div>
                </div>
                <div className={styles.todayWeatherHeader}>
                    <div className={styles.temperatureSection}>
                        <div className={styles.temperature}>{temperature}°</div>
                        <div className={styles.condition}>{condition}</div>
                    </div>
                    <div className={styles.iconSection}>
                        <img 
                            src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`}
                            alt={condition}
                            className={styles.weatherIcon}
                        />
                    </div>
                </div>
                <div className={styles.todayWeatherContent}>
                    <div className={styles.metricCard}>
                        <img src={WindIcon} alt="Wind" className={styles.metricIcon} />
                        <div className={styles.metricLabel}>{t('Wind')}</div>
                        <div className={styles.metricValue}>{windSpeed} {getWindUnit()}</div>
                    </div>
                    <div className={styles.metricCard}>
                        <img src={HumidityIcon} alt="Humidity" className={styles.metricIcon} />
                        <div className={styles.metricLabel}>{t('Humidity')}</div>
                        <div className={styles.metricValue}>{humidity}%</div>
                    </div>
                    <div className={styles.metricCard}>
                        <img src={PressureIcon} alt="Pressure" className={styles.metricIcon} />
                        <div className={styles.metricLabel}>{t('Pressure')}</div>
                        <div className={styles.metricValue}>{pressure} {t('mb')}</div>
                    </div>
                    <div className={styles.metricCard}>
                        <img src={VisibilityIcon} alt="Visibility" className={styles.metricIcon} />
                        <div className={styles.metricLabel}>{t('Visibility')}</div>
                        <div className={styles.metricValue}>
                            {visibility !== null ? `${visibility} ${getVisibilityUnit()}` : 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TodayWeather;