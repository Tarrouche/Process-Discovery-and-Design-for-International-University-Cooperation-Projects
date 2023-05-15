import React, { useState } from 'react';
import { Modal, Button, Form, Container } from 'react-bootstrap';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BasicInformation from './set/BasicInformation';
import ApplicationReqs from './set/eligibility/ApplicationReqs';
import TabButtons from './TabButtons';




const PEditModal = ({ program, onEdit, countries }) => {
    const [show, setShow] = useState(false);
    const [updProgram, setProgram] = useState(program);
    const [window, setWindow] = useState('General Information');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    function handleEdit() {
        // Make a POST request to the server to edit the program
        onEdit(program.programId, updProgram);
        setShow(false);
    }

    return (
        <>
            {updProgram && !(updProgram.programId) ? (
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
                    {updProgram && !updProgram.programId ? (
                        <Modal.Title> Create Program</Modal.Title>
                    ) : (
                        <Modal.Title> Edit Program</Modal.Title>
                    )}
                </Modal.Header>

                <Form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
                    <Modal.Body>

                        <TabButtons
                            options={["General Information", "General Requirements"]}
                            activeOption={window}
                            onChange={setWindow}
                        />

                        <Container className="py-4" style={{ border: "1px solid", borderRadius: "var(--bs-modal-border-radius)", borderColor: "var(--bs-modal-border-color)" }}>


                            {window === 'General Information' ? (

                                <BasicInformation updProgram={updProgram} setProgram={setProgram} />

                            ) : (

                                <ApplicationReqs updProgram={updProgram} setProgram={setProgram} countries={countries} />

                            )}

                        </Container>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="white" style={{ borderColor: "var(--bs-modal-border-color)" }} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="secondary" type="submit">
                            Save Changes
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default PEditModal;
