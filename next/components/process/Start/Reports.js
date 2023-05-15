import React from 'react';
import { Form } from 'react-bootstrap';

function Reports({ application, submit, setSubmit, deadline }) {
    const frequency = application.reports && application.reports.frequency;

    const handleSubmitChange = (event) => {
        setSubmit(event.target.checked);
    };

    return (
        <div>
            <div className="row">
                <div className="col">
                    <Form.Label>You should submit a report {frequency.type} {frequency.n} {frequency.unit}</Form.Label>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Form.Label>Next report should be submitted {frequency.type === 'after' ? 'after' : 'before'} {deadline}</Form.Label>
                </div>
                <Form.Group className="col-3 text-center">
                    <Form.Label>{submit ? "Submitted" : "Not yet"}</Form.Label>
                    <Form.Check
                        type="checkbox"
                        name="submit"
                        checked={submit}
                        onChange={handleSubmitChange}
                    />
                </Form.Group>
            </div>
            {application.submittedReports &&
                <div className="row">
                    <div className="col">
                        <Form.Label>Submitted reports:</Form.Label>
                        {application.submittedReports.map((report, index) => (
                            <div key={index}>
                                <Form.Label>{report.date} - {report.deadline}</Form.Label>
                            </div>
                        ))}
                    </div>
                </div>
            }
        </div>
    );
}

export default Reports;
