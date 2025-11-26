import SearchBar from "../SearchBar/SearchBar.tsx";
import LocationBadge from "../LocationBadge/LocationBadge.tsx";
import styles from "./HeaderBar.module.scss"
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher.tsx";

const HeaderBar = () => {
    return (
        <div className={styles.HeaderBar}>
            <SearchBar />
            <LocationBadge />
            <LanguageSwitcher />
        </div>
    );
};

export default HeaderBar;