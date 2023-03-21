import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PEditModal = ({ program, onEdit }) => {
    const [show, setShow] = useState(false);
    const [updProgram, setProgram] = useState(program);
    const [editingFundingRequirements, setEditingFundingRequirements] = useState(false);
    const [editingFundingAllowances, setEditingFundingAllowances] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const editFundingReq = () => setEditingFundingRequirements(!editingFundingRequirements);
    const editFundingAll = () => setEditingFundingAllowances(!editingFundingAllowances);

    function handleEdit() {
        // Make a POST request to the server to edit the program
        onEdit(program.programId, updProgram);
        setShow(false);
    }

    const handleCheckboxChange = (event) => {
        const { name, value } = event.target;
        if (name === 'typeOfProgram') {
            if (updProgram.typeOfProgram.includes(value)) {
                // Remove value from array if it's already included
                setProgram((prevState) => ({
                    ...prevState,
                    [name]: prevState[name].filter((programType) => programType !== value),
                }));
            } else {
                // Add value to array if it's not already included
                setProgram((prevState) => ({
                    ...prevState,
                    [name]: [...prevState[name], value],
                }));
            }
        } else if (name === 'funded') {
            setProgram({
                ...updProgram,
                funded: {
                    ...updProgram.funded,
                    funded: !updProgram.funded.funded,
                },
            })
        }
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'fundingRequirements' && editFundingReq) {
            setProgram(prevState => ({
                ...prevState,
                funded: {
                    ...prevState.funded,
                    fundingRequirements: value.split('\n')
                }
            }));
        } else if (name === 'fundingAllowances' && editFundingAll) {
            setProgram(prevState => ({
                ...prevState,
                funded: {
                    ...prevState.funded,
                    fundingAllowances: value.split('\n')
                }
            }));
        } else {
            setProgram(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    return (
        <>
            {updProgram && !updProgram.programId ? (
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
                    {updProgram && !updProgram.programId ? (
                        <Modal.Title> Create Program</Modal.Title>
                    ) : (
                        <Modal.Title> Edit Program</Modal.Title>
                    )}
                </Modal.Header>
                <Form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
                    <Modal.Body>
                        <Form.Group controlId="formBasicName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" name="name" placeholder="Enter name" value={updProgram.name} onChange={handleInputChange} />
                        </Form.Group>

                        <Form.Group controlId="formBasicLocation">
                            <Form.Label>Location</Form.Label>
                            <Form.Control as="select" name="location" value={updProgram.location} onChange={handleInputChange}>
                                {['International', 'Africa', 'Asia', 'Europe', 'European Union', 'America', 'Australia'].map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId="formBasicTypeOfProgram">
                            <Form.Label>Type of Program</Form.Label>
                            <div>
                                {['Teaching', 'Research'].map((programType) => (
                                    <Form.Check
                                        key={programType}
                                        type="checkbox"
                                        label={programType}
                                        name="typeOfProgram"
                                        value={programType}
                                        checked={updProgram.typeOfProgram && updProgram.typeOfProgram.includes(programType)}
                                        onChange={handleCheckboxChange}
                                    />
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group controlId="formBasicFunded">
                            <Form.Label>Funded</Form.Label>
                            <div>
                                <Form.Check
                                    type="checkbox"
                                    label="Funded"
                                    name="funded"
                                    checked={updProgram.funded && updProgram.funded.funded}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                        </Form.Group>


                        {updProgram.funded && updProgram.funded.funded && (
                            <>
                                <Form.Group controlId="formBasicFundingRequirements">
                                    <Form.Label>Funding Requirements</Form.Label>
                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        onClick={editFundingReq}
                                        className="px-2"
                                    />
                                    {editingFundingRequirements ?
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="fundingRequirements"
                                            value={updProgram.funded.fundingRequirements.join('\n')}
                                            onChange={handleInputChange}
                                        />
                                        :
                                        <>
                                            {updProgram.funded && updProgram.funded.fundingRequirements && (
                                                <ul>
                                                    {updProgram.funded.fundingRequirements.map((requirement, index) => (
                                                        <li key={index}>{requirement}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    }
                                </Form.Group>
                                <Form.Group controlId="formBasicFundingAllowances">
                                    <Form.Label>Funding Allowances</Form.Label>
                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        onClick={editFundingAll}
                                        className="px-2"
                                    />
                                    {editingFundingAllowances ?
                                        <Form.Control
                                            as="textarea"
                                            rows={4}
                                            name="fundingAllowances"
                                            value={updProgram.funded.fundingAllowances.join('\n')}
                                            onChange={handleInputChange}
                                        />
                                        :
                                        <>
                                            {updProgram.funded && updProgram.funded.fundingAllowances && (
                                                <ul>
                                                    {updProgram.funded.fundingAllowances.map((allowance, index) => (
                                                        <li key={index}>{allowance}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </>
                                    }
                                </Form.Group>

                                <Form.Group controlId="formBasicLogo">
                                    <Form.Label>Logo</Form.Label>
                                    <Form.Control type="text" name="logo" placeholder="Enter logo link" value={updProgram.logo} onChange={handleInputChange} />
                                </Form.Group>
                            </>
                        )}


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
}

export default PEditModal;
