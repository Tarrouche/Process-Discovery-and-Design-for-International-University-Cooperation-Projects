import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { Form, Dropdown } from 'react-bootstrap';

function PRemove(props) {
    const { allPrograms, onSelectProgram } = props;
    const [inputValue, setInputValue] = useState('');
    const [filteredPrograms, setFilteredPrograms] = useState([]);

    const handleProgramChange = (event) => {
        const input = event.target.value;
        setInputValue(input);
        const filtered = allPrograms.filter((program) => program.name.toLowerCase().startsWith(input.toLowerCase()));
        setFilteredPrograms(filtered);
    };

    const handleSelect = (program) => {
        setInputValue(program.name);
        setFilteredPrograms([]);
        onSelectProgram(program);
    };

    return (
        <Form.Group controlId="formBasicProgram">
            <Form.Label><FontAwesomeIcon icon={faMinus} className="px-1" />Remove Program</Form.Label>
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
                            {program.offerer} - {program.title}
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown>
        </Form.Group>
    );
}

export default PRemove;