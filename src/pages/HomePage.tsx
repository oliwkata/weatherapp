import { useMemo, useReducer } from "react";
import { useAppDispatch, useAppSelector } from "../hooks";
import { toggleFavorite } from "../store";
import "../App.css";
import { useNavigate } from "react-router-dom";



type City = { id: number; name: string };

const cities: City[] = [
    { id: 1, name: "Wrocław" },
    { id: 2, name: "Szczerców" },
    { id: 3, name: "Gdańsk" },
    { id: 4, name: "Łódź" },
    { id: 5, name: "Poznań" },
    { id: 6, name: "Warszawa" },
    { id: 7, name: "Kraków" },
    { id: 8, name: "Bełchatów" },
    { id: 9, name: "New York" },
    { id: 10, name: "Wola Wiązowa" },
    { id: 11, name: "Rusiec" },
];


type HomeState = { query: string };
type HomeAction =
    | { type: "setQuery"; value: string }
    | { type: "clearQuery" };

function homeReducer(state: HomeState, action: HomeAction): HomeState {
    switch (action.type) {
        case "setQuery":
            return { ...state, query: action.value };
        case "clearQuery":
            return { ...state, query: "" };
        default:
            return state;
    }
}

export function HomePage() {
    const [state, dispatchLocal] = useReducer(homeReducer, { query: "" });
    const Navigate = useNavigate();
    const favorites = useAppSelector((s) => s.favorites.cityIds);
    const dispatch = useAppDispatch();

    const filteredCities = useMemo(() => {
        const q = state.query.trim().toLowerCase();
        if (!q) return cities;
        return cities.filter((c) => c.name.toLowerCase().startsWith(q));
    }, [state.query]);

    return (
        <div className="page">
            <div className="pageInner">
                <div className="header">
                    <h1 className="title">Weather App</h1>
                    <p className="subtitle">Kliknij miasto, aby poznać szczegóły.</p>
                </div>

                <div className="card">
                    <h2 className="cardTitle">Wybierz miasto</h2>

                    <div className="searchRow">
                        <input
                            value={state.query}
                            onChange={(e) => dispatchLocal({ type: "setQuery", value: e.target.value })}
                            placeholder="Szukaj miasta..."
                        />

                        {state.query.trim() !== "" && (
                            <button
                                type="button"
                                className="clearBtn"
                                onClick={() => dispatchLocal({ type: "clearQuery" })}
                            >
                                Wyczyść
                            </button>
                        )}
                    </div>

                    <div className="cityList">
                        {filteredCities.map((city) => {
                            const isFavorite = favorites.includes(city.id);

                            return (
                                <div
                                    key={city.id}
                                    className="cityRow"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => Navigate(`/city/${encodeURIComponent(city.name)}`)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            Navigate(`/city/${encodeURIComponent(city.name)}`);
                                        }
                                    }}
                                >
                                    <span className="cityName">{city.name}</span>
                                    <button
                                        type="button"
                                        className="favBtn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            dispatch(toggleFavorite(city.id));
                                        }}
                                        aria-label="toggle favorite"
                                        title="Ulubione"
                                    >
                                        {isFavorite ? "★" : "☆"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
