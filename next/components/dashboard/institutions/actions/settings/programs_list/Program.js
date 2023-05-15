import { useState, useEffect } from 'react';
import ProgramDetails from './ProgramDetails';

function Program({ program, onEditProgram, onFileUpload, onDeleteFile }) {
    const [programData, setProgramData] = useState({});
    useEffect(() => {
        let id = program.programId;
        fetch(`https://www.snorlax.wtf:4000/api/program/${id}`)
            .then((response) => response.json())
            .then((data) => {
                setProgramData(data);
            })
            .catch((error) =>
                console.error(`Error fetching program data for institution: ${error}`)
            );
    }, [program.programId]);

    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    };

    return programData && programData.hasOwnProperty('title') ? (
        <ProgramDetails
            key={program.programId}
            programData={programData}
            application={program}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
            onEditProgram={onEditProgram}
            onFileUpload={onFileUpload}
            onDeleteFile={onDeleteFile}

        />
    ) : (
        <div key={program.programId}>Loading program data...</div>
    );
};

export default Program;