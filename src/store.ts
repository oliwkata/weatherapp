import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export type TemperatureUnit = "C" | "F" | "K";
type FavoritesState = {
    cityIds: number[];
};

const initialFavoritesState: FavoritesState = {
    cityIds: [],
};

const favoritesSlice = createSlice({
    name: "favorites",
    initialState: initialFavoritesState,
    reducers: {
        toggleFavorite(state, action: PayloadAction<number>) {
            const id = action.payload;
            const exists = state.cityIds.includes(id);

            if (exists) {
                state.cityIds = state.cityIds.filter((x) => x !== id);
            } else {
                state.cityIds.push(id);
            }
        },
    },
});

export const { toggleFavorite } = favoritesSlice.actions;

interface SettingsState {
    unit: TemperatureUnit;
}

const initialState: SettingsState = {
    unit: "C",
};

const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setUnit(state, action: PayloadAction<TemperatureUnit>) {
            state.unit = action.payload;
        },
    },
});

const STORAGE_KEY = "weatherAppState_v1";

type PersistedState = {
    settings: {
        unit: "C" | "F" | "K";
    };
    favorites: {
        cityIds: number[];
    };
};

function loadState(): PersistedState | undefined {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return undefined;
        return JSON.parse(raw) as PersistedState;
    } catch {
        return undefined;
    }
}

function saveState(state: PersistedState) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
    }
}

export const { setUnit } = settingsSlice.actions;

export const store = configureStore({
    reducer: {
        settings: settingsSlice.reducer,
        favorites: favoritesSlice.reducer,
    },
    preloadedState: loadState(),
});

store.subscribe(() => {
    const state = store.getState();
    
    saveState({
        settings: {
            unit: state.settings.unit,
        },
        favorites: {
            cityIds: state.favorites.cityIds,
        },
    });
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


