import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getCountries, getCities } from 'countries-cities';

const IEditModal = ({ institution, onEdit, countriesJSON }) => {
    const [show, setShow] = useState(false);
    const [updInstitution, setInstitution] = useState(institution);
    const countries = countriesJSON.map((obj) => obj.country);
    const urlRegex = /^https?:\/\/(?:[\w-]+\.)+([a-z]{2,})\/?/;

    function isValidLink(link) {
        return urlRegex.test(link);
    }

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
                <Button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
            ) : (
                <Button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                    <FontAwesomeIcon icon={faEdit} />
                </Button>
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

                        <Form.Group controlId="formBasicCountry" >
                            <Form.Label>Country</Form.Label>
                            <Form.Control as="select" name="country" value={updInstitution.country || 'Country'} onChange={handleInputChange}>
                                <option value="Country" disabled>Country?</option>
                                {countries.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="formBasicWebsite">
                            <h6 className="pt-3">Website</h6>
                            <Form.Control
                                type="text"
                                name="website"
                                placeholder="Enter website link"
                                value={updInstitution.website}
                                onChange={handleInputChange}
                                isValid={isValidLink(updInstitution.website)}
                                isInvalid={!isValidLink(updInstitution.website)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid link. (HTTP/HTTPS)
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="formBasicLogo">
                            <h6 className="pt-3">Logo</h6>
                            <Form.Control
                                type="text"
                                name="logo"
                                placeholder="Enter logo link"
                                value={updInstitution.logo}
                                onChange={handleInputChange}
                                isValid={isValidLink(updInstitution.logo)}
                                isInvalid={!isValidLink(updInstitution.logo)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please enter a valid link. (HTTP/HTTPS)
                            </Form.Control.Feedback>
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
