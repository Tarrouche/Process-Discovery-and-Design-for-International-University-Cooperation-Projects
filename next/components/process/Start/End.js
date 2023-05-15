import React from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faForward } from '@fortawesome/free-solid-svg-icons';

const EndProgram = ({ end }) => {
    return (
        <div className="row">
            <div className="col">
                <Form.Label>End the program manually</Form.Label>
            </div>
            <Form.Group className="col-3 text-center">
                <Button
                    style={{ border: 'none', background: 'none', color: 'inherit' }}
                    onClick={end}
                >
                    <FontAwesomeIcon icon={faForward} className={"text-secondary"} />
                </Button>
            </Form.Group>
        </div>
    );
};

export default EndProgram;
