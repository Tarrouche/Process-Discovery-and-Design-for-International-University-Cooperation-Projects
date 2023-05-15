import { Button, Table, Modal } from 'react-bootstrap';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';



export default function ListOfFiles({ objectId, files, onDeleteFile, object, owner }) {
    const [showModal, setShowModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState({ fileName: '' });

    function truncateMiddle(str, maxLength) {
        maxLength = maxLength || 32; // set a default value for maxLength
        if (str.length > maxLength) {
            const startLength = Math.ceil((maxLength - 3) / 2);
            const endLength = Math.floor((maxLength - 3) / 2);
            return str.slice(0, startLength) + "..." + str.slice(-endLength);
        } else {
            return str;
        }
    }

    const handleDeleteButtonClick = (file) => {
        setFileToDelete(file);
        setShowModal(true);
    };
    const handleDelete = async () => {
        try {
            let response;
            if (object === 'program') {
                response = await fetch(`https://snorlax.wtf:4000/api/program/${objectId}/deleteFile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fileToDelete),
                    credentials: 'include'
                });
            } else if (object === 'institution') {
                response = await fetch(`https://snorlax.wtf:4000/api/institution/${objectId}/deleteApplicationFile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(fileToDelete),
                    credentials: 'include'
                });
            }

            if (response && response.ok) {
                onDeleteFile(objectId, fileToDelete);
                setShowModal(false);
            } else {
                response.json().then(data => console.log(data));
            }

        } catch (error) {
            console.log(error);
        }
    };


    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th className="text-center">Needed by</th>
                        <th className="text-center">Include in steps</th>
                        {owner &&
                            <th className='dashbord-icon-cell'>Action</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {files && files.map((file, index) =>
                        <tr key={`${file.fileName}-${index}`} className="align-middle">
                            <td>
                                {truncateMiddle(file.fileName)}
                            </td>

                            <td className="text-center">

                                {file.eligiblePositions ? Object.entries(file.eligiblePositions)
                                    .filter(([key, value]) => value)
                                    .map(([position, value]) => (
                                        <div key={`${position}-${index}`}>{position}</div>
                                    )) : <div>-</div>
                                }
                            </td>
                            <td className="text-center">
                                {file.steps ? file.steps.map((step, index) =>
                                    <div key={`step-${index}`}>{step.step}</div>
                                ) : <div>-</div>
                                }
                            </td>
                            {owner &&
                                <td className='dashbord-icon-cell'>
                                    <Button
                                        style={{ border: 'none', background: 'none', color: 'inherit' }}
                                        onClick={(e) => handleDeleteButtonClick(file)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </Button>
                                </td>
                            }
                        </tr>
                    )}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the file {fileToDelete.fileName}? This action is irreversible.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="white" style={{ borderColor: "var(--bs-modal-border-color)" }} onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
