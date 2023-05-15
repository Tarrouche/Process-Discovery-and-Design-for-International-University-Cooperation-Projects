import React from "react";
import { Form } from 'react-bootstrap';
import ReactHtmlParser from 'react-html-parser';


function ApplicationForm({ updProgram, setProgram }) {

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setProgram(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <>
            <Form.Group controlId="formBasicApplicant">
                <h6 className="">Applicant</h6>
                <Form.Control as="select" name="applicant" value={updProgram.applicant || 'Applicant'} onChange={handleInputChange}>
                    <option value="Applicant" disabled>Who should submit the application?</option>
                    {['Institution', 'User'].map((applicant) => (
                        <option key={applicant} value={applicant}>
                            {applicant}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            <Form.Group controlId="formBasicApplicationForm">
                <h6 className="pt-3">Application Form</h6>
                <div className="row">
                    <div className="col-4">

                        <Form.Control as="select" name="method" value={(updProgram.applicationForm && updProgram.applicationForm.method) || 'Application Form'} onChange={(e) => setProgram({
                            ...updProgram,
                            applicationForm: { ...updProgram.applicationForm, method: e.target.value }
                        })}>
                            <option value="Application Form" disabled>Submission via?</option>
                            {['Platform', 'Mail', 'Post'].map((method) => (
                                <option key={method} value={method}>
                                    {method}
                                </option>
                            ))}
                        </Form.Control>
                    </div>
                    {Object.keys(updProgram.applicationForm).length > 0 &&
                        <div className="col">
                            <Form.Control type="text" name="endpoint" placeholder="Enter endpoint" value={updProgram.applicationForm && ReactHtmlParser(updProgram.applicationForm.endpoint)} onChange={(e) => setProgram({
                                ...updProgram,
                                applicationForm: { ...updProgram.applicationForm, endpoint: e.target.value }
                            })} />
                        </div>
                    }
                </div>

            </Form.Group>
        </>

    );
}

export default ApplicationForm;
