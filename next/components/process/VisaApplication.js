import React, { useEffect, useState, useContext } from "react";
import { Form } from 'react-bootstrap';
import ManageStep from "./ManageStep";
import Confirmation from "./Start/ArrivalConfirmation";
import { UserContext } from '../../pages/_app';


function VisaApplication({ nextStep, application, current, country, updateApplication, applicantFiles }) {
    const [visa, setVisa] = useState(application.visaChecked);
    const [information, setInformation] = useState({});
    const { user } = useContext(UserContext);

    let cpeeStep, programId;
    if (application) {
        cpeeStep = application.callback && application.callback.step;
        programId = application.programId;
    }

    function stepOver() {
        if (visa)
            return true;
        return false;
    }

    function submittedChanges() {
        if (visa)
            return true;
        return false;
    }


    const save = async () => {
        try {
            const response = await fetch('https://snorlax.wtf:4000/api/cpee/callback/check_visa', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    visa,
                    programId
                }),
                credentials: 'include'
            });

            const result = await response.json(); // Parse the JSON response
        } catch (error) {
            console.error(error); // Handle any errors that occur during the fetch request
        }
    }

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch information from an API or other data source
        const fetchInformation = async () => {
            try {
                setLoading(true);
                // Make an API call or fetch data from other source
                const response = await fetch(`https://snorlax.wtf:4000/api/visa?nationality=${user.nationality}&country=${country}`);
                const data = await response.json();
                setInformation(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch information:", error);
                setLoading(false);
            }
        };
        if (user.nationality)
            fetchInformation();
    }, [user.nationality]);

    return (
        <Form.Group>
            <div className="row">
                <div className="col">
                    {loading ? (
                        <div>Loading information...</div>
                    ) : (
                        <>
                            {user.nationality ?
                                <div>
                                    <Form.Label>
                                        The information below is provided by Wikipedia for {user.nationality}s entering {country}:
                                    </Form.Label>

                                    {information.message ? (
                                        <p>No information found about the selected pair.</p>
                                    ) : (
                                        <ul>
                                            {information.visa && (
                                                <li>
                                                    <strong>Requirement:</strong> {information.visa}
                                                </li>
                                            )}
                                            {information.stay && (
                                                <li>
                                                    <strong>Stay:</strong> {information.stay}
                                                </li>
                                            )}
                                            {information.notes && (
                                                <li>
                                                    <strong>Notes:</strong> {information.notes}
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                :
                                <Form.Label>
                                    Please make sure to update your nationality to have more information about the visa requirements.
                                </Form.Label>
                            }
                        </>

                    )}

                </div>
            </div>

            <Confirmation
                label={`Check whether a visa application is required`}
                confirmation={visa}
                setConfirmation={setVisa}
                current={cpeeStep === 'check_visa'}
            />

            {current &&
                <ManageStep
                    submittedChanges={submittedChanges()}
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

export default VisaApplication;