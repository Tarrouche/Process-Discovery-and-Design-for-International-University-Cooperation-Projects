import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import ReactHtmlParser from 'react-html-parser';
function Modules({ application, applyModule, setModule }) {
    const modules = application.modules.modules;
    return (
        <>
            <div className="row">
                <div className="col">
                    <Form.Label>You can apply to modules during the program</Form.Label>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <Form.Label>Choose a module to apply to:</Form.Label>
                </div>
                <Form.Group className="col-3 text-center">
                    <Form.Control
                        as="select"
                        name="method"
                        value={applyModule || 'Apply Module'}
                        onChange={(e) => setModule(e.target.value)}
                    >
                        <option value="Apply Module" disabled>
                            Module
                        </option>
                        {modules.map((module, index) => (
                            <option key={index} value={module.name}>
                                {ReactHtmlParser(module.name)}
                            </option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </div>
            {application.appliedModules && (
                <div className="row">
                    <div className="col">
                        <Form.Label>Applied modules:</Form.Label>
                        {application.appliedModules.map((module, index) => (
                            <div key={index}>
                                <Form.Label>
                                    {ReactHtmlParser(module.name)} applied on {module.date}
                                </Form.Label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default Modules;