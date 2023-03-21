import React, { useContext, useState, useEffect } from 'react';
import { FilterContext } from '../../pages/programs/index';
import { Form, DropdownButton, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";



const FilterSideBar = ({ institutionsNames }) => {
    const { filterCriteria, setFilters } = useContext(FilterContext);
    const [showContinent, setShowContinent] = useState({});
    const [partnerInstitutions, setPartnerInstitutions] = useState([]);

    useEffect(() => {
        setPartnerInstitutions(filterCriteria.filters.partnerInstitutions);
    }, [filterCriteria.filters.partnerInstitutions.length]);

    const handleInstitutionCheck = (event, institutionId) => {
        if (event.target.checked) {
            setFilters(filterCriteria => ({
                ...filterCriteria,
                filters: {
                    ...filterCriteria.filters,
                    partnerInstitutions: [...filterCriteria.filters.partnerInstitutions, institutionId]
                }
            }));
        } else {
            setFilters(filterCriteria => ({
                ...filterCriteria,
                filters: {
                    ...filterCriteria.filters,
                    partnerInstitutions: filterCriteria.filters.partnerInstitutions.filter(id => id !== institutionId)
                }
            }));
        }
    };


    function updateLocationFilterCriteria(location, subLocation, currentValue) {
        if (subLocation) { // Selected location in continent
            setFilters(filterCriteria => ({
                ...filterCriteria,
                filters: {
                    ...filterCriteria.filters,
                    location: {
                        International: {
                            "set": false,
                            "locations": {
                                ...filterCriteria.filters.location.International.locations,
                                [location]: {
                                    set: false,
                                    locations: {
                                        ...filterCriteria.filters.location.International.locations[location].locations,
                                        [subLocation]: { set: !currentValue }
                                    }
                                }
                            }
                        }
                    }
                }
            }));

        } else if (!location) { // Selected international
            setFilters(filterCriteria => ({
                ...filterCriteria,
                filters: {
                    ...filterCriteria.filters,
                    location: {
                        International: {
                            "set": !currentValue,
                            "locations": { ...filterCriteria.filters.location.International.locations }
                        }
                    }
                }
            }));
        } else { // Selected location is continent
            setFilters(filterCriteria => ({
                ...filterCriteria,
                filters: {
                    ...filterCriteria.filters,
                    location: {
                        International: {
                            "set": false,
                            "locations": {
                                ...filterCriteria.filters.location.International.locations,
                                [location]: {
                                    ...filterCriteria.filters.location.International.locations[location],
                                    set: !currentValue
                                }
                            }
                        }
                    }
                }
            }));
        }

    }

    function handleCheck(event) {
        const { name } = event.target;

        if (!filterCriteria.filters.typeOfProgram[name]) {
            setFilters(filterCriteria => ({
                ...filterCriteria,
                typesChecked: true,
                filters: {
                    ...filterCriteria.filters,
                    typeOfProgram: {
                        ...filterCriteria.filters.typeOfProgram,
                        [name]: true
                    }
                }
            }));
        } else {
            const newTypeOfProgram = {
                ...filterCriteria.filters.typeOfProgram,
                [name]: false
            };
            const areAllFalse = Object.values(newTypeOfProgram).every(v => v === false);
            setFilters(filterCriteria => ({
                ...filterCriteria,
                typesChecked: !areAllFalse,
                filters: {
                    ...filterCriteria.filters,
                    typeOfProgram: newTypeOfProgram
                }
            }));
        }
    }
    console.log(showContinent);
    return (

        <section className='classWithPad20'>
            <br />
            <h6>Type of programs:</h6>
            <div>
                <Form.Check
                    type='checkbox'
                    name='Teaching'
                    label='Teaching programs'
                    checked={filterCriteria.filters.typeOfProgram['Teaching']}
                    onChange={handleCheck}
                />
                <Form.Check
                    type='checkbox'
                    name='Research'
                    label='Research programs'
                    checked={filterCriteria.filters.typeOfProgram['Research']}
                    onChange={(event) => handleCheck(event, filterCriteria, setFilters)}
                />
            </div>

            <h6 className='pt-4'>Destination countries</h6>
            <div>
                <Form.Check
                    type='checkbox'
                    name='International'
                    label='International'
                    checked={filterCriteria.filters.location.International.set}
                    onChange={(e) => updateLocationFilterCriteria(null, null, filterCriteria.filters.location.International.set)}
                />
                {!filterCriteria.filters.location.International.set && Object.entries(filterCriteria.filters.location.International.locations).map(([location, subLocations]) => (
                    <div key={location}>
                        <div style={{ marginLeft: '20px' }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Form.Check
                                    type='checkbox'
                                    name={`${location}`}
                                    label={location}
                                    checked={subLocations.set && !filterCriteria.filters.location.International.set}
                                    onChange={(e) => updateLocationFilterCriteria(location, null, subLocations.set)}
                                />
                                <button onClick={() => setShowContinent({ ...showContinent, [location]: !showContinent[location] })} style={{ border: 'none', background: 'none', color: 'inherit' }}>

                                    <FontAwesomeIcon icon={showContinent[location] ? faChevronUp : faChevronDown} />

                                </button>
                            </div>


                            <div className="checkbox-list-container" style={{ display: showContinent[location] || !subLocations.set ? 'block' : 'none', marginLeft: '20px' }}>

                                {Object.entries(subLocations.locations).map(([subLocation, details]) => (
                                    <Form.Check
                                        key={`${location}/${subLocation}`}
                                        type='checkbox'
                                        name={`${location}/${subLocation}`}
                                        label={subLocation}
                                        checked={details.set && !subLocations.set && !filterCriteria.filters.location.International.set}
                                        onChange={(e) => updateLocationFilterCriteria(location, subLocation, details.set)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>


            <h6 className='pt-4'>Partner institutions</h6>
            <DropdownButton
                title='Select Institutions'
                variant='transparent'

            >
                <div style={{ transform: 'translate(0px, -50px)' }}>
                    <Dropdown.Menu variant='transparent'
                    >

                        {institutionsNames.map((institution) => (
                            <Dropdown.Item eventKey={institution.institutionId} onClick={(e) => e.stopPropagation()}>
                                <Form.Check
                                    type='checkbox'
                                    label={institution.name}
                                    id={institution.institutionId}
                                    onChange={(event) => {
                                        handleInstitutionCheck(event, institution.institutionId);
                                    }}
                                    checked={partnerInstitutions.includes(institution.institutionId)}
                                />
                            </Dropdown.Item>

                        ))}

                    </Dropdown.Menu>
                </div>

            </DropdownButton>

        </section>
    )
};

export default FilterSideBar;