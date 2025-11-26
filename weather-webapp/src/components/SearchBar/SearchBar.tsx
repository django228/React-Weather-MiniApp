import { useState, useEffect, useRef } from "react";
import styles from "./SearchBar.module.scss";
import searchIcon from "../../assets/searchbar/searchbar-icon.svg";
import { useTranslation } from "react-i18next";
import { weatherApi } from "../../services/weatherService";
import type { City } from "../../types/weather";

const CITY_STORAGE_KEY = 'weather-app-city';

const SearchBar = () => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState(() => {
        return localStorage.getItem(CITY_STORAGE_KEY) || '';
    });
    const [suggestions, setSuggestions] = useState<City[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleCityUpdate = () => {
            const city = localStorage.getItem(CITY_STORAGE_KEY);
            if (city) {
                setInputValue(city);
            }
        };

        window.addEventListener('cityUpdated', handleCityUpdate);

        const storedCity = localStorage.getItem(CITY_STORAGE_KEY);
        if (storedCity) {
            setInputValue(storedCity);
        }

        return () => {
            window.removeEventListener('cityUpdated', handleCityUpdate);
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (query.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        try {
            const cities = await weatherApi.searchCities(query);
            setSuggestions(cities);
            setShowSuggestions(cities.length > 0);
        } catch (err) {
            console.error('Ошибка поиска городов:', err);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSelectCity = (city: City) => {
        const cityName = `${city.name}, ${city.country}`;
        setInputValue(cityName);
        setShowSuggestions(false);
        setSuggestions([]);
        localStorage.setItem(CITY_STORAGE_KEY, cityName);
        
        localStorage.setItem('weather-app-coords', JSON.stringify({ lat: city.lat, lon: city.lon }));
        
        window.dispatchEvent(new CustomEvent('cityUpdated', { 
            detail: { city: cityName, lat: city.lat, lon: city.lon } 
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            if (suggestions.length > 0) {
                handleSelectCity(suggestions[0]);
            } else {
                localStorage.setItem(CITY_STORAGE_KEY, inputValue.trim());
                window.dispatchEvent(new Event('cityUpdated'));
            }
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleBlur = () => {
        setTimeout(() => {
            if (inputValue.trim()) {
                localStorage.setItem(CITY_STORAGE_KEY, inputValue.trim());
            }
        }, 200);
    };

    return (
        <div className={styles.searchBarContainer} ref={containerRef}>
            <img
                className={styles.searchBarIcon}
                src={searchIcon}
                width="12"
                height="12"
                alt="Search icon"
            />

            <input
                className={styles.searchBar}
                type="text"
                placeholder={t("Search for a city...")}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                onFocus={() => {
                    if (suggestions.length > 0) {
                        setShowSuggestions(true);
                    }
                }}
            />

            {showSuggestions && suggestions.length > 0 && (
                <div className={styles.suggestionsList}>
                    {suggestions.map((city, index) => (
                        <div
                            key={`${city.name}-${city.country}-${index}`}
                            className={styles.suggestionItem}
                            onClick={() => handleSelectCity(city)}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            <span className={styles.suggestionCity}>{city.name}</span>
                            <span className={styles.suggestionCountry}>
                                {city.country} {city.state ? `, ${city.state}` : ''}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {isLoading && (
                <div className={styles.loadingIndicator}>Поиск...</div>
            )}
        </div>
    );
};

export default SearchBar;