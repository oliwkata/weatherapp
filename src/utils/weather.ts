import type { TemperatureUnit } from "../store";


export const getWeatherIcon = (main: string) => {
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
};

export function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
}

export function convertTemperature(tempC: number, unit: TemperatureUnit): number {
  switch (unit) {
    case "C":
      return Math.round(tempC);
    case "F":
      return Math.round(tempC * 9 / 5 + 32);
    case "K":
      return Math.round(tempC + 273.15);
    default:
      return tempC;
  }
}
