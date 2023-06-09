import { Modal, Button } from 'react-bootstrap';
import React, { useState } from 'react';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const IDeleteModal = ({ id, name, onDelete }) => {
    const [show, setShow] = useState(false);

    function openModal() {
        setShow(true);
    }

    function handleDelete() {
        // Make a POST request to the server to delete the user with the given ID
        onDelete(id);
        setShow(false);
    }


    return (
        <>
            <Button onClick={openModal} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                <FontAwesomeIcon icon={faTrash} />
            </Button>
            <Modal size="lg" show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title id="modal">Delete {name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>This action is irreversible. Are you sure you want to delete {name}?</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>
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

export default IDeleteModal;
