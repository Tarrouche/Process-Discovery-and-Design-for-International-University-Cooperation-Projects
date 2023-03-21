import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faSignOutAlt, faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Form, Dropdown } from 'react-bootstrap';

function PAdd(props) {
    const { allPrograms, alreadyAddedPrograms, onSelectProgram } = props;
    const [inputValue, setInputValue] = useState('');
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [programParameters, setProgramParameters] = useState({ in: false, out: false });
    const handleProgramChange = (event) => {
        const input = event.target.value;
        setInputValue(input);
        const filtered = allPrograms.filter(
            (program) => program.name.toLowerCase().startsWith(input.toLowerCase()) && !alreadyAddedPrograms.some((addedProgram) => addedProgram.programId === program.programId)
        );
        setFilteredPrograms(filtered);
    };

    const handleInCheckboxChange = () => {
        setProgramParameters((prevProgramParameters) => ({
            ...prevProgramParameters,
            in: !prevProgramParameters.in,
        }));
    };

    const handleOutCheckboxChange = () => {
        setProgramParameters((prevProgramParameters) => ({
            ...prevProgramParameters,
            out: !prevProgramParameters.out,
        }));
    };

    const handleSelect = (program) => {
        setInputValue(program.name);
        setFilteredPrograms([]);
        onSelectProgram(program, programParameters);
    };

    return (
        <>
            <Form.Group controlId="formBasicProgram">
                <div className="d-flex flex-row justify-content-between">
                    <div className="w-50">
                        <FontAwesomeIcon icon={faPlus} className="px-1" /><Form.Label>Add Program</Form.Label>
                    </div>
                    <div className="w-50 d-flex flex-row justify-content-end align-items-center">

                        <Form.Label>Incoming</Form.Label>
                        <FontAwesomeIcon
                            icon={faSignInAlt}
                            onClick={handleInCheckboxChange}
                            style={programParameters.in ? { color: 'green' } : {}}
                            className="px-2 pb-1"
                        />
                        <Form.Label>Outgoing</Form.Label>
                        <FontAwesomeIcon
                            icon={faSignOutAlt}
                            onClick={handleOutCheckboxChange}
                            style={programParameters.out ? { color: 'green' } : {}}
                            className="px-2 pb-1"
                        />
                    </div>
                </div>
                <Form.Control
                    type="text"
                    placeholder="Program"
                    value={inputValue}
                    onChange={handleProgramChange}
                />

                <Dropdown show={filteredPrograms.length}>
                    <Dropdown.Menu>
                        {filteredPrograms.map((program) => (
                            <Dropdown.Item key={program.programId} eventKey={program.programId} onClick={() => handleSelect(program)}>
                                {program.name}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>

            </Form.Group>

        </>
    );
}

export default PAdd;