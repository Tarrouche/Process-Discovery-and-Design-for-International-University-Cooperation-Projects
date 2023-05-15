import { Form, Table } from 'react-bootstrap';
import TimeStepInput from './TimeStepInput';


export default function FilterSteps({ filters, setFilters, processSteps, modules }) {

    const handleFilterAppend = (event) => {
        const { name, value } = event.target;
        //List-Json append
        setFilters(prevState => ({
            ...prevState,
            [`${name}${'s'}`]: [...prevState[`${name}${'s'}`] || [], { [name]: value }]
        }));

    };
    const timelineSteps = processSteps.map(step => step.title);
    const moduleNames = modules.map(module => module.name);
    const steps = [...timelineSteps, ...moduleNames, 'Report', 'Final Report'];
    return (
        <Form.Group controlId="formBasicStep">
            <Form.Label>Steps</Form.Label>
            <Form.Control as="select" name="step" value={filters.step || 'Step'} onChange={handleFilterAppend}>
                <option value="Step" disabled>When needed?</option>
                {steps.map((step) => (
                    <option key={step} value={step}>
                        {step}
                    </option>
                ))}
            </Form.Control>

            {filters.steps && filters.steps.length > 0 &&
                <Table>
                    <thead>
                        <tr>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filters.steps.map((step, index) =>
                        (
                            <tr key={`${index}-${step.step}`} className="align-middle">
                                <td>
                                    {timelineSteps.includes(step.step) ? (
                                        <TimeStepInput step={step} filters={filters} setFilters={setFilters} index={index} />

                                    ) : (
                                        <>{step.step}</>
                                    )}
                                </td>
                            </tr>
                        )
                        )
                        }
                    </tbody>
                </Table>
            }
        </Form.Group>

    );
}
