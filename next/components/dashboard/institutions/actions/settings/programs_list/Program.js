import { useState, useEffect } from 'react';
import ProgramDetails from './ProgramDetails';

function Program(props) {
    const { program } = props;
    const [programData, setProgramData] = useState({});

    useEffect(() => {
        let id = program.programId;
        fetch(`https://93.90.203.127:4000/api/program/${id}`)
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

    return programData && programData.hasOwnProperty('name') ? (
        <ProgramDetails
            key={program.programId}
            programData={programData}
            program={program}
            isOpen={isOpen}
            toggleOpen={toggleOpen}
        />
    ) : (
        <div key={program.programId}>Loading program data...</div>
    );
};

export default Program;