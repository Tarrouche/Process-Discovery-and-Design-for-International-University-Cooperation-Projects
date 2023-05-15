import React, { useState } from "react";
import { Form, Container } from 'react-bootstrap';
import ProcessPeriodInput from "../PeriodInput";
import Reports from "./Reports";
import Modules from "./Modules";
import EndProgram from "./End";
import Confirmation from "./ArrivalConfirmation";
import TabButtons from "../../dashboard/programs/actions/TabButtons";
import ManageStep from "../ManageStep";


function ProgramStart({ nextStep, application, current, updateApplication, applicantFiles }) {
    const [arrivalConfirmation, setConfirmation] = useState(application.arrivalConfirmed || false);
    const [period, setPeriod] = useState(application.programPeriod || { start: '20.04.2022', end: '20.04.2023' });
    const [submitReport, setSubmit] = useState(false);
    const [applyModule, setModule] = useState('');
    const actions = [];
    if (application.reports && application.reports.state === 'Required')
        actions.push('Reports');
    if (application.modules && application.modules.state === 'Available')
        actions.push('Modules')
    actions.push('Parameters')

    const [window, setWindow] = useState(actions[0]);


    let cpeeStep, programId;
    if (application) {
        cpeeStep = application.callback && application.callback.step;
        programId = application.programId;
    }

    let nextReportDateString;
    if (window === 'Reports') {
        const frequency = application.reports && application.reports.frequency;
        let startDateParts;
        if (application.submittedReports && application.submittedReports.length > 0) {
            startDateParts = application.submittedReports[application.submittedReports.length - 1].deadline.split('.');
        } else {
            startDateParts = application.programPeriod.start.split('.');
        }
        const startDate = new Date(parseInt(startDateParts[2]), parseInt(startDateParts[1]) - 1, parseInt(startDateParts[0]));
        console.log(startDate);
        // Determine the frequency of the reports (in weeks or months)
        let unit, n;
        if (!frequency) {
            unit = 'weeks';
            n = 2;
        } else {
            unit = frequency.unit;
            n = frequency.n;
        }

        // Calculate the next report date based on the frequency
        let nextReportDate;
        if (unit === 'weeks') {
            // Add n weeks to the start date to get the next report date
            nextReportDate = new Date(startDate.getTime() + n * 7 * 24 * 60 * 60 * 1000);
        } else if (unit === 'months') {
            // Add n months to the start date to get the next report date
            const yearsToAdd = Math.floor(n / 12);
            const monthsToAdd = n % 12;
            nextReportDate = new Date(startDate.getFullYear() + yearsToAdd, startDate.getMonth() + monthsToAdd, startDate.getDate());
        }
        // Format the next report date as a string in the same format as period.start
        nextReportDateString = `${nextReportDate.getDate()}.${nextReportDate.getMonth() + 1}.${nextReportDate.getFullYear()}`;
    }
    const save = async () => { //nextReportDate is for report submission
        if (cpeeStep == 'start_funding' && arrivalConfirmation !== undefined) {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/start_funding', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        approval: arrivalConfirmation,
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }
        if (cpeeStep == 'perform_actions') {
            const today = new Date();
            const day = today.getDate().toString().padStart(2, '0');
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const year = today.getFullYear().toString();

            const todayFormatted = `${day}.${month}.${year}`;
            if (submitReport) {
                try {
                    const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/submit_report', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            date: todayFormatted,
                            deadline: nextReportDateString,
                            programId
                        }),
                        credentials: 'include'
                    });

                    const result = await response.json(); // Parse the JSON response
                    setSubmit(false);
                } catch (error) {
                    console.error(error); // Handle any errors that occur during the fetch request
                }
            }
            if (!(period.start === application.programPeriod.start && period.end === application.programPeriod.end)) {
                try {
                    const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/change_period', {
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
            if (applyModule) {
                try {
                    const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/apply_module', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: applyModule,
                            date: todayFormatted,
                            programId
                        }),
                        credentials: 'include'
                    });

                    const result = await response.json(); // Parse the JSON response
                    setModule('');
                } catch (error) {
                    console.error(error); // Handle any errors that occur during the fetch request
                }
            }
        }
    }

    const end = async () => {
        if (cpeeStep == 'perform_actions') {
            try {
                const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/stop_program', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        programId
                    }),
                    credentials: 'include'
                });

                const result = await response.json(); // Parse the JSON response
            } catch (error) {
                console.error(error); // Handle any errors that occur during the fetch request
            }
        }
        nextStep();
    }


    function submittedChanges() {
        return ((cpeeStep == 'start_funding' && arrivalConfirmation) || (cpeeStep == 'perform_actions' && (applyModule || submitReport || !(period.start === application.programPeriod.start && period.end === application.programPeriod.end))));
    }

    return (
        <Form.Group>
            {(!current || (current && ['start_funding', 'perform_actions'].includes(cpeeStep))) &&
                <Confirmation
                    label={'You should first confirm your arrival'}
                    confirmation={arrivalConfirmation}
                    setConfirmation={setConfirmation}
                />
            }

            {(!current || (current && ['perform_actions'].includes(cpeeStep))) &&
                <div className="pt-3 pb-5">
                    <TabButtons
                        options={actions}
                        activeOption={window}
                        onChange={setWindow}
                    />

                    <Container className="py-4" style={{ border: "1px solid", borderRadius: "var(--bs-modal-border-radius)", borderColor: "var(--bs-modal-border-color)" }}>

                        {window === 'Reports' ? (
                            <Reports
                                application={application}
                                submit={submitReport}
                                setSubmit={setSubmit}
                                deadline={nextReportDateString}
                            />

                        ) : window === 'Modules' ? (
                            <Modules
                                application={application}
                                applyModule={applyModule}
                                setModule={setModule}
                            />

                        ) : (

                            <>
                                <ProcessPeriodInput period={'Program period'} updPeriod={period} setPeriod={setPeriod} />

                                <EndProgram end={end} />

                            </>
                        )}
                    </Container>

                </div>
            }

            {current &&
                <ManageStep submittedChanges={submittedChanges()}
                    save={save}
                    nextStep={nextStep}
                    updateApplication={updateApplication}
                    applicantFiles={applicantFiles}

                />
            }
        </Form.Group>
    );
}

export default ProgramStart;