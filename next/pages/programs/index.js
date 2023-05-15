import Head from 'next/head';
import FilterSideBar from '../../components/filters/FilterSideBar';
import Progs from '../../components/programs/Programs';
import { createContext, useState } from 'react';

export const FilterContext = createContext();

export default function Programs({ programs, institutionsNames, countries }) {
    const [filterCriteria, setFilters] = useState({
        typesChecked: false,
        transferChecked: false,
        filters: {
            typeOfProgram: { Teaching: false, Research: false },
            transfer: { Possible: false, Required: false, 'Not required': false },
            application: { Open: false, Closed: false },
            position: { PhD: false, PostDoc: false, Professorship: false },
            from: [],
            to: [],
            partnerInstitutions: []
        }
    });

    const [showFilters, setFilterIcon] = useState(false);


    return (
        <>
            <Head>
                <title>Programs</title>
            </Head>
            <FilterContext.Provider value={{ filterCriteria, setFilters, showFilters, setFilterIcon }}>
                <div className="row double-cols">

                    < div className={showFilters ? 'd-none d-sm-none d-md-none d-lg-block col-5 col-sm-4 col-md-3 col-lg-3 sideBar shadow-box' : 'd-none'}>
                        <FilterSideBar institutionsNames={institutionsNames} countries={countries} />
                    </div>
                    <div className="col">
                        <Progs
                            programs={programs}
                            countries={countries}
                            institutionsNames={institutionsNames}
                        />
                    </div>
                </div>
            </FilterContext.Provider>
        </>
    );
}

export async function getStaticProps() {
    const [programsRes, institutionsRes, countriesRes] = await Promise.all([
        fetch('http://127.0.0.1:4000/api/program', {
            credentials: 'include'
        }),
        fetch('http://127.0.0.1:4000/api/institutions/names', {
            credentials: 'include'
        }),

        fetch('http://127.0.0.1:4000/api/countries', {
            credentials: 'include'
        }),
    ]);

    const programsData = (await programsRes.json()).message;
    if (programsRes.status !== 200) {
        console.log('Error getting user applications');
    }

    const institutionsData = (await institutionsRes.json()).message;
    if (institutionsRes.status !== 200) {
        console.log('Error getting programs applications');
    }

    const countriesData = await countriesRes.json();
    if (countriesRes.status !== 200) {
        console.log('Error getting user applications');
    }
    const countries = countriesData.map((obj) => obj.country);


    return {
        props: {
            programs: programsData,
            institutionsNames: institutionsData,
            countries: countries
        },
    };
}