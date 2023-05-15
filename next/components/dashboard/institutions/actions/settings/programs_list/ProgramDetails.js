import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSignOutAlt, faChevronUp, faChevronDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { Collapse, Button } from 'react-bootstrap';
import FileUpload from '../../../../programs/actions/set/manageDocuments/FileUpload';

function ProgramDetails({ programData, application, isOpen, toggleOpen, onEditProgram, onFileUpload, onDeleteFile }) {
    function handleInOut(event, input) {
        event.stopPropagation();
        let updProgram;
        if (input === 'in')
            updProgram = { ...application, in: !application.in }
        if (input === 'out')
            updProgram = { ...application, out: !application.in }
        onEditProgram(updProgram)
    }
    console.log(application)
    return (
        <>
            <div className={isOpen ? `row program-details p-2 mx-3` : `row program-details p-2 mx-3 mb-3`} onClick={toggleOpen} >
                <div className="program-info">
                    <div className="col-5 program-name">{programData.offerer} - {programData.title}</div>
                    <div className="col-4 program-location">{programData.location.from.state}/{programData.location.to.state}</div>
                    <div className=" col-3 program-parameters">
                        <Button
                            style={{ border: 'none', background: 'none', color: 'inherit' }}
                            className={application.in ? "text-success" : "text-secondary"}
                            onClick={(e) => handleInOut(e, 'in')}
                        >
                            <FontAwesomeIcon icon={faSignInAlt} />
                        </Button>

                        <Button
                            style={{ border: 'none', background: 'none', color: 'inherit' }}
                            className={application.out ? "text-success" : "text-secondary"}
                            onClick={(e) => handleInOut(e, 'out')}
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </Button>
                        <Button
                            style={{ border: 'none', background: 'none', color: 'inherit' }}
                            className={application.programConfirmed ? "text-primary" : "text-secondary"}
                        >
                            <FontAwesomeIcon icon={faCircleCheck} />
                        </Button>
                    </div>

                </div>
            </div>
            <Collapse in={isOpen}>
                <div className="program-more-details mx-4 mb-4">
                    <FileUpload
                        updProgram={programData}
                        entity={'institution'}
                        updEntity={application}
                        onFileUpload={onFileUpload}
                        onDeleteFile={onDeleteFile}
                    />
                </div>
            </Collapse>
        </>
    );
}

export default ProgramDetails;