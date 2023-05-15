import React, { useState, useContext } from "react";
import { Form } from 'react-bootstrap';
import { UserContext } from '../../pages/_app'
import Confirmation from "./Start/ArrivalConfirmation";
import ManageStep from "./ManageStep";

function GrantApplication({ nextStep, application, current, updateApplication, applicantFiles }) {
    const [documents, setDocuments] = useState(application.documentsPrepared || false);
    const [applied, setApplied] = useState(application.grantApplied || false);

    let cpeeStep, programId;

    if (application) {
        cpeeStep = application.callback && application.callback.step;
        programId = application.programId;
    }

    const save = async () => {
        if (cpeeStep === 'prepare_application') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/prepare_application', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        documents,
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }

        if (cpeeStep === 'apply_grant') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/apply_grant', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        applied,
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
        if ((cpeeStep === 'prepare_application' && documents) || (cpeeStep === 'apply_grant' && applied))
            return true;
        return false;
    }

    function stepOver() {
        if (application.documentsPrepared && applied)
            return true;
        return false;
    }

    return (
        <Form.Group>

            {(!current || (current && ['prepare_application', 'apply_grant'].includes(cpeeStep))) &&
                <Confirmation
                    label={'You should prepare the required documents for the application'}
                    confirmation={documents}
                    setConfirmation={setDocuments}
                    current={cpeeStep === 'prepare_application'}
                />
            }

            {(!current || (current && ['apply_grant'].includes(cpeeStep))) &&
                <Confirmation
                    label={'You should apply'}
                    confirmation={applied}
                    setConfirmation={setApplied}
                    current={cpeeStep === 'apply_grant'}
                />
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

export default GrantApplication;
