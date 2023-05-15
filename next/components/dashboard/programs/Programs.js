import PEditModal from './actions/PEditModal';
import PSettingsModal from './actions/PSettingsModal';
import PDeleteModal from './actions/PDeleteModal';
import { UserContext } from '../../../pages/_app';
import { useContext } from 'react';
import ReactHtmlParser from 'react-html-parser';


const ProgramsTable = ({ programs, setPrograms, countries }) => {
    const { user } = useContext(UserContext);

    const handleEditProgram = async (id, program) => { // Edit program by id and handle changes for client
        const { offerer, title, location, website, logo, typeOfProgram, participatingInstitutions, funded, transfer, applicationPeriod, eligiblePositions, applicationForm, calls, modules, reports, finalReport, files, steps } = program;

        if (id) { //edit
            const data = { offerer, title, location, website, logo, typeOfProgram, funded, transfer, applicationPeriod, eligiblePositions };
            console.log(data);
            const response = await fetch(`https://snorlax.wtf:4000/api/program/${id}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
            if (response.ok) {
                let edited = false;
                const updatedPrograms = programs.map((prg) => {
                    if (prg.programId === id) {
                        edited = true;
                        return { ...prg, ...program };
                    } else {
                        return prg;
                    }
                });
                if (!edited) {
                    updatedPrograms.push({ ...program, programId: id });
                }
                setPrograms(updatedPrograms);
            } else {
                response.json().then(data => console.log(data.message + ' (Edit Institution)'));
            }
        } else { //create
            const data = { offerer, title, location, website, logo, typeOfProgram, participatingInstitutions, funded, transfer, applicationPeriod, eligiblePositions, applicationForm, calls, modules, reports, finalReport, files, steps };

            const response = await fetch('https://snorlax.wtf:4000/api/program/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            if (response.ok) {
                response.json().then(data => {
                    const updatedPrograms = programs.map((prg) => {
                        if (prg.programId === id) {
                            return { ...prg, ...program };
                        } else {
                            return prg;
                        }
                    });
                    updatedPrograms.push({ ...program, programId: data.programId, responsibles: [] });

                    setPrograms(updatedPrograms);
                });
            } else {
                response.json().then(data => console.log(data.message + ' (Create Program)'));
            }

        }

    };
    const updateTableAfterUpload = (id, data) => {
        const updatedPrograms = programs.map(program => {
            if (program.programId === id) {
                program.files.push(...data);
            }
            return program;
        });
        setPrograms(updatedPrograms);
    };

    const updateTableAfterDeleteFile = (id, file) => {
        const updatedPrograms = programs.map(program => {
            if (program.programId === id) {
                program.files = program.files.filter(f => f.fileId !== file.fileId);
            }
            return program;
        });
        setPrograms(updatedPrograms);

    };



    const handleSetProgram = async (id, program) => { // Program settings
        const { applicant, applicationForm, calls, modules, reports, finalReport, steps } = program;
        const data = { applicant, applicationForm, calls, modules, reports, finalReport, steps };
        console.log(data);
        const response = await fetch(`https://snorlax.wtf:4000/api/program/${id}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });
        if (response.ok) {
            const updatedPrograms = programs.map((prg) => {
                if (prg.programId === id) {
                    return { ...prg, ...data };
                } else {
                    return prg;
                }
            });
            setPrograms(updatedPrograms);

        } else {
            response.json().then(data => console.log(data.message + ' (Set Program)'));
        }
    };

    const handleDeleteProgram = async (id) => {
        const response = await fetch(`https://snorlax.wtf:4000/api/program/${id}/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id }),
            credentials: 'include'
        });
        if (response.ok) {
            const updPrograms = programs.filter((program) => program.programId !== id);
            setPrograms(updPrograms);
        } else {
            console.log("Program Delete Error");
        }

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
                            <td>{ReactHtmlParser(program.offerer)} - {ReactHtmlParser(program.title)}</td>
                            <td>{program.location.from.state ? program.location.from.state : 'Missing'}/{program.location.to.state ? program.location.to.state : 'Missing'}</td>
                            <td>{program.typeOfProgram.length > 0 && program.typeOfProgram.join('/')}</td>
                            <td className='dashbord-icon-cell'>
                                <PEditModal
                                    program={program}
                                    onEdit={handleEditProgram}
                                    countries={countries}
                                />

                                <PSettingsModal
                                    program={program}
                                    onSet={handleSetProgram}
                                    onFileUpload={updateTableAfterUpload}
                                    onDeleteFile={updateTableAfterDeleteFile}
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
            {user.role === 'Admin' &&
                <PEditModal
                    program={{
                        offerer: '',
                        title: '',
                        website: '',
                        logo: '',
                        transfer: '',
                        typeOfProgram: [],
                        eligiblePositions: {
                            "PhD": true,
                            "PostDoc": true,
                            "Professorship": true
                        },
                        location: { from: { state: '' }, to: { state: '' } },
                        funded: {
                            funded: false,
                            fundingRequirements: [''],
                            fundingAllowances: [''],
                            period: { start: '', end: '' }
                        },
                        applicationPeriod: { start: '', end: '' },
                        applicationForm: {},
                        calls: {
                            state: ''
                        },
                        modules: {
                            state: '',
                            modules: []
                        },
                        reports: {
                            state: '',
                            frequency: {}
                        },
                        finalReport: {
                            state: '',
                            frequency: {}
                        },
                        files: [],
                        steps: []
                    }}
                    onEdit={handleEditProgram}
                    countries={countries}
                />
            }
        </>
    );
};

export default ProgramsTable;