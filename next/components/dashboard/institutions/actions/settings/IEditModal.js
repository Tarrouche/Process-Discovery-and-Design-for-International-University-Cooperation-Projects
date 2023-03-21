import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCountries, getCities } from 'countries-cities';

const IEditModal = ({ institution, onEdit }) => {
    const [show, setShow] = useState(false);
    const [updInstitution, setInstitution] = useState(institution);
    const countries = getCountries();
    const cities = updInstitution.country ? getCities(updInstitution.country) : [];

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function handleEdit() {
        // Make a POST request to the server to delete the user with the given ID
        // UPDATE
        // Close the modal if the delete request was successful
        onEdit(updInstitution.institutionId, updInstitution);
        setShow(false);


    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setInstitution((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };


    return (
        <>
            {!updInstitution.institutionId ? (
                <button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            ) : (
                <button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                    <FontAwesomeIcon icon={faEdit} />
                </button>
            )}

            <Modal size="lg" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    {!updInstitution.institutionId ? (
                        <Modal.Title> Create Institution</Modal.Title>
                    ) : (
                        <Modal.Title> Edit Institution</Modal.Title>
                    )}
                </Modal.Header>
                <Form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
                    <Modal.Body>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Enter name" value={updInstitution.name} onChange={handleInputChange} />
                        </Form.Group>
                        <div className="row">
                            <div className="col-6">
                                <Form.Group controlId="formBasicCountry" >
                                    <Form.Label>Country</Form.Label>
                                    <Form.Control as="select" name="country" value={updInstitution.country} onChange={handleInputChange}>
                                        <option key="unset" value="">Country</option>
                                        {countries.map((country) => (
                                            <option key={country} value={country}>
                                                {country}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </div>
                            <div className="col-6">
                                <Form.Group controlId="formBasicCity" >
                                    <Form.Label>City</Form.Label>
                                    <Form.Control as="select" name="city" value={updInstitution.city} onChange={handleInputChange}>
                                        <option key="unset" value="">City</option>
                                        {cities.map((city) => (
                                            <option key={city} value={city}>
                                                {city}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group controlId="formBasicLogo">
                            <Form.Label>Logo</Form.Label>
                            <Form.Control type="text" name="logo" placeholder="Enter logo link" value={updInstitution.logo} onChange={handleInputChange} />
                        </Form.Group>

                        <Form.Group controlId="formBasicWebsite">
                            <Form.Label>Website</Form.Label>
                            <Form.Control type="text" name="website" placeholder="Enter website link" value={updInstitution.website} onChange={handleInputChange} />
                        </Form.Group>

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};


export default IEditModal;
