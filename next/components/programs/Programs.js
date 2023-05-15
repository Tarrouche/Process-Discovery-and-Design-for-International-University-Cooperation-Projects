import { FilterContext } from '../../pages/programs/index';
import FilterBar from '../filters/FilterBar';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
export const PageContext = createContext();
import ProgramsList from './ProgramsList';

const Progs = ({ programs, countries, institutionsNames }) => {
    const { filterCriteria, showFilters, setFilterIcon } = useContext(FilterContext);
    const [filteredPrograms, setFilteredPrograms] = useState(programs);
    const [pageNumber, setPageNumber] = useState(1);
    const [userApplications, setApplications] = useState();
    const [partnerInstitutions, setInstitutions] = useState();

    const handleFilterChange = () => {
        const filtered = programs.filter(({ programId, location, typeOfProgram, transfer, funded, applicationPeriod, eligiblePositions }) => isFiltered(programId, location, typeOfProgram, transfer, funded.period, applicationPeriod, eligiblePositions));
        setFilteredPrograms(filtered);
        setPageNumber(1);
    };

    //If filters change, call handleFilterChange()
    useEffect(() => {
        handleFilterChange();
    }, [filterCriteria]);
    //Check if program fits the filters chosen on the SideBar
    function isFiltered(programId, location, typeOfProgram, transfer, fundingPeriod, applicationPeriod, eligiblePositions) {
        // If types of programs checked
        if (filterCriteria.typesChecked) {
            let filtered = false;
            for (let i = 0; i < typeOfProgram.length; i++) {
                if (filterCriteria.filters.typeOfProgram[typeOfProgram[i]]) {
                    filtered = true;
                }
            }
            if (!filtered)
                return false;
        }
        if (filterCriteria.transferChecked) {
            if (!filterCriteria.filters.transfer[transfer])
                return false;
        }

        if (filterCriteria.applicationChecked) {
            let filtered = false;

            if (filterCriteria.filters.application['Open']) {
                if (!(applicationPeriod.end || fundingPeriod.end)) {
                    if (!(applicationPeriod.start || fundingPeriod.start))
                        filtered = true; // Always open for application
                } else {
                    const today = new Date();
                    const [dd, mm, yyyy] = (applicationPeriod.end || fundingPeriod.end).split(".");
                    const endDate = new Date(`${yyyy}-${mm}-${dd}`);

                    if (!(endDate < today)) {
                        filtered = true; // Not expired
                    }
                }
            }

            if (filterCriteria.filters.application['Closed']) {
                if (applicationPeriod.end || fundingPeriod.end) {
                    const today = new Date();
                    const [dd, mm, yyyy] = (applicationPeriod.end || fundingPeriod.end).split(".");
                    const endDate = new Date(`${yyyy}-${mm}-${dd}`);

                    if (endDate < today) {
                        filtered = true; // Not expired
                    }
                }
            }
            if (!filtered)
                return false;
        }
        if (filterCriteria.positionChecked) {
            for (const [key, value] of Object.entries(filterCriteria.filters.position)) {
                if (value && eligiblePositions[key] !== true) {
                    return false;
                }
            }
        }

        if (filterCriteria.filters.from.length !== 0) {
            let filtered = false;
            if (location.from.state === 'International') {
                filtered = true;
            } else if (location.from.state === 'Partner Countries') {
                for (let country of filterCriteria.filters.from) {
                    const countriesFrom = location.from.countries.map((obj) => obj.country);
                    if (countriesFrom.includes(country)) {
                        filtered = true;
                    }
                }
            } else if (location.to.state === 'Participating Institutions') {
                filtered = false; //Could check for the countries of the institutions
            }
            if (!filtered)
                return false;
        }

        if (filterCriteria.filters.to.length !== 0) {
            let filtered;
            if (location.to.state === 'International') {
                filtered = true;
            } else if (location.to.state === 'Partner Countries') {
                for (let country of filterCriteria.filters.to) {
                    const countriesTo = location.to.countries.map((obj) => obj.country);
                    if (countriesTo.includes(country)) {
                        filtered = true;
                    }
                }
            } else if (location.to.state === 'Participating Institutions') {
                filtered = false; //Could check for the countries of the institutions
            }
            if (!filtered)
                return false;
        }

        if (filterCriteria.filters.partnerInstitutions.length !== 0) {
            let filtered = false;
            for (let partner of partnerInstitutions) {
                if (partner.programId === programId && filterCriteria.filters.partnerInstitutions.includes(partner.institutionId)) { //&& partner.programConfirmed
                    filtered = true;
                    break;
                }
            }
            if (!filtered)
                return false;
        }
        // Next filters to add
        return true;
    }

    function manageFilters() {
        setFilterIcon(current => !current);
    }

    useEffect(() => {
        async function fetchData() {
            const [userApplicationsRes, applicationsRes] = await Promise.all([
                fetch('https://snorlax.wtf:4000/api/user/applications', {
                    credentials: 'include'
                }),
                fetch('https://snorlax.wtf:4000/api/applications', {
                    credentials: 'include'
                }),
            ]);

            const userApplicationsData = await userApplicationsRes.json();
            if (userApplicationsRes.status !== 200) {
                console.log('Error getting user applications');
            }
            setApplications(userApplicationsData);

            const applicationsData = await applicationsRes.json();
            if (applicationsRes.status !== 200) {
                console.log('Error getting programs applications');
            }
            setInstitutions(applicationsData);

        }
        fetchData();
    }, []);


    return (

        <div className="container pt-4 px-4">
            <br />
            <div className={showFilters ? 'row d-block d-lg-none' : 'row d-none d-lg-none'}>
                <FilterBar countries={countries} institutionsNames={institutionsNames} />
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
                        <ProgramsList filteredPrograms={filteredPrograms} applications={userApplications} />
                    </PageContext.Provider>
                </>
            }
        </div >
    )
};

export default Progs;