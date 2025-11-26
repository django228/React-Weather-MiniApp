import styles from './Loader.module.scss';

interface LoaderProps {
    message?: string;
}

const Loader = ({ message = 'Загрузка...' }: LoaderProps) => {
    return (
        <div className={styles.loaderWrapper}>
            <div className={styles.loaderContainer}>
                <div className={styles.loader}>
                    <div className={styles.spinner}>
                        <div className={styles.cloud}>
                            <div className={styles.cloudPart}></div>
                            <div className={styles.cloudPart}></div>
                            <div className={styles.cloudPart}></div>
                        </div>
                    </div>
                </div>
                <div className={styles.loaderMessage}>{message}</div>
            </div>
        </div>
    );
};

export default Loader;

