import React from "react";

export type CityItemProps = {
    id: number;
    name: string;
    isSelected: boolean;
    onSelect: (id: number) => void;
};


export const CityItem = React.memo(({ id, name, isSelected, onSelect }: CityItemProps) => {
    return (
        <li
            onClick={() => onSelect(id)}
            style={{
                padding: "8px",
                marginBottom: "4px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                cursor: "pointer",
                backgroundColor: isSelected ? "#eef" : "transparent",
                fontWeight: isSelected ? "bold" : "normal",
            }}
        >
            {name}
        </li>
    );
});

