import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../hooks";
import type { TemperatureUnit } from "../store";

type ForecastResponse = {
  list: {
    dt_txt: string; 
    main: { temp: number };
    weather: { main: string }[];
    pop?: number;
    rain?: { "3h"?: number };
    snow?: { "3h"?: number };
  }[];
};

type DailyForecast = {
  date: string;       
  label: string;        
  minTempC: number;
  maxTempC: number;
  avgTempC: number;
  conditionMain: string; 
  popMax: number;        
};

const API_KEY = "072eba17ce567996217eb4b084691c63";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

function getWeatherIcon(main: string) {
  switch (main.toLowerCase()) {
    case "clear":
      return "☀️";
    case "clouds":
      return "☁️";
    case "rain":
      return "🌧️";
    case "drizzle":
      return "🌦️";
    case "thunderstorm":
      return "⛈️";
    case "snow":
      return "🌨️";
    case "mist":
    case "fog":
      return "🌫️";
    default:
      return "🌡️";
  }
}

function convertTemperature(tempC: number, unit: TemperatureUnit): number {
  switch (unit) {
    case "C":
      return Math.round(tempC);
    case "F":
      return Math.round((tempC * 9) / 5 + 32);
    case "K":
      return Math.round(tempC + 273.15);
    default:
      return Math.round(tempC);
  }
}

function dayLabelFromDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const labels = ["Nd", "Pn", "Wt", "Śr", "Czw", "Pt", "Sb"];
  return labels[d.getDay()];
}

function mode(items: string[]) {
  const counts: Record<string, number> = {};
  for (const x of items) counts[x] = (counts[x] ?? 0) + 1;

  let best = items[0] ?? "Clouds";
  let bestCount = -1;

  for (const key of Object.keys(counts)) {
    if (counts[key] > bestCount) {
      best = key;
      bestCount = counts[key];
    }
  }
  return best;
}

export function Forecast5DaysDisplay({ cityName }: { cityName: string }) {
  const unit = useAppSelector((state) => state.settings.unit);

  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForecast = async () => {
      if (!cityName) return;

      setIsLoading(true);
      setError(null);

      try {
        const url = `${FORECAST_URL}?q=${cityName}&appid=${API_KEY}&units=metric&lang=pl`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Forecast error: ${res.status}`);
        const data = (await res.json()) as ForecastResponse;
        setForecastData(data);
      } catch (e) {
        setForecastData(null);
        setError(e instanceof Error ? e.message : "Błąd prognozy");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForecast();
  }, [cityName]);

  const dailyForecast = useMemo<DailyForecast[]>(() => {
    if (!forecastData?.list?.length) return [];

    const groups: Record<string, ForecastResponse["list"]> = {};

    for (const item of forecastData.list) {
      const date = item.dt_txt.split(" ")[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    }

    const days = Object.keys(groups)
      .sort()
      .map((date) => {
        const items = groups[date];

        const temps = items.map((x) => x.main.temp);
        const minTempC = Math.min(...temps);
        const maxTempC = Math.max(...temps);
        const avgTempC = temps.reduce((a, b) => a + b, 0) / temps.length;

        const conditionMain = mode(items.map((x) => x.weather?.[0]?.main ?? "Clouds"));

        const popMax01 = items.reduce((m, x) => Math.max(m, x.pop ?? 0), 0);
        const popMax = Math.round(popMax01 * 100);

        return {
          date,
          label: dayLabelFromDate(date),
          minTempC,
          maxTempC,
          avgTempC,
          conditionMain,
          popMax,
        };
      });

    return days.slice(0, 5);
  }, [forecastData]);

  if (isLoading) return <p>Ładowanie prognozy 5 dni...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!dailyForecast.length) return <p>Brak prognozy 5 dni.</p>;

  return (
    <div style={{ marginTop: "16px" }}>
      <h3>Prognoza na 5 dni</h3>

      <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
        {dailyForecast.map((d) => (
          <div
            key={d.date}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "10px",
              width: "20%",
              textAlign: "center",
            }}
          >
            <strong>{d.label}</strong>
            <div style={{ fontSize: "20px", marginTop: "6px" }}>{getWeatherIcon(d.conditionMain)}</div>
            <div style={{ marginTop: "6px" }}>
              <div>min: {convertTemperature(d.minTempC, unit)}°{unit}</div>
              <div>max: {convertTemperature(d.maxTempC, unit)}°{unit}</div>
              <div style={{ opacity: 0.8 }}>avg: {convertTemperature(d.avgTempC, unit)}°{unit}</div>
            </div>
            <div style={{ marginTop: "6px", fontSize: "18px", opacity: 0.9 }}>
              opady: {d.popMax}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
