import React from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";

function LocationFrom({ from }) {
    if (from && from.state === "Partner Countries") {
        return (
            <Card.Text className="mb-0 me-2">
                Applicants should be from a country on the list of{" "}
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip>
                            <ul className="px-3" style={{ textAlign: "left" }}>
                                {from.countries.map((country) => (
                                    <li key={country.country}>{country.country}</li>
                                ))}
                            </ul>
                        </Tooltip>
                    }
                >
                    <span className="text-muted" name="link">
                        {from.state.toLowerCase()}
                    </span>
                </OverlayTrigger>
                .
            </Card.Text>
        );
    } else if (from && from.state === "Participating Institutions") {
        return (
            <Card.Text className="mb-0 me-2">
                Applicants should be from an institution on the list of{" "}
                {from.state.toLowerCase()}.
            </Card.Text>
        );
    } else if (from && from.state === "International") {
        return (
            <Card.Text className="mb-0 me-2">
                {from.state} applicants are accepted, some
                conditions may apply to specific countries.
            </Card.Text>
        );
    }
}

export default LocationFrom;
