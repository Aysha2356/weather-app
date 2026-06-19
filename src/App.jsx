import { useCallback, useEffect, useState } from "react";
import "./App.css";

import clearsun from "./assets/clearsun.png";
import cloudy from "./assets/cloudy.png";
import drizzle from "./assets/drizzle.png";
import rain from "./assets/rain.png";
import snow from "./assets/snow.png";
import humidityIcon from "./assets/humidity.png";
import windIcon from "./assets/wind.png";
import searchIcon from "./assets/search.png";

const iconFor = (code) => {
  if (code === 0) return clearsun;
  if (code <= 48) return cloudy;
  if (code <= 57) return drizzle;
  if (code <= 67) return rain;
  if (code <= 77) return snow;
  if (code <= 82) return rain;
  if (code <= 86) return snow;
  return cloudy;
};

async function fetchWeather(city) {
  const geo = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  ).then((r) => r.json());
  if (!geo.results?.length) throw new Error("City not found");
  const { latitude, longitude, name, country_code } = geo.results[0];
  const w = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`
  ).then((r) => r.json());
  return {
    city: name,
    country: country_code,
    temp: Math.round(w.current.temperature_2m),
    humidity: w.current.relative_humidity_2m,
    wind: w.current.wind_speed_10m,
    lat: latitude,
    lon: longitude,
    code: w.current.weather_code,
  };
}

export default function App() {
  const [query, setQuery] = useState("Salem");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (city) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchWeather(city));
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load("Salem");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [load]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      void load(query.trim());
    }
  };

  return (
    <div className="card">
      <form className="search" onSubmit={onSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter city"
        />
        <button type="submit" aria-label="Search">
          <img src={searchIcon} alt="search" />
        </button>
      </form>

      {loading && <p className="message">Loading…</p>}
      {error && <p className="message error">{error}</p>}

      {data && !loading && (
        <>
          <img className="weather-icon" src={iconFor(data.code)} alt="weather" />
          <p className="temp">{data.temp}°C</p>
          <h1 className="city">{data.city}</h1>
          <p className="country">{data.country}</p>

          <div className="coords">
            <p>
              latitude
              <span>{data.lat.toFixed(2)}</span>
            </p>
            <p>
              longitude
              <span>{data.lon.toFixed(4)}</span>
            </p>
          </div>

          <div className="details">
            <div className="detail">
              <img src={humidityIcon} alt="humidity" />
              <p>{data.humidity}%</p>
              <span>Humidity</span>
            </div>
            <div className="detail">
              <img src={windIcon} alt="wind" />
              <p>{data.wind} km/h</p>
              <span>Wind Speed</span>
            </div>
          </div>
        </>
      )}

      <p className="footer">
        Designed by <b>Aysha Rakshana</b>
      </p>
    </div>
  );
}

