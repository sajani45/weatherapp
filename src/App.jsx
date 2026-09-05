import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unit, setUnit] = useState("C");

  const apiKey = import.meta.env.VITE_WEATHER_API_KEY;

  // Convert Celsius to Fahrenheit
  const convertTemperature = (temp) => {
    if (unit === "C") {
      return Math.round(temp);
    }

    return Math.round((temp * 9) / 5 + 32);
  };

  // Format sunrise and sunset time
  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get weather using city name
  const searchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setWeather(null);
      setForecast([]);

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );

      if (!weatherResponse.ok) {
        throw new Error("City not found");
      }

      const weatherData = await weatherResponse.json();

      setWeather(weatherData);

      await getForecast(city);
    } catch (err) {
      setError("City not found. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get 5-day forecast
  const getForecast = async (cityName) => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Forecast unavailable");
    }

    const data = await response.json();

    const dailyForecast = data.list.filter((item) =>
      item.dt_txt.includes("12:00:00")
    );

    setForecast(dailyForecast);
  };

  // Get weather using current location
  const getLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
          );

          if (!response.ok) {
            throw new Error("Unable to get weather");
          }

          const data = await response.json();

          setWeather(data);
          setCity(data.name);

          await getForecast(data.name);
        } catch (err) {
          setError("Unable to get weather for your location.");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);
        setError("Please allow location access to use this feature.");
      }
    );
  };

  return (
    <div
      className={`app ${
        darkMode ? "dark-mode" : ""
      } ${
        weather ? weather.weather[0].main.toLowerCase() : ""
      }`}
    >
      <div className="weather-container">

        <h1>Weather App 🌤️</h1>

        <button
          className="theme-button"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        <div className="unit-buttons">
          <button
            className={unit === "C" ? "active-unit" : ""}
            onClick={() => setUnit("C")}
          >
            °C
          </button>

          <button
            className={unit === "F" ? "active-unit" : ""}
            onClick={() => setUnit("F")}
          >
            °F
          </button>
        </div>

        <p>Check the weather in any city</p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchWeather();
              }
            }}
          />

          <button onClick={searchWeather}>
            Search
          </button>
        </div>

        <button
          className="location-button"
          onClick={getLocationWeather}
        >
          📍 Use My Location
        </button>
        {weather && (
  <button
    className="refresh-button"
    onClick={searchWeather}
  >
    🔄 Refresh Weather
  </button>
)}
        {loading && (
          <p className="loading">
            Loading weather...
          </p>
        )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {weather && (
          <div className="weather-result">

            <p className="current-date">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <h2>
              {weather.name}, {weather.sys.country}
            </h2>

            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />

            <h3>
              {convertTemperature(weather.main.temp)}°{unit}
            </h3>

            <p className="condition">
              {weather.weather[0].description}
            </p>

            <div className="weather-details">

              <div>
                💧
                <strong>
                  {weather.main.humidity}%
                </strong>
                <span>
                  Humidity
                </span>
              </div>

              <div>
                💨
                <strong>
                  {weather.wind.speed} m/s
                </strong>
                <span>
                  Wind Speed
                </span>
              </div>

              <div>
                🌡️
                <strong>
                  {convertTemperature(weather.main.feels_like)}°{unit}
                </strong>
                <span>
                  Feels Like
                </span>
              </div>

            </div>

            <div className="sun-details">

              <div>
                🌅
                <strong>
                  {formatTime(weather.sys.sunrise)}
                </strong>
                <span>
                  Sunrise
                </span>
              </div>

              <div>
                🌇
                <strong>
                  {formatTime(weather.sys.sunset)}
                </strong>
                <span>
                  Sunset
                </span>
              </div>

            </div>

          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast">

            <h2>
              5-Day Forecast 📅
            </h2>

            <div className="forecast-container">

              {forecast.map((day) => (
                <div
                  className="forecast-card"
                  key={day.dt}
                >

                  <h4>
                    {new Date(
                      day.dt * 1000
                    ).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </h4>

                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt={day.weather[0].description}
                  />

                  <h3>
                    {convertTemperature(day.main.temp)}°{unit}
                  </h3>

                  <p>
                    {day.weather[0].description}
                  </p>

                  <span>
                    💧 {day.main.humidity}%
                  </span>

                </div>
              ))}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default App;