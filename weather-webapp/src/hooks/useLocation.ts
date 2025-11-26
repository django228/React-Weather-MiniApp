import { useState } from 'react';

interface UseLocationReturn {
    latitude: number | null;
    longitude: number | null;
    error: string;
    isLoading: boolean;
    getLocation: () => void;
    getCityName: (lat: number, lon: number) => Promise<string | null>;
}

const CITY_STORAGE_KEY = 'weather-app-city';

const useLocation = (): UseLocationReturn => {
    const [location, setLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
        error: string;
        isLoading: boolean;
    }>({
        latitude: null,
        longitude: null,
        error: '',
        isLoading: false
    });

    const getCityName = async (lat: number, lon: number): Promise<string | null> => {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            const city = data.city || 
                        data.locality || 
                        data.principalSubdivision ||
                        null;
            
            if (city) {
                return city;
            }

            try {
                const nominatimResponse = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
                );
                
                if (nominatimResponse.ok) {
                    const nominatimData = await nominatimResponse.json();
                    const cityFromNominatim = nominatimData.address?.city || 
                                            nominatimData.address?.town || 
                                            nominatimData.address?.village || 
                                            nominatimData.address?.municipality ||
                                            nominatimData.address?.county ||
                                            nominatimData.name ||
                                            null;
                    if (cityFromNominatim) {
                        return cityFromNominatim;
                    }
                }
            } catch (nominatimError) {
                console.warn('Nominatim API недоступен:', nominatimError);
            }
            
            return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        } catch (error) {
            console.error('Ошибка получения названия города:', error);
            
            return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocation({
                latitude: null,
                longitude: null,
                error: 'Geolocation не поддерживается вашим браузером',
                isLoading: false
            });
            return;
        }

        setLocation(prev => ({ ...prev, isLoading: true, error: '' }));

        const successHandler = async (position: GeolocationPosition) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log('Геолокация:', { latitude: lat, longitude: lon });

            const cityName = await getCityName(lat, lon);

            if (cityName) {
                console.log('Название города:', cityName);
            }

            if (cityName) {
                localStorage.setItem(CITY_STORAGE_KEY, cityName);
                window.dispatchEvent(new Event('cityUpdated'));
            }
            
            setLocation({
                latitude: lat,
                longitude: lon,
                error: '',
                isLoading: false
            });
        };

        const errorHandler = (error: GeolocationPositionError) => {
            let errorMessage = '';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Доступ к местоположению запрещен';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Информация о местоположении недоступна';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Время запроса местоположения истекло';
                    break;
                default:
                    errorMessage = 'Произошла неизвестная ошибка';
                    break;
            }

            setLocation({
                latitude: null,
                longitude: null,
                error: errorMessage,
                isLoading: false
            });
        };

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        };

        navigator.geolocation.getCurrentPosition(
            successHandler,
            errorHandler,
            options
        );
    };

    return {
        latitude: location.latitude,
        longitude: location.longitude,
        error: location.error,
        isLoading: location.isLoading,
        getLocation,
        getCityName
    };
};

export default useLocation;