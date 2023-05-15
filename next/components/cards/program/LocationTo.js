import React from "react";
import { Card, OverlayTrigger, Tooltip } from "react-bootstrap";

function LocationTo({ to }) {
    if (to && to.state === 'Partner Countries')
        return (
            <Card.Text className="mb-0 me-2">
                The program should run in one entity from the list of{' '}
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip>
                            <ul className="px-3" style={{ textAlign: 'left' }}>
                                {to.countries.map((country) => (
                                    <li key={country.country}>{country.country}</li>
                                ))}
                            </ul>
                        </Tooltip>
                    }
                >
                    <span className="text-muted" name="link">{to.state.toLowerCase()}</span>
                </OverlayTrigger>
                .
            </Card.Text>
        );
    else if (to && to.state === 'Participating Institutions')
        return (
            <Card.Text className="mb-0 me-2">
                The program should run in one entity from the list of {to.state.toLowerCase()}.
            </Card.Text>
        );
    else if (to && to.state === 'International')
        return (
            <Card.Text className="mb-0 me-2">
                The program can be ran in all countries, some conditions may apply to specific countries.
            </Card.Text>
        );
};

export default LocationTo;
