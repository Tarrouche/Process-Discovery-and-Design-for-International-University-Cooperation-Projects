import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PList from './programs_list/PList';

const ISettingsModal = ({ institution, allPrograms, onSet }) => {
    const [show, setShow] = useState(false);
    const [updInstitution, setInstitution] = useState(institution);


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function handleSet() {
        // Make a POST request to the server to delete the user with the given ID
        const { programs } = updInstitution;
        const data = { programs };
        onSet(institution.institutionId, data);
        setShow(false);
    }

    useEffect(() => {
        fetch(`https://93.90.203.127:4000/api/institution/${institution.institutionId}/programs`)
            .then(response => response.json())
            .then(programs => {
                setInstitution(prevState => ({
                    ...prevState,
                    programs: programs
                }));
            })
            .catch(error => {
                console.error('Error fetching program:', error);
            });
    }, []);

    return (
        <>
            <button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                <FontAwesomeIcon icon={faCog} />
            </button>

            <Modal size="lg" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Institution Settings</Modal.Title>
                </Modal.Header>
                <Form onSubmit={(e) => { e.preventDefault(); handleSet(); }}>
                    <Modal.Body>
                        <PList
                            programs={updInstitution.programs}
                            allPrograms={allPrograms}
                            updInstitution={updInstitution}
                            setInstitution={setInstitution}
                        />


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


export default ISettingsModal;
