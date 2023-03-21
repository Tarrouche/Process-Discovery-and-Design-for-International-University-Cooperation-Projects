import React, { useContext, useState } from 'react';
import { FilterContext } from '../../pages/programs/index';
import { Form } from 'react-bootstrap';



const FilterBar = () => {
    const { filterCriteria, setFilters } = useContext(FilterContext);

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

    return (

        <div className='card mb-3 mt-2 shadow-box topBar'>
            <div className='row g-0 pt-2'>
                <div className='col-3 px-1'>
                    <h6>Type of programs</h6>
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
                            onChange={handleCheck}
                        />
                    </div>
                </div>
                <div className='col-3 px-1'>
                    <h6>Destination countries</h6>
                </div>
                <div className='col-3 px-1'>
                    <h6>Participating </h6>
                </div>
            </div>
        </div>
    )
};

export default FilterBar;