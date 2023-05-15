import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { faPlus, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';



const TimeStepInput = ({ step, filters, setFilters, index }) => {
    const [timeValue, setTimeValue] = useState('');
    const [withinValue, setWithinValue] = useState('-');
    const [nValue, setNValue] = useState('');

    const handleButtonClick = () => {
        // construct the new step object
        let addition;
        if (withinValue === 'Within')
            addition = 'after';
        else
            addition = 'from';
        const newStep = {
            within: withinValue,
            n: nValue,
            time: timeValue,
            step: `${withinValue} ${nValue} ${timeValue} ${addition} ${step.step}`,
            edit: step.step
        };
        // TODO: handle updating the filters state with the new step object
        const updatedSteps = [...filters.steps];
        updatedSteps[index] = newStep;
        // update the filters state with the updated steps array
        setFilters({ ...filters, steps: updatedSteps });

    };
    return (
        <Form.Group controlId="BasicFilterInput">
            <div className='row'>
                <div className='col-3'>
                    <Form.Label>{step.step.replace('#T ', '')}</Form.Label>
                </div>
                <div className='col-2'>
                    <Form.Control as="select" name="within" value={withinValue || "-"} onChange={(e) => setWithinValue(e.target.value)}>
                        {['-', 'After', 'Before', 'Within'].map((within) => (
                            <option key={within} value={within}>
                                {within}
                            </option>
                        ))}
                    </Form.Control>
                </div>
                <div className='col-2'>
                    <Form.Control type="number" placeholder="n" value={nValue || 0} onChange={(e) => setNValue(e.target.value)} />
                </div>
                <div className='col-3'>
                    <Form.Control as="select" name="time" value={timeValue || "Time"} onChange={(e) => setTimeValue(e.target.value)}>
                        <option value="Time" disabled>D/W/M/Y</option>
                        {['day(s)', 'week(s)', 'month(s)', 'year(s)'].map((time) => (
                            <option key={time} value={time}>
                                {time}
                            </option>
                        ))}
                    </Form.Control>
                </div>
                <div className='col-2'>
                    <Button
                        onClick={handleButtonClick}
                        style={{ border: 'none', background: 'none', color: 'inherit' }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </div>
            </div>
        </Form.Group>
    );
};

export default TimeStepInput;
