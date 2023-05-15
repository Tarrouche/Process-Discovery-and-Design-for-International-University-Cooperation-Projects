import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { faTimesCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Confirmation = ({ label, confirmation, setConfirmation, current }) => {

    return (
        <div className="row">
            <div className="col">
                <Form.Label>{label}</Form.Label>
            </div>
            <Form.Group className="col-3 text-center">
                <Button style={{ border: 'none', background: 'none', color: 'inherit' }}
                    onClick={() => {
                        if (current || current === undefined)
                            setConfirmation(false)
                    }
                    }>
                    <FontAwesomeIcon icon={faTimesCircle} className={confirmation === false ? "text-danger" : "text-secondary"} />
                </Button>

                <Button style={{ border: 'none', background: 'none', color: 'inherit' }}
                    onClick={() => {
                        if (current || current === undefined)
                            setConfirmation(true)
                    }
                    }>
                    <FontAwesomeIcon icon={faCheckCircle} className={confirmation ? "text-primary" : "text-secondary"} />
                </Button>
            </Form.Group>
        </div>
    );
};

export default Confirmation;
