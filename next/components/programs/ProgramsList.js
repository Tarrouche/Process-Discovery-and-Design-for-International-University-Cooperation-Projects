import ProgramCard from '../cards/program/PCard';
import { PageContext } from './Programs';
import React, { useContext } from 'react';
import { Pagination } from 'react-bootstrap';

const ProgramsList = ({ filteredPrograms, applications }) => {
    const { pageNumber, setPageNumber } = useContext(PageContext);
    const programsPerPage = 5;

    const handleNextPage = () => {
        setPageNumber(pageNumber + 1);
    };

    const handlePrevPage = () => {
        setPageNumber(pageNumber - 1);
    };

    // Extract the programs for the current page
    const totalPages = Math.ceil(filteredPrograms.length / programsPerPage);
    const startIndex = (pageNumber - 1) * programsPerPage;
    const endIndex = Math.min(startIndex + programsPerPage, filteredPrograms.length);
    const currentPrograms = filteredPrograms.slice(startIndex, endIndex);

    return (

        <>
            <div className="accordion bg-white" id="accordionExample">
                {currentPrograms.map((program, index) => (
                    <ProgramCard
                        key={`prog-${index + pageNumber * programsPerPage}`}
                        program={program}
                        applications={applications}
                    />
                ))}
            </div>

            <div className='d-flex justify-content-center pt-3'>
                <Pagination >
                    <Pagination.Prev onClick={handlePrevPage} disabled={pageNumber === 1} />
                    {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item key={index + 1} active={index + 1 === pageNumber} onClick={() => setPageNumber(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                    <Pagination.Next onClick={handleNextPage} disabled={pageNumber === totalPages} />
                </Pagination>
            </div>
        </>
    )
};

export default ProgramsList;