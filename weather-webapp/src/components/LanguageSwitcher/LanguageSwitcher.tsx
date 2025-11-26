import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.scss";

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    
    const changeLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en');
    };

    const languageClass = i18n.language === 'en' ? styles.langEn : styles.langRu;

    return (
        <div className={styles.languageSwitcherContainer}>
            <div className={`${styles.languageSwitcher} ${languageClass}`}>
                <button onClick={changeLanguage}>
                    {
                        i18n.language === 'en' ? 
                        (<span>RU</span>) 
                        : 
                        (<span>EN</span>)
                    }
                </button>
            </div>
        </div>
    );
};

export default LanguageSwitcher;