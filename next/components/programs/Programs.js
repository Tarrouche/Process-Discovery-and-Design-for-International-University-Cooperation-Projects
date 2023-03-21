import { FilterContext } from '../../pages/programs/index';
import FilterBar from '../filters/FilterBar';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
export const PageContext = createContext();
import ProgramsList from './ProgramsList';

const Progs = ({ programs }) => {
    const { filterCriteria, showFilters, setFilterIcon } = useContext(FilterContext);
    const [filteredPrograms, setFilteredPrograms] = useState(programs);
    const [pageNumber, setPageNumber] = useState(1);

    const handleFilterChange = () => {
        const filtered = programs.filter(({ typeOfProgram }) => isFiltered(typeOfProgram));
        setFilteredPrograms(filtered);
        setPageNumber(1);
    };

    //If filters change, call handleFilterChange()
    useEffect(() => {
        handleFilterChange();
    }, [filterCriteria]);

    //Check if program fits the filters chosen on the SideBar
    function isFiltered(typeOfProgram) {
        // If types of programs checked
        if (filterCriteria.typesChecked) {
            for (let i = 0; i < typeOfProgram.length; i++) {
                if (filterCriteria.filters.typeOfProgram[typeOfProgram[i]]) {
                    return true;
                }
            }
            return false;
        }

        // Next filters to add
        return true;
    }

    function manageFilters() {
        setFilterIcon(current => !current);
    }


    return (

        <div className="container pt-4 px-4">
            <br />
            <div className={showFilters ? 'row d-block d-lg-none' : 'row d-none d-lg-none'}>
                <FilterBar />
            </div>
            <div className='d-flex justify-content-between'>
                <h3 className=''>All programs</h3>
                <button style={{ border: 'none', background: 'none', color: 'inherit' }} onClick={manageFilters}>
                    <FontAwesomeIcon icon={faFilter} className="text-secondary" />
                </button>
            </div>
            {filteredPrograms.length === 0 ?
                <p>No programs found.</p> :
                <>
                    <p>Showing {filteredPrograms.length} result{filteredPrograms.length !== 1 ? 's' : ''}:</p>
                    <PageContext.Provider value={{ pageNumber, setPageNumber }}>
                        <ProgramsList filteredPrograms={filteredPrograms} />
                    </PageContext.Provider>
                </>
            }
        </div >
    )
};

export default Progs;