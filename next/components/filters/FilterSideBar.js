import React, { useContext, useState, useEffect } from 'react';
import { FilterContext } from '../../pages/programs/index';
import { Form, DropdownButton, Dropdown } from 'react-bootstrap';




const FilterSideBar = ({ institutionsNames, countries }) => {
    const { filterCriteria, setFilters } = useContext(FilterContext);
    const [partnerInstitutions, setPartnerInstitutions] = useState([]);
    const [inCountries, setInCountries] = useState([]);
    const [toCountries, setToCountries] = useState([]);

    useEffect(() => {
        setPartnerInstitutions(filterCriteria.filters.partnerInstitutions);
        setInCountries(filterCriteria.filters.from);
        setToCountries(filterCriteria.filters.to);

    }, [filterCriteria.filters.partnerInstitutions.length, filterCriteria.filters.from.length, filterCriteria.filters.to.length]);


    const handleListCheck = (event, value, input) => {
        if (input === 'partner') {
            if (event.target.checked) {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    filters: {
                        ...filterCriteria.filters,
                        partnerInstitutions: [...filterCriteria.filters.partnerInstitutions, value]
                    }
                }));
            } else {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    filters: {
                        ...filterCriteria.filters,
                        partnerInstitutions: filterCriteria.filters.partnerInstitutions.filter(id => id !== value)
                    }
                }));
            }
        } else if (input === 'from') {
            if (event.target.checked) {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    filters: {
                        ...filterCriteria.filters,
                        from: [...filterCriteria.filters.from, value]
                    }
                }));
            } else {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    filters: {
                        ...filterCriteria.filters,
                        from: filterCriteria.filters.from.filter(id => id !== value)
                    }
                }));
            }
        } else if (input === 'to') {
            if (event.target.checked) {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    filters: {
                        ...filterCriteria.filters,
                        to: [...filterCriteria.filters.to, value]
                    }
                }));
            } else {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    filters: {
                        ...filterCriteria.filters,
                        to: filterCriteria.filters.to.filter(id => id !== value)
                    }
                }));
            }
        }
    };

    function handleCheck(event, input) {
        const { name } = event.target;
        if (input === 'type') {
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
        } else if (input === 'transfer') {

            if (!filterCriteria.filters.transfer[name]) {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    transferChecked: true,
                    filters: {
                        ...filterCriteria.filters,
                        transfer: {
                            ...filterCriteria.filters.transfer,
                            [name]: true
                        }
                    }
                }));
            } else {
                const newTransfer = {
                    ...filterCriteria.filters.transfer,
                    [name]: false
                };
                const areAllFalse = Object.values(newTransfer).every(v => v === false);
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    transferChecked: !areAllFalse,
                    filters: {
                        ...filterCriteria.filters,
                        transfer: newTransfer
                    }
                }));
            }
        } else if (input === 'application') {

            if (!filterCriteria.filters.application[name]) {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    applicationChecked: true,
                    filters: {
                        ...filterCriteria.filters,
                        application: {
                            ...filterCriteria.filters.application,
                            [name]: true
                        }
                    }
                }));
            } else {
                const newApplication = {
                    ...filterCriteria.filters.application,
                    [name]: false
                };
                const areAllFalse = Object.values(newApplication).every(v => v === false);
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    applicationChecked: !areAllFalse,
                    filters: {
                        ...filterCriteria.filters,
                        application: newApplication
                    }
                }));
            }
        } else if (input === 'position') {

            if (!filterCriteria.filters.position[name]) {
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    positionChecked: true,
                    filters: {
                        ...filterCriteria.filters,
                        position: {
                            ...filterCriteria.filters.position,
                            [name]: true
                        }
                    }
                }));
            } else {
                const newPosition = {
                    ...filterCriteria.filters.position,
                    [name]: false
                };
                const areAllFalse = Object.values(newPosition).every(v => v === false);
                setFilters(filterCriteria => ({
                    ...filterCriteria,
                    positionChecked: !areAllFalse,
                    filters: {
                        ...filterCriteria.filters,
                        position: newPosition
                    }
                }));
            }
        }
    }
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
                    onChange={(event) => handleCheck(event, 'type')}
                />
                <Form.Check
                    type='checkbox'
                    name='Research'
                    label='Research programs'
                    checked={filterCriteria.filters.typeOfProgram['Research']}
                    onChange={(event) => handleCheck(event, 'type')}
                />
            </div>

            <h6>Position eligibility:</h6>
            <div>
                <Form.Check
                    type='checkbox'
                    name='PhD'
                    label='PhD'
                    onChange={(event) => handleCheck(event, 'position')}
                />

                <Form.Check
                    type='checkbox'
                    name='PostDoc'
                    label='PostDoc'
                    onChange={(event) => handleCheck(event, 'position')}
                />
                <Form.Check
                    type='checkbox'
                    name='Professorship'
                    label='Professorship'
                    onChange={(event) => handleCheck(event, 'position')}
                />
            </div>

            <h6>Transfer state:</h6>
            <div>
                <Form.Check
                    type='checkbox'
                    name='Required'
                    label='Required'
                    onChange={(event) => handleCheck(event, 'transfer')}
                />

                <Form.Check
                    type='checkbox'
                    name='Possible'
                    label='Possible'
                    onChange={(event) => handleCheck(event, 'transfer')}
                />
                <Form.Check
                    type='checkbox'
                    name='Not allowed'
                    label='Not allowed'
                    onChange={(event) => handleCheck(event, 'transfer')}
                />
            </div>

            <h6>Application state:</h6>
            <div>
                <Form.Check
                    type='checkbox'
                    name='Open'
                    label='Open'
                    onChange={(event) => handleCheck(event, 'application')}
                />

                <Form.Check
                    type='checkbox'
                    name='Closed'
                    label='Closed'
                    onChange={(event) => handleCheck(event, 'application')}
                />
            </div>

            <h6 className='pt-4'>Countries</h6>
            <DropdownButton
                title='Select current location'
                variant='transparent'

            >
                <div style={{ transform: 'translate(0px, -50px)' }}>
                    <Dropdown.Menu variant='transparent'
                    >

                        {countries.map((country) => (
                            <Dropdown.Item eventKey={country} onClick={(e) => e.stopPropagation()}>
                                <Form.Check
                                    type='checkbox'
                                    label={country}
                                    id={`from-${country}`}
                                    onChange={(event) => {
                                        handleListCheck(event, country, 'from');
                                    }}
                                    checked={inCountries.includes(country)}
                                />
                            </Dropdown.Item>

                        ))}

                    </Dropdown.Menu>
                </div>

            </DropdownButton>

            <DropdownButton
                title='Select destination location'
                variant='transparent'

            >
                <div style={{ transform: 'translate(0px, -50px)' }}>
                    <Dropdown.Menu variant='transparent'
                    >

                        {countries.map((country) => (
                            <Dropdown.Item eventKey={country} onClick={(e) => e.stopPropagation()}>
                                <Form.Check
                                    type='checkbox'
                                    label={country}
                                    id={`to-${country}`}
                                    onChange={(event) => {
                                        handleListCheck(event, country, 'to');
                                    }}
                                    checked={toCountries.includes(country)}
                                />
                            </Dropdown.Item>

                        ))}

                    </Dropdown.Menu>
                </div>

            </DropdownButton>

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
                                        handleListCheck(event, institution.institutionId, 'partner');
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