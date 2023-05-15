import React, { useEffect, useState, useRef } from "react";
import { faPlus, faMinus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, Button, Table, Dropdown } from 'react-bootstrap';
import ReactHtmlParser from 'react-html-parser';

export default function TargetsConditions({ international, targets, setTargets }) {
    const [target, setTarget] = useState("");
    const [condition, setCondition] = useState("");

    const handleAddCondition = () => {

        if (target) {
            setTargets((prevState) => {
                const updatedTargets = [...prevState];
                const targetIndex = updatedTargets.findIndex(
                    (tgt) => tgt.country === target
                );
                if (targetIndex >= 0) {
                    const conditions = updatedTargets[targetIndex].conditions || []; // use an empty array if conditions is null or undefined

                    const updatedConditions = [
                        ...conditions,
                        condition,
                    ];
                    updatedTargets[targetIndex] = {
                        ...updatedTargets[targetIndex],
                        conditions: updatedConditions,
                    };
                } else {
                    updatedTargets.push({
                        country: target,
                        conditions: [condition],
                    });
                }
                return updatedTargets;
            });
            setTarget("");
            setCondition("");
        }
    };

    function deleteConditions(targetIndex) {
        const newTargets = [...targets];
        const target = newTargets[targetIndex];
        target.conditions = [];
        setTargets(newTargets);
    }

    function containsConditions(targets) {
        if (targets && targets.length !== 0) {
            for (let i = 0; i < targets.length; i++) {
                if (targets[i].conditions && targets[i].conditions.length > 0)
                    return true;
            }
        }
        return false;
    }

    return (
        <>

            <Form.Group controlId="formBasicCondition">
                <h6 className="pt-3">Conditions for applicants from specific countries</h6>
                <div className="row">
                    <div className="col-3">
                        <Form.Control as="select" name="target" value={target} onChange={(e) => setTarget(e.target.value)}>
                            <option >
                                Select a country
                            </option>

                            {international ?
                                international.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))
                                :
                                targets && targets.map((target) => (
                                    <option key={target.country} value={target.country}>
                                        {target.country}
                                    </option>
                                ))}
                        </Form.Control>
                    </div>
                    <div className="col">
                        <Form.Control type="text" name="condition" placeholder="Enter condition" value={condition} onChange={(e) => setCondition(e.target.value)} />
                    </div>
                    <div className="col-auto">
                        <Button onClick={handleAddCondition} className="btn btn-secondary">
                            <FontAwesomeIcon
                                icon={faPlus}
                            />
                        </Button>
                    </div>
                </div>
            </Form.Group>
            {
                containsConditions(targets) &&
                <Table>
                    <thead>
                        <tr>
                            <th>Target</th>
                            <th>Conditions</th>
                            <th className='dashbord-icon-cell'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {targets.map((target, index) =>
                            target.conditions && (
                                <tr key={target.country}>
                                    <td>{target.country}</td>
                                    <td>
                                        {target.conditions.map((condition, index) => (
                                            <div key={index}>{ReactHtmlParser(condition)}</div>
                                        ))}
                                    </td>
                                    <td className='dashbord-icon-cell'>
                                        <Button
                                            onClick={() => deleteConditions(index)}
                                            style={{ border: 'none', background: 'none', color: 'inherit' }}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </td>
                                </tr>
                            )
                        )}
                    </tbody>
                </Table>

            }
        </>
    );
}
