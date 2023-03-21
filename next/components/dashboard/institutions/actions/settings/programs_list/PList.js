import { Form } from 'react-bootstrap';
import Program from './Program';
import PAdd from './PAdd';
import PRemove from './PRemove';



function PList({ programs, allPrograms, updInstitution, setInstitution }) {

    const handleAddProgram = (program, programParameters) => {
        setInstitution({
            ...updInstitution,
            programs: [
                ...updInstitution.programs,
                { programId: program.programId, name: program.name, location: program.location, in: programParameters.in, out: programParameters.out }
            ]
        });
    };

    const handleRemoveProgram = (program) => {
        const updatedPrograms = updInstitution.programs.filter(p => p.programId !== program.programId);
        setInstitution({
            ...updInstitution,
            programs: updatedPrograms
        });
    };
    return (
        <>
            <Form.Group controlId="formBasicPrograms">
                {programs.length > 0 && <Form.Label>Programs</Form.Label>}
                {programs.map((program) => {
                    return <Program key={program.programId} program={program} />;

                })}
            </Form.Group>

            <PAdd
                allPrograms={allPrograms}
                alreadyAddedPrograms={programs}
                onSelectProgram={handleAddProgram}
            />
            <PRemove
                allPrograms={programs}
                onSelectProgram={handleRemoveProgram}
            />

        </>
    );
}

export default PList;
