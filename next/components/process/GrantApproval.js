import React, { useState } from "react";
import { Form } from 'react-bootstrap';
import ProcessPeriodInput from "./PeriodInput";
import Confirmation from "./Start/ArrivalConfirmation";
import ManageStep from "./ManageStep";

function GrantApproval({ nextStep, application, current, updateApplication, applicantFiles }) {
    const [confirmation, setConfirmation] = useState(application.fundingApproved);
    const [period, setPeriod] = useState(application.fundingPeriod || { start: '', end: '' });

    let cpeeStep, programId;

    if (application) {
        cpeeStep = application.callback && application.callback.step;
        programId = application.programId;
    }

    const save = async () => {
        if (cpeeStep === 'wait_grant') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/wait_grant', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        approval: confirmation,
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }

        if (cpeeStep === 'confirm_participation') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/confirm_participation', {
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
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }
    }

    function submittedChanges() {
        if ((cpeeStep === 'wait_grant' && confirmation !== undefined) || (cpeeStep === 'confirm_participation' && period.start))
            return true;
        return false;
    }

    function stepOver() {
        if (confirmation && period.start)
            return true;
        return false;
    }

    return (
        <Form.Group>

            {(!current || (current && ['wait_grant', 'confirm_participation'].includes(cpeeStep))) &&
                <Confirmation
                    label={'You should confirm your participation'}
                    confirmation={confirmation}
                    setConfirmation={setConfirmation}
                    current={cpeeStep === 'wait_grant'}
                />
            }

            {(!current || (current && ['confirm_participation'].includes(cpeeStep))) &&
                <ProcessPeriodInput period={'Grant period'} updPeriod={period} setPeriod={setPeriod} />
            }

            {current &&
                <ManageStep submittedChanges={submittedChanges()}
                    stepOver={stepOver()}
                    save={save}
                    nextStep={nextStep}
                    updateApplication={updateApplication}
                    applicantFiles={applicantFiles}
                />
            }

        </Form.Group>
    );
}

export default GrantApproval;