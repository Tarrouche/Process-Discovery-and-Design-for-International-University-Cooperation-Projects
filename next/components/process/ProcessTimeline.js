import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';
import MobilitySettlment from './MobilitySettlement';
import GrantApplication from './GrantApplication';
import GrantApproval from './GrantApproval';
import VisaApplication from './VisaApplication';
import ProgramStart from './Start/ProgramStart';
import ProgramEnd from './ProgramEnd';
import ReactHtmlParser from 'react-html-parser';


function ProcessTimeline({ steps, application, currentStep, modules, applicationForm, calls, reports, finalReport, nextStep, updateApplication }) {
    const circleWidth = 25;
    const barWidth = 10;

    const [applicantFiles, setApplicantFiles] = useState([]);
    const duringApplicationModules = modules.state === 'Available' && modules.modules.filter((module) => module.applicationTime === 'During Application' || module.applicationTime === 'Both');
    const duringProgramModules = modules.state === 'Available' && modules.modules.filter((module) => module.applicationTime === 'During Program' || module.applicationTime === 'Both');
    const circleStyle = {
        width: circleWidth,
        height: circleWidth,
        borderRadius: circleWidth / 2,
        position: 'relative',
        marginBottom: -circleWidth / 2,
        marginTop: -circleWidth / 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        boxShadow: '0 0 0 4px #f8f9fa, 0 0 0 8px #007bff',
        zIndex: 1,
        overflow: 'hidden'
    };
    const innerCircleStyle = {
        width: circleWidth * 0.3,
        height: circleWidth * 0.3,
        borderRadius: circleWidth * 0.3 / 2,
        backgroundColor: '#007bff'
    };


    const timelineStyle = {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    };
    const progressStyle = {
        width: barWidth,
        marginLeft: (circleWidth - barWidth) / 2,
        flex: 1,
        minHeight: 100,
        height: '100%',

    };

    useEffect(() => {
        const fetchData = async () => {
            if (application) {
                const response = await fetch(`https://www.snorlax.wtf:4000/api/user/files/${application.programId}`, { credentials: 'include' });
                if (response.ok) {
                    const data = await response.json();
                    setApplicantFiles(data);
                }
            }
        };
        fetchData();
    }, [application]);

    return (
        <div className="process-timeline py-5" style={{ width: '100%', height: '100%' }}>
            <div style={timelineStyle}>
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="row px-3">
                            <div className="col-1">
                                <div
                                    className="process-timeline-circle"
                                    style={{ ...circleStyle, backgroundColor: index < currentStep ? '#007bff' : '#f8f9fa' }}
                                >
                                    {index === currentStep &&
                                        <div style={innerCircleStyle}></div>
                                    }
                                </div>

                                {index < steps.length - 1 && <ProgressBar
                                    variant={index < currentStep ? 'primary' : 'light'}
                                    now={100}
                                    style={progressStyle}
                                    vertical="true"
                                />}

                            </div>


                            <div className="col" style={{ marginTop: -10 }}>
                                <h6>{step.title} {step.deadline && `- Deadline: ${step.deadline}`}</h6>
                                {currentStep < index &&
                                    <>
                                        {step.condition &&
                                            <>{step.condition}:</>}
                                        <ul>
                                            {step.description.map((item, index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>

                                        {step.title === 'Grant Application' && applicationForm && applicationForm.method && (
                                            <>
                                                <h6 style={{ fontSize: '16px' }}>{applicationForm.method}:</h6>
                                                <ul>
                                                    <li key='application_form'>{ReactHtmlParser(applicationForm.endpoint)}</li>
                                                </ul>
                                            </>
                                        )}
                                        {step.title === 'Mobility Settlement' && ['Required', 'Available'].includes(calls.state) && (
                                            <>
                                                <h6 style={{ fontSize: '16px' }}>Calls:</h6>
                                                <ul>
                                                    <li key='calls_source'>{ReactHtmlParser(calls.source)}</li>
                                                </ul>
                                            </>
                                        )}

                                        {step.title === 'Program Start' && duringProgramModules.length > 0 && (
                                            <>
                                                <h6 style={{ fontSize: '16px' }}>Modules:</h6>
                                                <ul>
                                                    {duringProgramModules.map((module, index) => (
                                                        <li key={index}>{ReactHtmlParser(module.name)}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}

                                        {step.title === 'Grant Application' && duringApplicationModules.length > 0 && (
                                            <>
                                                <h6 style={{ fontSize: '16px' }}>Modules:</h6>
                                                <ul>
                                                    {duringApplicationModules.map((module, index) => (
                                                        <li key={index}>{ReactHtmlParser(module.name)}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </>
                                }

                                {currentStep >= index && step.title === 'Mobility Settlement' && application &&
                                    <MobilitySettlment nextStep={nextStep} application={application} current={index === currentStep} currentStep={currentStep} updateApplication={updateApplication} applicantFiles={applicantFiles} />
                                }

                                {currentStep >= index && step.title === 'Visa Application' && application &&
                                    <VisaApplication nextStep={nextStep} application={application} current={index === currentStep} country={'Germany'} nationality={'Tunisian'} updateApplication={updateApplication} applicantFiles={applicantFiles} />
                                }

                                {currentStep >= index && step.title === 'Grant Application' && application &&
                                    <>
                                        <GrantApplication nextStep={nextStep} application={application} current={index === currentStep} updateApplication={updateApplication} applicantFiles={applicantFiles} />

                                        {duringApplicationModules.length > 0 && (
                                            <>
                                                <h6 style={{ fontSize: '16px' }}>Modules:</h6>
                                                <ul>
                                                    {duringApplicationModules.map((module, index) => (
                                                        <li key={index}>{ReactHtmlParser(module.name)}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}

                                        {applicationForm && applicationForm.method && (
                                            <>
                                                <h6 style={{ fontSize: '16px' }}>{applicationForm.method}:</h6>
                                                <ul>
                                                    <li key='application_form'>{ReactHtmlParser(applicationForm.endpoint)}</li>
                                                </ul>
                                            </>
                                        )}
                                    </>
                                }

                                {currentStep >= index && step.title === 'Grant Approval' && application &&
                                    <GrantApproval nextStep={nextStep} application={application} current={index === currentStep} updateApplication={updateApplication} applicantFiles={applicantFiles} />
                                }

                                {currentStep >= index && step.title === 'Program Start' && application &&
                                    <ProgramStart nextStep={nextStep} application={application} current={index === currentStep} updateApplication={updateApplication} applicantFiles={applicantFiles} />
                                }

                                {currentStep >= index && step.title === 'Program End' && application &&
                                    <ProgramEnd nextStep={nextStep} application={application} current={index === currentStep} finalReport={finalReport} updateApplication={updateApplication} applicantFiles={applicantFiles} />
                                }

                            </div>


                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div >
    );
}

export default ProcessTimeline;
