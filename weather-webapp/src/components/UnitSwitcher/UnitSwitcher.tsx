import { useState, useEffect } from 'react';
import styles from './UnitSwitcher.module.scss';
import { useTranslation } from 'react-i18next';

type Units = 'metric' | 'imperial';

const UnitSwitcher = () => {
    const { t } = useTranslation();
    const [units, setUnits] = useState<Units>(() => {
        const savedUnits = localStorage.getItem('weather-app-units') as Units;
        return savedUnits || 'metric';
    });

    useEffect(() => {
        localStorage.setItem('weather-app-units', units);
        window.dispatchEvent(new CustomEvent('unitsChanged', { detail: { units } }));
    }, [units]);

    const toggleUnits = () => {
        const newUnits = units === 'metric' ? 'imperial' : 'metric';
        setUnits(newUnits);
    };

    return (
        <div className={styles.unitSwitcherWrapper}>
            <button 
                className={styles.unitSwitcher}
                onClick={toggleUnits}
                aria-label={t('Toggle units')}
            >
                <div className={`${styles.switchTrack} ${units === 'metric' ? styles.metric : styles.imperial}`}>
                    <div className={`${styles.switchThumb} ${units === 'metric' ? styles.metric : styles.imperial}`}>
                        <span className={styles.unitSymbol}>
                            {units === 'metric' ? '°C' : '°F'}
                        </span>
                    </div>
                </div>
                <span className={styles.unitLabel}>
                    {units === 'metric' ? t('Celsius') : t('Fahrenheit')}
                </span>
            </button>
        </div>
    );
};

export default UnitSwitcher;

