import React from "react";
import { Form } from 'react-bootstrap';

export default function EligiblePositions({ updProgram, setProgram, task }) {
    const handleCheckboxChange = (event) => {
        const { name } = event.target;

        if (Object.keys(updProgram.eligiblePositions).includes(name)) {
            setProgram(prevState => ({
                ...prevState,
                eligiblePositions: {
                    ...prevState.eligiblePositions,
                    [name]: !updProgram.eligiblePositions[name]
                }
            }));
        }
    }

    return (
        <>

            {updProgram.eligiblePositions &&
                <Form.Group controlId="formBasicPositions">
                    <h6 className="">Eligible positions</h6>
                    {Object.keys(updProgram.eligiblePositions).map((position) => (
                        <Form.Check
                            type="checkbox"
                            key={`${task}-${position}`}
                            label={position}
                            name={position}
                            checked={updProgram.eligiblePositions[position]}
                            onChange={handleCheckboxChange}
                        />
                    ))}

                </Form.Group>
            }

        </>
    );
}