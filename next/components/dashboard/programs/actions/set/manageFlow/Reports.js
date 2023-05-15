import React, { useState } from "react";
import { Form, Button } from 'react-bootstrap';

function Reports({ updProgram, setProgram }) {

    const [reportFrequency, setReportFrequency] = useState({
        type: (updProgram.reports && updProgram.reports.frequency && updProgram.reports.frequency.type) || '',
        n: (updProgram.reports && updProgram.reports.frequency && updProgram.reports.frequency.n) || '',
        unit: (updProgram.reports && updProgram.reports.frequency && updProgram.reports.frequency.unit) || ''
    });

    if (!updProgram.calls) {
        setProgram({
            ...updProgram,
            reports: {}
        });
    };

    const handleReportFrequencyChange = (e) => {
        const value = e.target.value;
        const name = e.target.name;

        setReportFrequency({
            ...reportFrequency,
            [name]: value
        });

        setProgram({
            ...updProgram,
            reports: {
                ...updProgram.reports,
                frequency: {
                    ...updProgram.reports.frequency,
                    [name]: value
                }
            }
        });
    };


    return (
        <>
            <Form.Group controlId="formBasicReports">
                <h6 className="pt-3">Reports</h6>
                <div className="row">
                    <div className="col-3">
                        <Form.Control as="select" name="state" value={(updProgram.reports && updProgram.reports.state) || 'Reports'} onChange={(e) => {
                            const newState = e.target.value;
                            setProgram({
                                ...updProgram,
                                reports: { ...updProgram.reports, state: newState }
                            });
                            if (newState !== 'Required') {
                                setReportFrequency('');
                                setProgram({
                                    ...updProgram,
                                    reports: { ...updProgram.reports, state: newState, frequency: {} }
                                });
                            }
                        }}>
                            <option value="Reports" disabled>Reports required?</option>
                            {['Required', 'Not Required'].map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </Form.Control>
                    </div>
                    {updProgram.reports && updProgram.reports.state === 'Required' &&
                        <>
                            <div className="col-3">
                                <Form.Control as="select" name="type" value={reportFrequency.type || 'Frequency'} onChange={handleReportFrequencyChange}>
                                    <option value="Frequency" disabled>Frequency</option>
                                    <option value="every">Every</option>
                                    <option value="after">After</option>
                                    <option value="before">Before</option>
                                </Form.Control>
                            </div>
                            <div className="col-3">
                                <Form.Control type="number" placeholder="Frequency" name="n" value={reportFrequency.n} onChange={handleReportFrequencyChange} />
                            </div>
                            <div className="col-3">
                                <Form.Control as="select" name="unit" value={reportFrequency.unit || 'Unit'} onChange={handleReportFrequencyChange}
                                >
                                    <option value="Unit" disabled>Unit</option>
                                    <option value="weeks">Weeks</option>
                                    <option value="months">Months</option>
                                </Form.Control>
                            </div>
                        </>
                    }
                </div>
            </Form.Group>
        </>
    );
}

export default Reports;
