import { Modal, Button, Form } from 'react-bootstrap';
import React, { useState } from 'react';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const RoleModal = ({ id, email, role, allowedRoles, onEdit }) => {
    const [show, setShow] = useState(false);
    const [updRole, setRole] = useState(role);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function handleEdit() {
        // Make a POST request to the server to update the user role
        onEdit(id, updRole);

    }

    return (
        <span className="mx-2">
            <Button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Modal size="lg" show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title id="modal">Edit User</Modal.Title>
                </Modal.Header>
                <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
                    <Modal.Body>
                        <Form.Group controlId="formBasicRole">
                            <Form.Label>Change the role from {email}</Form.Label>

                            <Form.Control as="select" value={updRole} onChange={(event) => setRole(event.target.value)}>
                                {allowedRoles && allowedRoles.map((role) => (
                                    <option key={role.toLowerCase().replace(/\s+/g, "_")} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </Form.Control>
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
                </form>
            </Modal>
        </span >
    );
}

export default RoleModal;