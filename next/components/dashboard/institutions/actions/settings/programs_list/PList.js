import { Form } from 'react-bootstrap';
import Program from './Program';
import PAdd from './PAdd';
import PRemove from './PRemove';



function PList({ programs, allPrograms, updInstitution, setInstitution, onFileUpload, onDeleteFile }) {

    const handleAddProgram = (program, programParameters) => {
        setInstitution({
            ...updInstitution,
            programs: [
                ...updInstitution.programs || [],
                { programId: program.programId, offerer: program.offerer, title: program.title, name: updInstitution.name, location: program.location, in: programParameters.in, out: programParameters.out }
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

    const handleEditProgram = (program) => {
        const updatedPrograms = updInstitution.programs.map(p => {
            if (p.programId === program.programId) {
                return program;
            }
            return p;
        });
        setInstitution({
            ...updInstitution,
            programs: updatedPrograms
        });
    };

    return (
        <>
            {programs && programs.length > 0 &&

                <Form.Group controlId="formBasicPrograms">
                    <Form.Label>Programs</Form.Label>
                    {programs.map((program) => {
                        return <Program
                            key={program.applicationId}
                            program={program}
                            onEditProgram={handleEditProgram}
                            onFileUpload={onFileUpload}
                            onDeleteFile={onDeleteFile}
                        />;

                    })}
                </Form.Group>
            }

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
