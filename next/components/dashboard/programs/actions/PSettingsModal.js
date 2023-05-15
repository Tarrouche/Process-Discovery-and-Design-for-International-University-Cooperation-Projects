import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Container } from 'react-bootstrap';
import { faCog, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ApplicationForm from './set/manageFlow/ApplicationForm';
import FileUpload from './set/manageDocuments/FileUpload';
import Calls from './set/manageFlow/Calls';
import Modules from './set/manageFlow/Modules';
import Reports from './set/manageFlow/Reports';
import FinalReport from './set/manageFlow/FinalReport';
import ProcessTimeline from '../../../process/ProcessTimeline';
import TabButtons from './TabButtons';
import SearchDropdown from './set/eligibility/SearchDropdow';
import EntityResponsibles from './set/Responsibles';




const PSettingsModal = ({ program, onSet, onFileUpload, onDeleteFile }) => {
    const [show, setShow] = useState(false);
    const [updProgram, setProgram] = useState(program);

    const [window, setWindow] = useState('General Settings');

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    async function handleSet() {
        // Make a POST request to the server to delete the user with the given ID
        onSet(updProgram.programId, updProgram);
        setShow(false);
    }

    const [currentStep, setCurrentStep] = useState(-1);


    useEffect(() => { //The generation of the process' steps using the attributes required for our model
        let updatedSteps = [];

        if (['Required', 'Possible'].includes(updProgram.transfer)) { //Mobility Step
            let newDescriptions = [];
            newDescriptions.push('Applicants should get general approval from their supervisor.');
            if (updProgram.calls.state === 'Required') {
                newDescriptions.push('Applicants establish contact with an institution which has an open call for the program.');
            } else if (updProgram.calls.state === 'Available') {
                newDescriptions.push('Applicants establish contact with the institution of their choice, either from the available calls or destination locations.');
            } else {
                newDescriptions.push('Applicants establish contact with the institution of their choice from the available destination locations.');
            }
            newDescriptions.push('Settle the Mobility Agreement after the approval from both the supervisor and the chosen institution.');

            let step = { title: 'Mobility Settlement', description: newDescriptions };
            if (updProgram.transfer === 'Possible')
                step.condition = 'If applicants envisage a transfer'
            updatedSteps = [...updatedSteps, step];

            //Apply for Visa
            newDescriptions = [];
            newDescriptions.push('Applicants must apply for a visa.');

            step = {
                title: 'Visa Application',
                description: newDescriptions,
                condition: 'If a transfer is occuring and a visa for the destination country is required'
            };
            updatedSteps = [...updatedSteps, step];
        }

        //Grant Application
        let newDescriptions = [];
        if (updProgram.modules.state === 'Available')
            newDescriptions.push('Applicants check whether they would like to add a module which is applicable during the grant application.');
        newDescriptions.push('Applicants prepare the required documents for the application.');
        if (updProgram.applicant === 'User') {
            let temp;
            if (updProgram.applicationForm.method) {
                temp = `the program's ${updProgram.applicationForm.method.toLowerCase()}`;
            } else {
                temp = 'the information provided on the program\'s website';
            }
            newDescriptions.push(`Applicants submit their documents using ${temp}.`);
        } else if (updProgram.applicant === 'Institution') {
            newDescriptions.push(`Applicants submit their documents to their current institution to be nominated.`);
        }

        let deadline;
        if (updProgram.applicationPeriod && updProgram.applicationPeriod.end)
            deadline = updProgram.applicationPeriod.end;
        else if (updProgram.funded.period && updProgram.funded.period.end)
            deadline = updProgram.funded.period.end;
        let step = { title: 'Grant Application', description: newDescriptions, deadline };
        if (updProgram.transfer === 'Possible')
            step.condition = 'After the mobility approval, if applicants decided to make a transfer'
        else if (updProgram.transfer === 'Required')
            step.condition = 'After the mobility approval'
        updatedSteps = [...updatedSteps, step];

        //Wait for Approval
        newDescriptions = [];
        newDescriptions.push('Applicants should confirm their participation.');

        step = {
            title: 'Grant Approval',
            description: newDescriptions,
            condition: 'After the grant approval'
        };
        updatedSteps = [...updatedSteps, step];

        //Program Start
        newDescriptions = [];
        if (updProgram.transfer === 'Required')
            newDescriptions.push('Applicants must confirm their arrival.');
        if (updProgram.transfer === 'Possible')

            newDescriptions.push('In mobility cases, applicants must confirm their arrival.');

        if (updProgram.reports.state === 'Required')
            newDescriptions.push(`Participants must submit reports ${updProgram.reports.frequency.type} ${updProgram.reports.frequency.n} ${updProgram.reports.frequency.unit}.`);

        if (updProgram.modules.state === 'Available')
            newDescriptions.push(`Participants can apply for modules during the program.`);

        step = {
            title: 'Program Start',
            description: newDescriptions,
        };
        updatedSteps = [...updatedSteps, step];

        //Program End
        newDescriptions = [];
        deadline = '';
        if (updProgram.funded.period && updProgram.funded.period.end)
            deadline = updProgram.funded.period.end;
        if (updProgram.finalReport.state === 'Required')
            newDescriptions.push(`Participants must submit their final report within ${updProgram.finalReport.frequency.n} ${updProgram.finalReport.frequency.unit}.`);

        step = {
            title: 'Program End',
            description: newDescriptions,
            deadline
        };
        updatedSteps = [...updatedSteps, step];

        setProgram(
            {
                ...updProgram,
                steps: updatedSteps
            }
        );

    }, [updProgram.transfer, updProgram.calls, updProgram.reports, updProgram.modules, updProgram.finalReport]);



    return (
        <>
            <Button onClick={handleShow} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                <FontAwesomeIcon icon={faCog} />
            </Button>

            <Modal size="lg" show={show} onHide={handleClose}>

                <Modal.Header closeButton>
                    <Modal.Title>Program Settings</Modal.Title>
                </Modal.Header>

                <Form onSubmit={(e) => { e.preventDefault(); handleSet(); }}>

                    <Modal.Body>

                        <TabButtons
                            options={["General Settings", "Manage Documents", "View Timeline", "Responsibles"]}
                            activeOption={window}
                            onChange={setWindow}
                        />

                        <Container className="py-4" style={{ border: "1px solid", borderRadius: "var(--bs-modal-border-radius)", borderColor: "var(--bs-modal-border-color)" }}>

                            {window === 'General Settings' ? (
                                <>

                                    <ApplicationForm updProgram={updProgram} setProgram={setProgram} />

                                    <Calls updProgram={updProgram} setProgram={setProgram} />

                                    <Modules updProgram={updProgram} setProgram={setProgram} />

                                    <Reports updProgram={updProgram} setProgram={setProgram} />

                                    <FinalReport updProgram={updProgram} setProgram={setProgram} />

                                </>

                            ) : window === 'Manage Documents' ? (

                                <FileUpload updProgram={updProgram} setProgram={setProgram} onFileUpload={onFileUpload} entity={'program'} onDeleteFile={onDeleteFile} />

                            ) : window === 'View Timeline' ? (

                                <ProcessTimeline
                                    steps={updProgram.steps}
                                    currentStep={currentStep}
                                    modules={updProgram.modules}
                                    calls={updProgram.calls}
                                    applicationForm={updProgram.applicationForm}
                                />

                            ) : (
                                <EntityResponsibles entity={updProgram} setEntity={setProgram} type={'program'} />
                            )}
                        </Container>

                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="white" style={{ borderColor: "var(--bs-modal-border-color)" }} onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button variant="secondary" type="submit">
                            Save Changes
                        </Button>
                    </Modal.Footer>

                </Form>
            </Modal>
        </>
    );
}

export default PSettingsModal;
