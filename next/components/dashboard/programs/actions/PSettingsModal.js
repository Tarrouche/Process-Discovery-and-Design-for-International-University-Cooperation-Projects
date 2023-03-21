import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Dropdown } from 'react-bootstrap';
import { faPlus, faMinus, faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PSettingsModal = ({ program, onSet }) => {
    const [show, setShow] = useState(false);
    const [updProgram, setProgram] = useState(program);


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    async function handleSet() {
        // Make a POST request to the server to delete the user with the given ID
        const { responsibles } = updProgram;
        const data = { responsibles };
        onSet(updProgram.programId, data);
        setShow(false);
    }

    const handleAddResponsible = (responsible) => {
        if (responsible != {}) {
            setProgram({
                ...updProgram,
                responsibles: [
                    ...updProgram.responsibles,
                    responsible
                ]
            });
        }
    };

    const handleRemoveResponsible = (responsible) => {
        const updatedResponsibles = updProgram.responsibles.filter(r => r.email !== responsible.email);
        setProgram({
            ...updProgram,
            responsibles: updatedResponsibles
        });
    };

    return (
        <>
            <button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                <FontAwesomeIcon icon={faCog} />
            </button>

            <Modal size="lg" show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Program Settings</Modal.Title>
                </Modal.Header>
                <Form onSubmit={(e) => { e.preventDefault(); handleSet(); }}>
                    <Modal.Body>
                        {updProgram.responsibles && updProgram.responsibles.length > 0 &&
                            <div className="container">
                                <Form.Label>Program Responsibles</Form.Label>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th className='dashbord-icon-cell' >Action</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        {updProgram.responsibles.map(rsp => (
                                            <tr key={rsp.email}>
                                                <td>{rsp.email}</td>
                                                <td>{rsp.email}</td>
                                                <td className='dashbord-icon-cell' >
                                                    <FontAwesomeIcon
                                                        icon={faMinus}
                                                        onClick={() => handleRemoveResponsible(rsp)}
                                                        className="px-2"
                                                    />

                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                        <div className='row'>
                            <PushResponsible
                                responsibles={updProgram.responsibles || []}
                                onSelectResponsible={handleAddResponsible}
                            />
                        </div>
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

const PushResponsible = ({ responsibles, onSelectResponsible }) => {
    const [inputValue, setInputValue] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [pshResponsible, setPshResponsible] = useState({});
    const handleResponsibleChange = (event) => {
        const input = event.target.value;
        setInputValue(input);
        if (allUsers) {
            const filtered = allUsers.filter(
                (user) => user.email.toLowerCase().startsWith(input.toLowerCase()) &&
                    (!responsibles.some((responsible) => responsible.email === user.email))
            );
            setFilteredUsers(filtered);
        }
    };

    useEffect(() => {
        fetch('https://93.90.203.127:4000/api/emails')
            .then(response => response.json())
            .then(data => {
                setAllUsers(data.emails);
            })
            .catch(error => {
                console.error('Error fetching institution:', error);
            });
    }, []);

    const handleSelect = (responsible) => {
        setInputValue(responsible.email);
        setFilteredUsers([]);
        setPshResponsible(responsible);
    };
    console.log(pshResponsible)

    return (
        <>
            <div className="col-">
                <Form.Group controlId="formBasicEmail">
                    <FontAwesomeIcon icon={faPlus} className="px-1" /><Form.Label>Add Responsible</Form.Label>
                    <div className="row">
                        <div className="col">
                            <Form.Control
                                type="text"
                                placeholder="Enter email"
                                value={inputValue}
                                onChange={handleResponsibleChange}
                            />
                        </div>
                        <div className="col-auto">
                            <button onClick={() => {
                                event.preventDefault();
                                if (pshResponsible !== {}) {
                                    onSelectResponsible(pshResponsible);
                                    setPshResponsible({});
                                    setInputValue("");
                                }
                            }}
                                className="btn btn-secondary">
                                <FontAwesomeIcon
                                    icon={faPlus}
                                />
                            </button>
                        </div>
                    </div>
                    <Dropdown show={filteredUsers.length}>
                        <Dropdown.Menu>
                            {filteredUsers.map((user) => (
                                <Dropdown.Item key={user.email} eventKey={user.email} onClick={() => handleSelect(user)}>
                                    {user.email}
                                </Dropdown.Item>
                            ))}
                        </Dropdown.Menu>
                    </Dropdown>
                </Form.Group>
            </div >
        </>
    );
}


export default PSettingsModal;
