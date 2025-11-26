import styles from './FiveDayForecast.module.scss';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import type { Forecast, ForecastItem } from '../../types/weather';
import { weatherApi } from '../../services/weatherService';
import useLocation from '../../hooks/useLocation';
import i18n from '../../shared/configs/i18n/i18n';
import DayDetailModal from '../DayDetailModal/DayDetailModal';
import Loader from '../Loader/Loader';
import ErrorPage from '../ErrorPage/ErrorPage';

const FiveDayForecast = () => {
    const { t } = useTranslation();
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { latitude, longitude } = useLocation();
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [selectedDay, setSelectedDay] = useState<{ item: ForecastItem; date: Date } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const savedCoords = localStorage.getItem('weather-app-coords');
        if (savedCoords) {
            try {
                const parsed = JSON.parse(savedCoords);
                setCoords({ lat: parsed.lat, lon: parsed.lon });
            } catch (e) {
                console.error('Ошибка парсинга координат:', e);
            }
        }
        
        if (!savedCoords && !latitude && !longitude) {
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
                    'metric',
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
    }, [coords, latitude, longitude]);

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
                                            'metric',
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

    const groupByDay = (forecastList: typeof forecast.list) => {
        const grouped: { 
            [key: string]: {
                items: typeof forecast.list;
                maxTemp: number;
                minTemp: number;
                icon: string;
                description: string;
            }
        } = {};
        
        forecastList.forEach((item) => {
            const date = new Date((item.dt + forecast.city.timezone) * 1000);
            const dayDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayKey = dayDate.toDateString();
            
            if (!grouped[dayKey]) {
                grouped[dayKey] = {
                    items: [item],
                    maxTemp: item.main.temp_max,
                    minTemp: item.main.temp_min,
                    icon: item.weather[0]?.icon || '',
                    description: item.weather[0]?.description || ''
                };
            } else {
                grouped[dayKey].items.push(item);
                grouped[dayKey].maxTemp = Math.max(grouped[dayKey].maxTemp, item.main.temp_max);
                grouped[dayKey].minTemp = Math.min(grouped[dayKey].minTemp, item.main.temp_min);
                const currentHour = date.getHours();
                if (Math.abs(currentHour - 12) < 6) {
                    grouped[dayKey].icon = item.weather[0]?.icon || grouped[dayKey].icon;
                    grouped[dayKey].description = item.weather[0]?.description || grouped[dayKey].description;
                }
            }
        });

        const now = new Date();
        const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayKey = todayLocal.toDateString();
        
        const sortedDays = Object.entries(grouped)
            .map(([dayKey, data]) => {
                const dayDate = new Date(dayKey);
                return { dayKey, dayDate, data };
            })
            .sort((a, b) => a.dayDate.getTime() - b.dayDate.getTime())
            .filter(({ dayKey }) => {
                return dayKey !== todayKey;
            })
            .slice(0, 5)
            .map(({ data }) => {
                const noonItem = data.items.find(item => {
                    const hour = new Date((item.dt + forecast.city.timezone) * 1000).getHours();
                    return hour >= 11 && hour <= 14;
                }) || data.items[Math.floor(data.items.length / 2)];

                return {
                    dt: noonItem.dt,
                    maxTemp: data.maxTemp,
                    minTemp: data.minTemp,
                    icon: data.icon || noonItem.weather[0]?.icon || '',
                    description: data.description || noonItem.weather[0]?.description || ''
                };
            });

        return sortedDays;
    };

    const dailyForecast = groupByDay(forecast.list);

    if (!dailyForecast || dailyForecast.length === 0) {
        return null;
    }

    const formatDay = (timestamp: number, timezone: number) => {
        const date = new Date((timestamp + timezone) * 1000);
        const lang = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const normalizeDate = (d: Date) => {
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };

        const normalizedDate = normalizeDate(date);
        const normalizedToday = normalizeDate(today);
        const normalizedTomorrow = normalizeDate(tomorrow);

        if (normalizedDate.getTime() === normalizedToday.getTime()) {
            return t('Today');
        }
        if (normalizedDate.getTime() === normalizedTomorrow.getTime()) {
            return t('Tomorrow');
        }

        return date.toLocaleDateString(lang, {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const handleDayClick = (_dayData: typeof dailyForecast[0], dayDate: Date) => {
        const dayKey = dayDate.toDateString();
        const dayItems = forecast.list.filter(item => {
            const date = new Date((item.dt + forecast.city.timezone) * 1000);
            const itemDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            return itemDate.toDateString() === dayKey;
        });

        if (dayItems.length > 0) {
            const noonItem = dayItems.find(item => {
                const hour = new Date((item.dt + forecast.city.timezone) * 1000).getHours();
                return hour >= 11 && hour <= 14;
            }) || dayItems[Math.floor(dayItems.length / 2)];

            setSelectedDay({ item: noonItem, date: dayDate });
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <div className={styles.forecastWrapper}>
                <div className={styles.forecastContainer}>
                    <div className={styles.forecastHeader}>
                        <h2 className={styles.forecastTitle}>{t('5-Day Forecast')}</h2>
                        <div className={styles.forecastCity}>{forecast.city.name}, {forecast.city.country}</div>
                    </div>
                    <div className={styles.forecastList}>
                        {dailyForecast.map((item, index) => {
                            const maxTemp = Math.round(item.maxTemp);
                            const minTemp = Math.round(item.minTemp);
                            const dayName = formatDay(item.dt, forecast.city.timezone);
                            const dayDate = new Date((item.dt + forecast.city.timezone) * 1000);
                            const normalizedDate = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate());

                            return (
                                <div 
                                    key={index} 
                                    className={styles.forecastItem}
                                    onClick={() => handleDayClick(item, normalizedDate)}
                                >
                                    <div className={styles.forecastDay}>{dayName}</div>
                                    <div className={styles.forecastIcon}>
                                        <img 
                                            src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                                            alt={item.description}
                                            className={styles.weatherIcon}
                                        />
                                    </div>
                                    <div className={styles.forecastTemps}>
                                        <span className={styles.maxTemp}>{maxTemp}°</span>
                                        <span className={styles.minTemp}>{minTemp}°</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {selectedDay && (
                <DayDetailModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedDay(null);
                    }}
                    dayData={selectedDay.item}
                    timezone={forecast.city.timezone}
                    date={selectedDay.date}
                />
            )}
        </>
    );
};

export default FiveDayForecast;

