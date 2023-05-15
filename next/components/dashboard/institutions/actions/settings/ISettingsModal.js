import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container } from 'react-bootstrap';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PList from './programs_list/PList';
import TabButtons from '../../../programs/actions/TabButtons';
import EntityResponsibles from '../../../programs/actions/set/Responsibles';

const ISettingsModal = ({ institution, allPrograms, onSet }) => {
    const [show, setShow] = useState(false);
    const [updInstitution, setInstitution] = useState(institution);

    const [window, setWindow] = useState('Programs');

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
        fetch(`https://www.snorlax.wtf:4000/api/institution/${institution.institutionId}/programs`)
            .then(response => response.json())
            .then(programs => {
                console.log(programs)
                setInstitution(prevState => ({
                    ...prevState,
                    programs: programs
                }));
            })
            .catch(error => {
                console.error('Error fetching program:', error);
            });
    }, [institution.institutionId]);

    const updateTableAfterUpload = (id, data) => {
        const updatedPrograms = updInstitution.programs.map(program => {
            if (program.applicationId === id) {

                program.files.push(...data);
            }
            return program;
        });
        setInstitution({ ...updInstitution, programs: updatedPrograms });
    };
    const updateTableAfterDeleteFile = (id, file) => {
        const updatedPrograms = updInstitution.programs.map(program => {
            if (program.applicationId === id) {
                program.files = program.files.filter(f => f.fileId !== file.fileId);
            }
            return program;
        });
        setInstitution({ ...updInstitution, programs: updatedPrograms });
    };

    return (
        <>
            <Button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                <FontAwesomeIcon icon={faCog} />
            </Button>

            <Modal size="lg" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Institution Settings</Modal.Title>
                </Modal.Header>
                <Form onSubmit={(e) => { e.preventDefault(); handleSet(); }}>
                    <Modal.Body>
                        <TabButtons
                            options={["Programs", "Responsibles"]}
                            activeOption={window}
                            onChange={setWindow}
                        />

                        <Container
                            className="py-4"
                            style={{ border: "1px solid", borderRadius: "var(--bs-modal-border-radius)", borderColor: "var(--bs-modal-border-color)" }}
                        >

                            {window === 'Programs' ? (
                                <PList
                                    programs={updInstitution.programs}
                                    allPrograms={allPrograms}
                                    updInstitution={updInstitution}
                                    setInstitution={setInstitution}
                                    onFileUpload={updateTableAfterUpload}
                                    onDeleteFile={updateTableAfterDeleteFile}
                                />
                            ) : (
                                <EntityResponsibles
                                    entity={updInstitution}
                                    setEntity={setInstitution}
                                    type={'institution'}
                                />
                            )}

                        </Container>
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
