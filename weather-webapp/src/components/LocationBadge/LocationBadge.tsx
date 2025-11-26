import styles from "./LocationBadge.module.scss";
import locationBadgeIcon from "../../assets/location-badge/location-badge-icon.svg"
import useLocation from "../../hooks/useLocation";

const LocationBadge = () => {
    const { getLocation, error, isLoading } = useLocation();

    const handleClick = () => {
        getLocation();
        if (error) {
            console.error(error);
        }
    };

    return (
        <div className={styles.locationBadgeContainer}>
            <div className={styles.locationBadge}>
                <img
                    className={styles.locationBadgeIcon}
                    src={locationBadgeIcon}
                    onClick={handleClick}
                    style={{ cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
                    width="20"
                    height="20"
                    alt="Location icon"
                />
            </div>
        </div>
    );
};

export default LocationBadge;