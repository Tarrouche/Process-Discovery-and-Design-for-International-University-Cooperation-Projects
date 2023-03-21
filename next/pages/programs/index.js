import Head from 'next/head';
import FilterSideBar from '../../components/filters/FilterSideBar';
import Progs from '../../components/programs/Programs';
import { createContext, useState } from 'react';

export const FilterContext = createContext();

export default function Programs({ programs, institutionsNames }) {
    const [filterCriteria, setFilters] = useState({
        typesChecked: false,
        filters: {
            typeOfProgram: { Teaching: false, Research: false },
            location: {
                "International": {
                    "set": true,
                    "locations": {
                        "Africa": {
                            "set": true,
                            "locations": {
                                "North Africa": { set: false },
                                "West Africa": { set: false },
                                "Central Africa": { set: false },
                                "East Africa": { set: false },
                                "Southern Africa": { set: false }
                            }
                        },
                        "Asia": {
                            "set": true,
                            "locations": {
                                "Central Asia": { set: false },
                                "East Asia": { set: false },
                                "South Asia": { set: false },
                                "Southeast Asia": { set: false },
                                "West Asia": { set: false }
                            }
                        },
                        "Australia": {
                            "set": true,
                            "locations": {
                                "Australia": { set: false },
                                "New Zealand": { set: false }
                            }
                        },
                        "Europe": {
                            "set": true,
                            "locations": {
                                "Eastern Europe": { set: false },
                                "Northern Europe": { set: false },
                                "Southern Europe": { set: false },
                                "Western Europe": { set: false }
                            }
                        },
                        "North America": {
                            "set": true,
                            "locations": {
                                "Canada": { set: false },
                                "Mexico": { set: false },
                                "USA": { set: false }
                            }
                        },
                        "South America": {
                            "set": true,
                            "locations": {
                                "Central America": { set: false },
                                "South America": { set: false }
                            }
                        }
                    }
                }
            },
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
                        <FilterSideBar institutionsNames={institutionsNames} />
                    </div>
                    <div className="col">
                        <Progs
                            programs={programs}
                        />
                    </div>
                </div>
            </FilterContext.Provider>
        </>
    );
}

export async function getStaticProps() {
    const programsRes = await fetch('http://127.0.0.1:4000/programs');
    const programs = (await programsRes.json()).message;
    const institutionsRes = await fetch('http://127.0.0.1:4000/api/institutions/names');
    const institutionsNames = (await institutionsRes.json()).message;
    return {
        props: {
            programs,
            institutionsNames,
        },
    };
}