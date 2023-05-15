import { useState } from 'react';
import { Form, Button, ProgressBar } from 'react-bootstrap';
import { faLink, faFilter, faPlus, faUpload, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ListOfFiles from './ListOfFiles';
import Filters from './Filters';
import SelectedFilesTable from './SelectedFilesTable';
import SelectedLinksTable from './SelectedLinksTable';
import FileUploadNotes from './FileUploadNotes';


export default function FileUpload({ updProgram, entity, updEntity, onFileUpload, onDeleteFile }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedLinks, setSelectedLinks] = useState([]);
    const [awaitingUpload, setAwaitingUpload] = useState(false);

    const [useLink, setUseLink] = useState(false);
    const [newLink, setNewLink] = useState({ url: '', name: '' });
    const [useFilters, setUseFilters] = useState(false);
    const acceptedPositions = Object.fromEntries(
        Object.entries(updProgram.eligiblePositions).filter(([key, value]) => value)
    );
    const [filters, setFilters] = useState({ eligiblePositions: { ...acceptedPositions }, steps: [] });
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    let programDomain;

    if (updProgram.website) {
        const url = new URL(updProgram.website);
        programDomain = url.hostname;
    }

    function handleAddSelectedLink() {
        if (isValidLink(newLink.url)) {
            setSelectedLinks([...selectedLinks, { url: newLink.url, name: newLink.name }]);
            setNewLink({ url: '', name: '' });
        }
    }

    function isValidLink(link) {
        if (urlRegex.test(link)) {
            const tempUrl = new URL(link);
            if (programDomain === tempUrl.hostname)
                return true;
        }
        return false;
    }

    function handleFileChange(event) {
        setSelectedFiles([...selectedFiles, ...event.target.files]);
    }

    async function handleUpload() {
        if (!awaitingUpload && (selectedFiles.length > 0 || selectedLinks.length > 0)) {
            setAwaitingUpload(true);
            const formData = new FormData();
            selectedFiles.forEach(file => formData.append('files', file));
            formData.append('links', JSON.stringify(selectedLinks));
            formData.append('filters', JSON.stringify(filters));
            try {
                if (entity === 'program') {
                    const response = await fetch(`https://snorlax.wtf:4000/api/program/${updProgram.programId}/uploadFiles`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.error)
                            console.log(data.error);
                        onFileUpload(updProgram.programId, data.files);
                        setSelectedFiles([]);
                        setSelectedLinks([]);
                        setFilters({ eligiblePositions: { ...acceptedPositions }, steps: [] });
                    } else {
                        await response.json().then(data => console.log(data));
                    }
                } else if (entity === 'institution') {
                    const response = await fetch(`https://snorlax.wtf:4000/api/institution/${updEntity.applicationId}/uploadApplicationFiles`, {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });

                    if (response.ok) {
                        const data = await response.json();
                        onFileUpload(updEntity.applicationId, data.files);
                        setSelectedFiles([]);
                        setSelectedLinks([]);
                        setFilters({ eligiblePositions: { ...acceptedPositions }, steps: [] });
                    } else {
                        await response.json().then(data => console.log(data));
                    }
                }
                setAwaitingUpload(false);
            } catch (error) {
                console.log(error.message);
            }
        }
    }

    return (
        <>
            {updProgram.files.length > 0 ?
                <>
                    <h6 className='pt-3'>Documents: (Viewable by everyone)</h6>
                    <ListOfFiles
                        objectId={updProgram.programId}
                        object={entity}
                        files={updProgram.files}
                        onDeleteFile={onDeleteFile}
                        owner={entity === 'program'}
                    />
                </>
                :
                <h6 className='pt-3'>Here documents related to the program could be added, applicants and users will be able to see them.</h6>
            }
            {entity === 'institution' &&
                <>
                    <h6 className='pt-3'>Documents uploaded by the institution: (Viewable by everyone)</h6>
                    <ListOfFiles
                        objectId={updEntity.applicationId}
                        object={entity}
                        files={updEntity.files}
                        onDeleteFile={onDeleteFile}
                        owner={true}
                    />
                </>
            }
            <Form.Group>
                <div className='row align-items-center'>
                    <div className='col'>
                        <div className='row'>

                            <h6 className='pt-3'>Add application documents:</h6>
                        </div>
                        <div className='row'>
                            <div className='col'>
                                {useLink ? (
                                    <>
                                        <Form.Control type="text" id="fileNameInput" placeholder="Enter file name" name="fileNameInput" value={newLink.name} onChange={(e) => setNewLink({ ...newLink, name: e.target.value })} />
                                        <Form.Control type="text" id="linkInput" placeholder="Enter link to document" name="linkInput" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} />
                                    </>
                                ) : (
                                    <Form.Control type="file" multiple onChange={handleFileChange} />
                                )}
                            </div>

                        </div>
                    </div>

                    {updProgram.website &&
                        <div className='col-2 text-center'>

                            <div className='row'>
                                <h6 className='pt-3'>Link</h6>
                            </div>

                            <div className='row'>
                                <div className='col text-center'>
                                    <div className='d-flex justify-content-center'>
                                        <Button style={{ border: 'none', background: 'none', color: 'inherit' }} onClick={() => setUseLink(!useLink)}>
                                            <FontAwesomeIcon icon={faLink} className={useLink ? "text-primary" : "text-secondary"} />
                                        </Button>
                                        {useLink &&
                                            <Button style={{ border: 'none', background: 'none', color: 'inherit' }} onClick={handleAddSelectedLink}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className={isValidLink(newLink.url) ? "text-primary" : "text-secondary"} />
                                            </Button>
                                        }
                                    </div>
                                </div>

                            </div>
                        </div>
                    }

                    <div className='col-2 text-center'>
                        <div className='row'>
                            <h6 className='pt-3'>Filters</h6>
                        </div>

                        <div className='row'>
                            <div className='col text-center'>
                                <Button style={{ border: 'none', background: 'none', color: 'inherit' }} onClick={() => setUseFilters(!useFilters)}>
                                    <FontAwesomeIcon icon={faFilter} className={useFilters ? "text-primary" : "text-secondary"} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className='col-2 text-center'>
                        <div className='row'>
                            <h6 className='pt-3'>Upload</h6>
                        </div>


                        <div className='row'>
                            <div className='col text-center'>
                                <Button style={{ border: 'none', background: 'none', color: 'inherit' }}
                                    onClick={handleUpload} >
                                    {!awaitingUpload ?
                                        <FontAwesomeIcon
                                            icon={faUpload}
                                            className={(selectedFiles.length > 0 || selectedLinks.length > 0) ? "text-primary" : "text-secondary"}
                                        />
                                        :
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                    }
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>


                {useFilters &&
                    <Filters filters={filters} setFilters={setFilters} processSteps={updProgram.steps} modules={updProgram.modules.modules} />
                }

                {selectedFiles.length > 0 &&
                    <SelectedFilesTable selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
                }

                {selectedLinks.length > 0 &&
                    <SelectedLinksTable selectedLinks={selectedLinks} setSelectedLinks={setSelectedLinks} />
                }

                <FileUploadNotes useLink={useLink} />

            </Form.Group>
        </>
    );
}
