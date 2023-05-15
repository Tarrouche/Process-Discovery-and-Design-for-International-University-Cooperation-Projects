import React from "react";
import { Button } from 'react-bootstrap';

function TabButton({ name, isActive, onClick }) {
    return (
        <Button
            variant="secondary"
            className="mx-1"
            style={{
                borderBottomWidth: "0px",
                borderBottomLeftRadius: "0px",
                borderBottomRightRadius: "0px",
                borderColor: isActive ? "" : "var(--bs-modal-border-color)",
                backgroundColor: isActive ? "" : "white",
                color: isActive ? "" : "black"
            }}
            onClick={onClick}
        >
            {name}
        </Button>
    );
}


function TabButtons({ options, activeOption, onChange }) {
    return (
        <div>
            {options.map((option) => (
                <TabButton
                    key={option}
                    name={option}
                    isActive={activeOption === option}
                    onClick={() => onChange(option)}
                />
            ))}
        </div>
    );
}

export default TabButtons;