import React, { useState } from "react";
import { Form, Button } from 'react-bootstrap';

function FinalReport({ updProgram, setProgram }) {

    const [reportFrequency, setReportFrequency] = useState({
        type: 'Within',
        n: (updProgram.finalReport && updProgram.finalReport.frequency && updProgram.finalReport.frequency.n) || '',
        unit: (updProgram.finalReport && updProgram.finalReport.frequency && updProgram.finalReport.frequency.unit) || ''
    });

    if (!updProgram.calls) {
        setProgram({
            ...updProgram,
            finalReport: {}
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
            finalReport: {
                ...updProgram.finalReport,
                frequency: {
                    ...updProgram.finalReport.frequency,
                    [name]: value
                }
            }
        });
    };


    return (
        <>
            <Form.Group controlId="formBasicFinalReport">
                <h6 className="pt-3">Final Report</h6>
                <div className="row">
                    <div className="col-3">
                        <Form.Control as="select" name="state" value={(updProgram.finalReport && updProgram.finalReport.state) || 'Final Report'} onChange={(e) => {
                            const newState = e.target.value;
                            setProgram({
                                ...updProgram,
                                finalReport: { ...updProgram.finalReport, state: newState }
                            });
                            if (newState !== 'Required') {
                                setReportFrequency('');
                                setProgram({
                                    ...updProgram,
                                    finalReport: { ...updProgram.finalReport, state: newState, frequency: {} }
                                });
                            }
                        }}>
                            <option value="Final Report" disabled>Final report required?</option>
                            {['Required', 'Not Required'].map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </Form.Control>
                    </div>
                    {updProgram.finalReport && updProgram.finalReport.state === 'Required' &&
                        <>
                            <div className="col-3">
                                <Form.Control as="select" name="type" value={reportFrequency.type || 'Frequency'} onChange={handleReportFrequencyChange}>
                                    <option value="Frequency">Within</option>
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

export default FinalReport;
