import styles from './ErrorPage.module.scss';

interface ErrorPageProps {
    message: string;
    onRetry?: () => void;
}

const ErrorPage = ({ message, onRetry }: ErrorPageProps) => {
    return (
        <div className={styles.errorWrapper}>
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>
                    <svg 
                        width="80" 
                        height="80" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <h2 className={styles.errorTitle}>Ошибка</h2>
                <p className={styles.errorMessage}>{message}</p>
                {onRetry && (
                    <button 
                        className={styles.retryButton}
                        onClick={onRetry}
                    >
                        Попробовать снова
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorPage;

