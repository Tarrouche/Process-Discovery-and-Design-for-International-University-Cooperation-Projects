import React, { useState, useContext } from "react";
import { Form, Button } from 'react-bootstrap';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ProcessPeriodInput from "./PeriodInput";
import { UserContext } from '../../pages/_app'
import ManageStep from "./ManageStep";
import Confirmation from "./Start/ArrivalConfirmation";
import ItemSearchDropdown from "./Search";

function MobilitySettlment({ nextStep, application, current, currentStep, updateApplication, applicantFiles }) {
    const [transfer, setTransfer] = useState(application.transfer || false);
    const [approval, setApproval] = useState(application.supervisorApproved);
    const [chosenInstitution, setInstitution] = useState(application.chosenInstitution || { institutionId: '', name: '', country: '' });
    const [iApproval, setInstitutionApproval] = useState(application.institutionApproved);
    const [period, setPeriod] = useState(application.mobilityPeriod || { start: '', end: '' });
    let cpeeStep, programId;
    if (application) {
        cpeeStep = application.callback && application.callback.step;
        programId = application.programId;
    }
    const { setUser } = useContext(UserContext);

    const institutions = ['A', 'B', 'C']


    const save = async () => {
        if (cpeeStep == 'initialization') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        transfer,
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
                setUser(result.message);
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }

        if (cpeeStep == 'supervisor_approval') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/supervisor_approval', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        approval,
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
                setUser(result.message);
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }

        if (cpeeStep === 'institution_approval') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/institution_approval', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        institution: chosenInstitution,
                        approval: iApproval,
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
                setUser(result.message);
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }

        if (cpeeStep === 'mobility_agreement') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/mobility_agreement', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        period,
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
                setUser(result.message);
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }
    };



    function stepOver() {
        if (!transfer || (transfer && approval && chosenInstitution.name && period.start))
            return true;
        return false;
    }

    function submittedChanges() {
        if ((cpeeStep === 'initialization') || (cpeeStep === 'supervisor_approval' && approval !== undefined) || (cpeeStep === 'institution_approval' && iApproval !== undefined) || (cpeeStep === 'mobility_agreement' && period.start))
            return true;
        return false;
    }


    return (
        <Form.Group>
            {(!current || (current && ['initialization', 'supervisor_approval', 'institution_approval', 'mobility_agreement'].includes(cpeeStep))) &&
                <Confirmation
                    label={'Do you envision a transfer?'}
                    confirmation={transfer}
                    setConfirmation={setTransfer}
                    current={cpeeStep == 'initialization'}
                />
            }

            {(!current || (current && ['supervisor_approval', 'institution_approval', 'mobility_agreement'].includes(cpeeStep))) &&
                <Confirmation
                    label={'You should get general approval from your supervisor'}
                    confirmation={approval}
                    setConfirmation={setApproval}
                    current={cpeeStep == 'supervisor_approval'}
                />
            }

            {(!current || (current && ['institution_approval', 'mobility_agreement'].includes(cpeeStep))) &&

                <>
                    {chosenInstitution.name || cpeeStep !== 'institution_approval' ?
                        <div className="row">
                            <div className="col">
                                <Form.Label>Chosen institution: {chosenInstitution.name}</Form.Label>
                            </div>
                            <div className="col-3 text-center">
                                <Button
                                    style={{ border: 'none', background: 'none', color: 'inherit' }}
                                    onClick={() => {
                                        if (cpeeStep == 'institution_approval') {
                                            setInstitution({ ...chosenInstitution, name: '' })
                                        }
                                    }}
                                >

                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        className="text-secondary"
                                    />
                                </Button>
                            </div>
                        </div>
                        :
                        <ItemSearchDropdown
                            items={institutions}
                            setItem={setInstitution}
                            x={chosenInstitution}
                        />

                    }
                    <Confirmation
                        label={'You should get general approval from the institution'}
                        confirmation={iApproval}
                        setConfirmation={setInstitutionApproval}
                        current={cpeeStep == 'institution_approval'}
                    />

                </>
            }

            {(!current || (current && ['mobility_agreement'].includes(cpeeStep))) &&
                <>
                    <div className="row">
                        <div className="col">
                            <Form.Label>After both approvals, you should settle the Mobility Agreement</Form.Label>
                        </div>
                        <div className="col-3 text-center">
                            <Form.Label>{period.start ? "Done" : "Not yet"}</Form.Label>
                        </div>
                    </div>
                    <ProcessPeriodInput period={'Mobility period'} updPeriod={period} setPeriod={setPeriod} />
                </>

            }

            {current &&
                <ManageStep submittedChanges={submittedChanges()}
                    stepOver={stepOver()}
                    save={save}
                    nextStep={nextStep}
                    updateApplication={updateApplication}
                    programId={application.programId}
                    step={currentStep}
                    applicantFiles={applicantFiles}
                />
            }

        </Form.Group>
    );
}

export default MobilitySettlment;
