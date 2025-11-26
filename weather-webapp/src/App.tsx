import backgroundVideo from './assets/main/main-mobile-bg.mp4';
import backgroundImage from './assets/main/bg-image.jpg';
import './App.css';
import HeaderBar from "./components/HeaderBar/HeaderBar.tsx";
import TodayWeather from "./components/TodayWeather/TodayWeather.tsx";
import FiveDayForecast from "./components/FiveDayForecast/FiveDayForecast.tsx";
import ThemeSwitcher from "./components/ThemeSwitcher/ThemeSwitcher.tsx";

function App() {
  return (
      <div className="app">
        <div className="video-background">
          <video autoPlay muted loop playsInline>
            <source src={backgroundVideo} type="video/mp4" />
                Your browser does not support the video tag.
          </video>
          <div className="image-background" style={{ backgroundImage: `url(${backgroundImage})` }}></div>
        </div>

        <div className="app-content">
            <HeaderBar />
            <TodayWeather />
            <FiveDayForecast />
        </div>
        
        <footer className="app-footer">
            <ThemeSwitcher />
        </footer>
      </div>
  );
}

export default App;