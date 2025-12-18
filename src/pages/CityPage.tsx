import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import type { TemperatureUnit } from "../store";
import { setUnit } from "../store";
import { Forecast5DaysDisplay } from "../components/Forecast5DaysDisplay";
import { RealTimeWeatherDisplay } from "../components/RealTimeWeatherDisplay";


export function CityPage() {
  const params = useParams<{ cityName: string }>();
  const cityName = params.cityName ? decodeURIComponent(params.cityName) : "";

  const dispatch = useAppDispatch();
  const unit = useAppSelector((state) => state.settings.unit);

  return (
    <div className="page">
      <div className="pageInner">
        <div className="header">
          <h1 className="title">Weather App</h1>
          <p className="subtitle">Szczegóły: {cityName}</p>
        </div>

        <div className="card">
          <div className="selectRow">
            <label htmlFor="temp-unit-select">
              Wybierz jednostkę temperatury:
            </label>
            <select
              id="temp-unit-select"
              value={unit}
              onChange={(e) =>
                dispatch(setUnit(e.target.value as TemperatureUnit))
              }
            >
              <option value="C">Celsius (°C)</option>
              <option value="F">Fahrenheit (°F)</option>
              <option value="K">Kelvin (K)</option>
            </select>
          </div>

          <div className="panel">
            <RealTimeWeatherDisplay cityName={cityName} />
          </div>

          <div className="panel">
            <Forecast5DaysDisplay cityName={cityName} />
          </div>

          <Link to="/" className="backLink">
            ← Powrót do listy miast
          </Link>
        </div>
      </div>
    </div>
  );
}
