import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button } from 'react-bootstrap';
import LocationFrom from './LocationFrom';
import LocationTo from './LocationTo';
import Tags from './Tags';
import CallsAvailable from './Calls';
import AvailableModules from './Modules';
import Title from './ProgramTitle';
import ProcessTimeline from '../../process/ProcessTimeline';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const ProgramCard = ({ program, applications }) => {
        const { programId, offerer, title, website, location, logo, funded, transfer, applicationPeriod, eligiblePositions, applicant, applicationForm, calls, modules, reports, finalReport, steps } = program;
        const [isAccordionOpen, setIsAccordionOpen] = useState(false);
        const [application, setApplication] = useState();
        const handleHeaderClick = (event) => {
                if (event.target.getAttribute('name') === 'link') {
                        return;
                }
                setIsAccordionOpen(!isAccordionOpen);
        };
        const applyForProgram = async () => {
                try {
                        const response = await fetch(`https://snorlax.wtf:4000/api/program/${programId}/apply`, {
                                method: 'POST',
                                credentials: 'include'
                        });

                        if (response.status === 200) {
                                const data = await response.json();
                                // Update user state with the response message
                                setApplication(data.message);
                        } else {
                                // Handle error response
                                console.error('Failed to apply for program:', response.status);
                        }
                } catch (error) {
                        console.error('Failed to apply for program:', error);
                }
        }

        const nextStep = async () => {
                try {
                        const response = await fetch(`https://snorlax.wtf:4000/api/program/${programId}/nextStep`, {
                                method: 'POST',
                                credentials: 'include'
                        });

                        if (response.status === 200) {
                                const data = await response.json();
                                // Update user state with the response message
                                setApplication(data.message);
                        } else {
                                // Handle error response
                                console.error('Failed to proceed with the next step for program:', response.status);
                        }
                } catch (error) {
                        console.error('Failed to proceed with the next step for program:', error);
                }
        }

        const updateApplication = async () => {
                try {
                        const response = await fetch(`https://snorlax.wtf:4000/api/user/application/${programId}`, {
                                credentials: 'include'
                        });
                        if (response.status === 200) {
                                const responseData = await response.json();
                                setApplication(responseData);
                        }
                } catch (error) {
                        console.error('Failed to proceed with the next step for program:', error);
                }
        }

        useEffect(() => {
                if (applications) {
                        setApplication(applications.find(app => app.programId === programId));
                }
        }, [applications]);


        return (
                <div key={`progr-${programId}`} className="py-3">
                        <div className="accordion-item bg-white" style={{ backgroundColor: 'white' }}>
                                <button
                                        className={`accordion-button py-0 collapsed custom-padding-left-0 ${isAccordionOpen ? 'mirror-x' : ''}`}
                                        type="button"
                                        data-bs-toggle="collapse"
                                        style={{ backgroundColor: 'white', outline: 'none', boxShadow: 'none' }}
                                        aria-expanded={isAccordionOpen}
                                        onClick={handleHeaderClick}
                                >


                                        <Card
                                                key={`prog-${programId}`}
                                                className={`${isAccordionOpen ? 'mirror-x' : ''}`}
                                                style={{ width: '100%', border: 'none' }}
                                        >
                                                <Card.Body>
                                                        <Row>
                                                                <Col md={3} className="d-flex align-items-center justify-content-center">
                                                                        <Card.Img
                                                                                src={logo}
                                                                                style={{ maxHeight: "200px" }}
                                                                        />
                                                                </Col>
                                                                <Col className="d-flex flex-column">
                                                                        <Title website={website}
                                                                                offerer={offerer}
                                                                                title={title}
                                                                                period={funded.period}
                                                                        />

                                                                        <div className="flex-grow-1 d-flex justify-content-between flex-column">
                                                                                <LocationFrom from={location.from} />
                                                                                <LocationTo to={location.to} />
                                                                                <Tags funded={funded} transfer={transfer} eligiblePositions={eligiblePositions} applicationPeriod={applicationPeriod} />
                                                                        </div>
                                                                </Col>

                                                        </Row>
                                                </Card.Body>
                                        </Card>
                                </button>

                                <div className={`accordion-collapse collapse ${isAccordionOpen ? 'show' : ''}`} aria-labelledby="headingOne">
                                        <div className="accordion-body">
                                                <h6>Funding Requirements:</h6>
                                                <h6>Funding Allowances:</h6>
                                                <h6>Selection Criteria:</h6>
                                                <h6>Application Process:</h6>

                                                {applicant &&
                                                        <Card.Text className="">
                                                                Applications should be submitted by the {applicant.toLowerCase()}.
                                                        </Card.Text>
                                                }

                                                <CallsAvailable calls={calls} />
                                                <AvailableModules modules={modules} />

                                                <h6>Timeline Overview:</h6>
                                                <ProcessTimeline
                                                        programId={programId}
                                                        steps={steps}
                                                        application={application}
                                                        currentStep={application ? application.currentStep : -1}
                                                        modules={modules}
                                                        calls={calls}
                                                        applicationForm={applicationForm}
                                                        reports={reports}
                                                        finalReport={finalReport}
                                                        nextStep={nextStep}
                                                        updateApplication={updateApplication}
                                                />

                                                {!application &&
                                                        <div className="d-flex justify-content-center align-items-center">
                                                                <Button variant='secondary' onClick={applyForProgram}>
                                                                        Apply <FontAwesomeIcon icon={faPaperPlane} />
                                                                </Button>
                                                        </div>
                                                }
                                        </div>
                                </div>
                        </div>
                </div >
        );
};

export default ProgramCard;
