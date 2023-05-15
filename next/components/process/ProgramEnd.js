import React, { useState } from "react";
import { Form } from 'react-bootstrap';
import ManageStep from "./ManageStep";
import Confirmation from "./Start/ArrivalConfirmation";

function ProgramEnd({ application, nextStep, current, finalReport, updateApplication, applicantFiles }) {
    const [submit, setSubmit] = useState(application.finalReportSubmitted || false);
    let cpeeStep, programId;
    if (application) {
        cpeeStep = application.callback && application.callback.step;
        programId = application.programId;
    }
    function stepOver() {
        if (!finalReport.state === 'Required' || submit)
            return true;
        return false;
    }

    function submittedChanges() {
        if (!finalReport.state === 'Required' || submit)
            return true;
        return false;
    }

    const save = async () => {
        if (cpeeStep === 'final_report') {
            const today = new Date();
            const day = today.getDate().toString().padStart(2, '0');
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear().toString();

            const todayFormatted = `${day}.${month}.${year}`;
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/final_report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        date: todayFormatted,
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
    return (
        <Form.Group>
            {finalReport.state === 'Required' &&
                <Confirmation
                    label={`You should submit a final report within ${finalReport.frequency.n} ${finalReport.frequency.unit}`}
                    confirmation={submit}
                    setConfirmation={setSubmit}
                    current={cpeeStep == 'final_report'}
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

export default ProgramEnd;