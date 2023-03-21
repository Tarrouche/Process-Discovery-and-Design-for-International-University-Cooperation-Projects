import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSignOutAlt, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Collapse } from 'react-bootstrap';

function ProgramDetails(props) {
    const { programData, program, isOpen, toggleOpen } = props;

    return (
        <>
            <div className="program-details" onClick={toggleOpen} >
                <div className="program-info">
                    <div className="program-name">{programData.name}</div>
                    <div className="program-location">{programData.location}</div>
                    <div className="program-in-out">
                        {program.in ? (
                            <FontAwesomeIcon icon={faSignInAlt} color="green" />
                        ) : (
                            <FontAwesomeIcon icon={faSignInAlt} />
                        )}
                        {program.out ? (
                            <FontAwesomeIcon icon={faSignOutAlt} color="green" />
                        ) : (
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        )}
                    </div>
                </div>
                <div className="program-details-toggle">
                    {isOpen ? (
                        <FontAwesomeIcon icon={faChevronUp} />
                    ) : (
                        <FontAwesomeIcon icon={faChevronDown} />
                    )}
                </div></div>
            <Collapse in={isOpen}>
                <div className="program-more-details">
                    <p>Some additional details about the program...</p>
                </div>
            </Collapse>
        </>
    );
}

export default ProgramDetails;