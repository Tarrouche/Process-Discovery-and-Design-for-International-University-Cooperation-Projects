import React, { useState } from "react";
import { Modal, Button, Form, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSpinner, faTrash, faSave, faForward, faDownload } from '@fortawesome/free-solid-svg-icons';

const ManageStep = ({ submittedChanges, stepOver, save, nextStep, updateApplication, programId, step, applicantFiles }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [awaitingUpload, setAwaitingUpload] = useState(false);
    const [awaitingDownload, setAwaitingDownload] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [downloadFile, setDownloadFile] = useState(false);
    const [filesPassword, setFilesPassword] = useState('');

    const handlePasswordChange = (event) => {
        setFilesPassword(event.target.value);
    };

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

    async function handleDownload(file, password) {
        if (!awaitingDownload) {
            setAwaitingDownload(true);
            try {
                const response = await fetch(
                    `https://snorlax.wtf:4000/api/user/download/${file.fileId}`,
                    {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify({ password }),
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
                if (response.ok) {
                    const blob = await response.blob();
                    const downloadUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = file.fileName;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                } else {
                    await response.json().then((data) => console.log(data));
                }
            } catch (error) {
                console.log(error.message);
            }
            setAwaitingDownload(false);
        }
    }



    function handleFileChange(event) {
        setSelectedFiles([...selectedFiles, ...event.target.files]);
    }

    async function upload(password) {
        if (!awaitingUpload && (selectedFiles.length > 0 || selectedLinks.length > 0)) {
            setAwaitingUpload(true);
            const formData = new FormData();
            selectedFiles.forEach(file => formData.append('files', file));
            formData.append('password', password);
            formData.append('programId', programId);
            formData.append('step', step);
            try {
                const response = await fetch(`https://snorlax.wtf:4000/api/user/upload`, {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.error)
                        console.log(data.error);
                    setSelectedFiles([]);
                    setFilesPassword('');
                    setUploadModal(false);
                } else {
                    await response.json().then(data => console.log(data));
                }

                setAwaitingUpload(false);
            } catch (error) {
                console.log(error.message);
            }
        }
    }
    return (
        <>
            {applicantFiles && applicantFiles.length > 0 &&
                <div className='row align-items-center pt-3 mb-4'>
                    <div className='row'>
                        <h6>Uploaded files:</h6>
                    </div>
                    <Table>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th className='dashbord-icon-cell'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicantFiles.map((file, index) =>
                                <tr key={`${file.fileName}-${index}`} className="align-middle">
                                    <td>
                                        {truncateMiddle(file.fileName)}
                                    </td>
                                    <td className='dashbord-icon-cell'>
                                        <Button
                                            style={{ border: 'none', background: 'none', color: 'inherit' }}
                                            onClick={(e) => setDownloadFile(file)}
                                        >
                                            <FontAwesomeIcon icon={faDownload} />
                                        </Button>
                                        <Button
                                            style={{ border: 'none', background: 'none', color: 'inherit' }}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </td>
                                </tr>
                            )}
                            <Modal size="lg" show={downloadFile} onHide={() => { setDownloadFile(false); setFilesPassword(''); }}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal">Decrypt + Download {downloadFile.fileName}</Modal.Title>
                                </Modal.Header>

                                <Modal.Body>
                                    <Form.Group controlId="formBasicOfferer">
                                        <h6 className="">Files password:</h6>
                                        <Form.Control type="password" name="password" placeholder="Enter files password" value={filesPassword} onChange={handlePasswordChange} />
                                    </Form.Group>
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button type="button" className="btn btn-secondary" onClick={() => { setDownloadFile(false); setFilesPassword(''); }}>
                                        Cancel
                                    </Button>
                                    <Button type="button" className="btn btn-primary" onClick={() => handleDownload(downloadFile, filesPassword)}>
                                        Upload
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </tbody>
                    </Table>
                </div>}
            <div className='row align-items-center pt-3 mb-4'>
                <div className='col'>
                    <div className='row'>
                        <h6>Add application documents:</h6>
                    </div>
                    <div className='row'>
                        <Form.Control type="file" multiple onChange={handleFileChange} />
                    </div>
                </div>

                <div className='col-2 text-center'>
                    <div className='row'>
                        <h6>Upload</h6>
                    </div>
                    <div className='row'>
                        <div className='col text-center'>
                            <Button
                                style={{ border: 'none', background: 'none', color: 'inherit' }}
                                onClick={(e) => setUploadModal(true)}
                            >
                                {!awaitingUpload ?
                                    <FontAwesomeIcon
                                        icon={faUpload}
                                        className={selectedFiles.length > 0 ? "text-primary" : "text-secondary"}
                                    />
                                    :
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                }
                            </Button>
                            <Modal size="lg" show={uploadModal} onHide={() => { setUploadModal(false); setFilesPassword(''); }}>
                                <Modal.Header closeButton>
                                    <Modal.Title id="modal">Upload + Encrypt {selectedFiles.length} files</Modal.Title>
                                </Modal.Header>

                                <Modal.Body>
                                    <Form.Group controlId="formBasicOfferer">
                                        <h6 className="">Files password:</h6>
                                        <Form.Control type="password" name="password" placeholder="Enter files password" value={filesPassword} onChange={handlePasswordChange} />
                                    </Form.Group>
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button type="button" className="btn btn-secondary" onClick={() => { setUploadModal(false); setFilesPassword(''); }}>
                                        Cancel
                                    </Button>
                                    <Button type="button" className="btn btn-primary" onClick={() => upload(filesPassword)}>
                                        Upload
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </div>
                    </div>
                </div>

                {!stepOver && submittedChanges &&
                    <div className='col-2 text-center'>
                        <div className='row'>
                            <h6>Save</h6>
                        </div>
                        <div className='row'>
                            <div className='col text-center'>
                                <Button
                                    style={{ border: 'none', background: 'none', color: 'inherit' }}
                                    onClick={() => {
                                        save()
                                            .then(() => {
                                                setTimeout(() => {
                                                    return updateApplication();
                                                }, 250);
                                            })
                                            .catch((error) => {
                                                console.error(error);
                                            });
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faSave}
                                        className="text-primary"
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>
                }

                {stepOver &&
                    <div className='col-2 text-center'>
                        <div className='row'>
                            <h6>Completed</h6>
                        </div>
                        <div className='row'>
                            <div className='col text-center'>
                                <Button
                                    style={{ border: 'none', background: 'none', color: 'inherit' }}
                                    onClick={() => {
                                        save()
                                            .then(() => {
                                                return nextStep();
                                            })
                                            .then(() => {
                                                setTimeout(() => {
                                                    return updateApplication();
                                                }, 250);
                                            })
                                            .catch((error) => {
                                                console.error(error);
                                            });
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faForward}
                                        className="text-primary"
                                    />
                                </Button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
};

export default ManageStep;
