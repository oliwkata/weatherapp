export type WeatherData = {
  main: {
    temp: number;
    pressure: number;
    humidity: number;
  };
  weather: {
    main: string;
    description: string;
  }[];
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  rain: {
    "1h"?: number;
    "3h"?: number;
  };
  snow: {
    "1h"?: number;
    "3h"?: number;
  };
};

export type ForecastResponse = {
  list: {
    pop?: number;
  }[];
};