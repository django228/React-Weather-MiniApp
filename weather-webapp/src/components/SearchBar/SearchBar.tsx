import styles from "./SearchBar.module.scss";
import searchIcon from "../../assets/searchbar/searchbar-icon.svg";

const SearchBar = () => {
    return (
        <div className={styles.searchBarContainer}>
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
                placeholder="Search for a city..."
            />
        </div>
    );
};

export default SearchBar;