import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../hooks";
import { convertTemperature, getWeatherIcon, getWindDirection } from "../utils/weather";
import type { WeatherData, ForecastResponse } from "../types/weather";


const API_KEY = '072eba17ce567996217eb4b084691c63';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

function RealTimeWeatherDisplay({ cityName }: { cityName: string }) {
  const unit = useAppSelector((state) => state.settings.unit);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!cityName) return;
      setIsLoading(true);
      setError(null);
      try {
        const url = `${BASE_URL}?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Nie znaleziono danych dla ${cityName}. Kod: ${response.status}`);
        }
        const data = await response.json();
        setWeatherData(data);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Wystąpił nieoczekiwany błąd");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [cityName]);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!cityName) return;

      try {
        const url = `${FORECAST_URL}?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Forecast error: ${res.status}`);
        const data = (await res.json()) as ForecastResponse;
        setForecastData(data);
      } catch (e) {
        console.error(e);
        setForecastData(null);
      }
    };

    fetchForecast();
  }, [cityName]);


  let precipitationType = "Brak opadów";
  let precipitationAmount = 0;
  let precipitationChance = 0;
  if (weatherData) {
    if (weatherData.rain && weatherData.rain["1h"] != null) {
      precipitationType = `Deszcz: (ostatnia godzina) ${weatherData.rain["1h"]} mm`;
      precipitationAmount = weatherData.rain["1h"]!;
      precipitationChance = Math.min(100, Math.round(precipitationAmount * 10));
    } else if (weatherData.rain && weatherData.rain["3h"] != null) {
      precipitationType = `Deszcz: (ostatnie 3 godziny) ${weatherData.rain["3h"]} mm`;
      precipitationAmount = weatherData.rain["3h"]!;
      precipitationChance = Math.min(100, Math.round(precipitationAmount * 10));
    } else if (weatherData.snow && weatherData.snow["1h"] != null) {
      precipitationType = `Śnieg: (ostatnia godzina) ${weatherData.snow["1h"]} mm`;
      precipitationAmount = weatherData.snow["1h"]!;
      precipitationChance = Math.min(100, Math.round(precipitationAmount * 10));
    } else if (weatherData.snow && weatherData.snow["3h"] != null) {
      precipitationType = `Śnieg: (ostatnie 3 godziny) ${weatherData.snow["3h"]} mm`;
      precipitationAmount = weatherData.snow["3h"]!;
      precipitationChance = Math.min(100, Math.round(precipitationAmount * 10));
    }
  }

  const precipitationChancePercent = useMemo(() => {
    if (!forecastData?.list?.length) return null;

    const first8 = forecastData.list.slice(0, 8);

    const maxPop = first8.reduce((max, item) => {
      const pop = item.pop ?? 0;
      return pop > max ? pop : max;
    }, 0);

    return Math.round(maxPop * 100);
  }, [forecastData]);


  return (
    <div style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "8px" }}>
      {isLoading && <p>Ładowanie danych pogodowych...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {weatherData && (
        <div>
          <p><strong>Temperatura:</strong> {" "} {convertTemperature(weatherData.main.temp, unit)}°{unit}</p>
          <p><strong>Warunki:</strong> {" "}{getWeatherIcon(weatherData.weather[0].main)}</p>
          <p><strong>Prędkość i kierunek wiatru:</strong>{" "} {weatherData.wind.speed} m/s, {" "} {getWindDirection(weatherData.wind.deg)}</p>
          <p><strong>Stopień zachmurzenia:</strong> {weatherData.clouds.all}%</p>
          <p><strong>Ciśnienie:</strong> {weatherData.main.pressure} hPa</p>
          <p><strong>Wilgotność:</strong> {weatherData.main.humidity}%</p>
          {precipitationChance === 0 ? (
            <p>
              <strong>Szansa opadów:</strong>{" "}
              {precipitationChancePercent == null ? "brak danych" : `${precipitationChancePercent}%`}
            </p>
          ) : (
            <div className="opadyBlock">
              <h3>Opady</h3>
              <ul style={{ listStyle: "disc", paddingLeft: "20px" }}>
                <li>Szansa: {precipitationChancePercent == null
                  ? "Brak danych"
                  : `${precipitationChancePercent}%`}</li>
                <li>Rodzaj: {precipitationType}</li>
                <li>Ilość: {precipitationAmount} mm</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { RealTimeWeatherDisplay };
