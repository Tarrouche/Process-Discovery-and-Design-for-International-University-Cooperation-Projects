import React from "react";
import { Form } from 'react-bootstrap';
import ReactHtmlParser from 'react-html-parser';


function Calls({ updProgram, setProgram }) {

    if (!updProgram.calls) {
        setProgram({
            ...updProgram,
            calls: {}
        });
    };
    return (
        <>

            <Form.Group controlId="formBasicApplicationForm">
                <h6 className="pt-3">Calls</h6>
                <div className="row">
                    <div className="col-4">

                        <Form.Control as="select" name="state" value={(updProgram.calls && updProgram.calls.state) || 'Calls'} onChange={(e) => setProgram({
                            ...updProgram,
                            calls: { ...updProgram.calls, state: e.target.value }
                        })}>
                            <option value="Calls" disabled>Calls available?</option>
                            {['Available', 'Required', 'Not Available'].map((state) => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </Form.Control>
                    </div>
                    {['Required', 'Available'].includes(updProgram.calls.state) &&
                        <div className="col">
                            <Form.Control type="text" name="source" placeholder="Enter soure" value={updProgram.calls && ReactHtmlParser(updProgram.calls.source)} onChange={(e) => setProgram({
                                ...updProgram,
                                calls: { ...updProgram.calls, source: e.target.value }
                            })} />
                        </div>
                    }
                </div>

            </Form.Group>
        </>

    );
}

export default Calls;
