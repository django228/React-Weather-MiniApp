import styles from './DayDetailModal.module.scss';
import { useTranslation } from 'react-i18next';
import type { ForecastItem } from '../../types/weather';
import i18n from '../../shared/configs/i18n/i18n';
import WindIcon from '../../assets/metrics/wind-icon.svg';
import HumidityIcon from '../../assets/metrics/humidity-icon.svg';
import PressureIcon from '../../assets/metrics/pressure-icon.svg';
import VisibilityIcon from '../../assets/metrics/visibility-icon.svg';

interface DayDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    dayData: ForecastItem | null;
    timezone: number;
    date: Date;
}

const DayDetailModal = ({ isOpen, onClose, dayData, timezone }: DayDetailModalProps) => {
    const { t } = useTranslation();

    if (!isOpen || !dayData) {
        return null;
    }

    const formatDate = (timestamp: number, timezone: number) => {
        const date = new Date((timestamp + timezone) * 1000);
        const lang = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
        return date.toLocaleDateString(lang, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (timestamp: number, timezone: number) => {
        const date = new Date((timestamp + timezone) * 1000);
        const lang = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
        return date.toLocaleTimeString(lang, {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const weatherIcon = dayData.weather[0]?.icon;
    const temperature = Math.round(dayData.main.temp);
    const feelsLike = Math.round(dayData.main.feels_like);
    const condition = dayData.weather[0]?.description || '';
    const windSpeed = Math.round(dayData.wind.speed * 3.6);
    const humidity = dayData.main.humidity;
    const pressure = dayData.main.pressure;
    const visibility = dayData.visibility 
        ? Math.round(dayData.visibility / 1000) 
        : null;
    const cloudiness = dayData.clouds.all;
    const precipitation = Math.round(dayData.pop * 100);

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>×</button>
                
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{formatDate(dayData.dt, timezone)}</h2>
                    <div className={styles.modalTime}>{formatTime(dayData.dt, timezone)}</div>
                </div>

                <div className={styles.modalMainInfo}>
                    <div className={styles.modalTemperature}>
                        <div className={styles.tempValue}>{temperature}°</div>
                        <div className={styles.feelsLike}>{t('Feels like')} {feelsLike}°</div>
                    </div>
                    <div className={styles.modalIcon}>
                        <img 
                            src={`https://openweathermap.org/img/wn/${weatherIcon}@2x.png`}
                            alt={condition}
                            className={styles.weatherIcon}
                        />
                        <div className={styles.modalCondition}>{condition}</div>
                    </div>
                </div>

                <div className={styles.modalMetrics}>
                    <div className={styles.metricCard}>
                        <img src={WindIcon} alt="Wind" className={styles.metricIcon} />
                        <div className={styles.metricInfo}>
                            <div className={styles.metricLabel}>{t('Wind')}</div>
                            <div className={styles.metricValue}>{windSpeed} {t('km/h')}</div>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <img src={HumidityIcon} alt="Humidity" className={styles.metricIcon} />
                        <div className={styles.metricInfo}>
                            <div className={styles.metricLabel}>{t('Humidity')}</div>
                            <div className={styles.metricValue}>{humidity}%</div>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <img src={PressureIcon} alt="Pressure" className={styles.metricIcon} />
                        <div className={styles.metricInfo}>
                            <div className={styles.metricLabel}>{t('Pressure')}</div>
                            <div className={styles.metricValue}>{pressure} {t('mb')}</div>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <img src={VisibilityIcon} alt="Visibility" className={styles.metricIcon} />
                        <div className={styles.metricInfo}>
                            <div className={styles.metricLabel}>{t('Visibility')}</div>
                            <div className={styles.metricValue}>
                                {visibility !== null ? `${visibility} ${t('km')}` : 'N/A'}
                            </div>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon}>☁️</div>
                        <div className={styles.metricInfo}>
                            <div className={styles.metricLabel}>{t('Cloudiness')}</div>
                            <div className={styles.metricValue}>{cloudiness}%</div>
                        </div>
                    </div>
                    <div className={styles.metricCard}>
                        <div className={styles.metricIcon}>🌧️</div>
                        <div className={styles.metricInfo}>
                            <div className={styles.metricLabel}>{t('Precipitation')}</div>
                            <div className={styles.metricValue}>{precipitation}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DayDetailModal;

