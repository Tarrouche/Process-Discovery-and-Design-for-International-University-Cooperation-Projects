import PEditModal from './actions/PEditModal';
import PSettingsModal from './actions/PSettingsModal';
import PDeleteModal from './actions/PDeleteModal';

const ProgramsTable = ({ programs, onEditProgram, onSetProgram, onDeleteProgram }) => {
    const handleEditProgram = (id, program) => {
        onEditProgram(id, program);
    };

    const handleSetProgram = (id, data) => {
        onSetProgram(id, data);
    };

    const handleDeleteProgram = (id) => {
        onDeleteProgram(id);
    };

    return (
        <>
            <h2 className="mt-4 mb-4">Programs</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th className='dashbord-icon-cell'>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {programs.map(program => (
                        <tr key={program.programId}>
                            <td>{program.name}</td>
                            <td>{program.location}</td>
                            <td>{program.typeOfProgram.length > 0 && program.typeOfProgram.join('/')}</td>
                            <td className='dashbord-icon-cell'>
                                <PEditModal
                                    program={program}
                                    onEdit={handleEditProgram}
                                />

                                <PSettingsModal
                                    program={{ programId: program.programId, responsibles: program.responsibles }}
                                    onSet={handleSetProgram}
                                />

                                <PDeleteModal
                                    id={program.programId}
                                    name={program.name}
                                    onDelete={handleDeleteProgram}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <PEditModal
                program={{ name: '', location: '', logo: '', typeOfProgram: [], funded: { funded: false, fundingRequirements: [''], fundingAllowances: [''] } }}
                onEdit={handleEditProgram}
            />
        </>
    );
};

export default ProgramsTable;