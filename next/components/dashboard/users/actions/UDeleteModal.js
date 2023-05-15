import { Modal, Button } from 'react-bootstrap';
import React, { useState } from 'react';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UDeleteModal = ({ id, email, onDelete }) => {
    const [bookingModal, setBookingModal] = useState(false);

    function openModal() {
        setBookingModal(true);
    }

    function handleDelete() {
        // Make a POST request to the server to delete the user with the given ID
        onDelete(id);
        setBookingModal(false);
    }

    return (
        <>
            <Button onClick={openModal} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                <FontAwesomeIcon icon={faTrash} />
            </Button>
            <Modal size="lg" show={bookingModal} onHide={() => setBookingModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title id="modal">Delete User</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>This action is irreversible. Are you sure you want to delete {email}?</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button type="button" className="btn btn-secondary" onClick={() => setBookingModal(false)}>
                        Cancel
                    </Button>
                    <Button type="button" className="btn btn-primary" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default UDeleteModal;