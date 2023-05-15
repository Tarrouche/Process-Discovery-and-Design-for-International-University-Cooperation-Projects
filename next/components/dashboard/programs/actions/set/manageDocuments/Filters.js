import { Form, Table } from 'react-bootstrap';
import EligiblePositions from '../eligibility/EligiblePositions';
import TimeStepInput from './TimeStepInput';
import FilterSteps from './FilterSteps';


export default function Filters({ filters, setFilters, processSteps, modules }) {

    return (
        <>
            <h6 className='pt-3'>These filters will be applied to the newly uploaded files:</h6>
            <div className='row'>
                <div className='col-8'>

                    <FilterSteps filters={filters} setFilters={setFilters} processSteps={processSteps} modules={modules} />

                </div>
                <div className='col-4'>

                    <EligiblePositions updProgram={filters} setProgram={setFilters} task={'upload'} />
                </div>
            </div>
        </>

    );
}
