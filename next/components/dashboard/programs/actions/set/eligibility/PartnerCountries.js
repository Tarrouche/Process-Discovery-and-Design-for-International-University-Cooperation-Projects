import { Table, Button } from 'react-bootstrap';
import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const PartnerCountries = ({ which, countries, deleteTarget }) => {
    return (
        <Table>
            <thead>
                <tr>
                    <th>{which}</th>
                    <th className='dashbord-icon-cell'>Action</th>
                </tr>
            </thead>
            <tbody>
                {countries.map((target, index) => (
                    <tr key={target.country}>
                        <td>{target.country}</td>
                        <td className='dashbord-icon-cell'>
                            <Button
                                onClick={() => deleteTarget('country', index)}
                                style={{ border: 'none', background: 'none', color: 'inherit' }}>
                                <FontAwesomeIcon icon={faMinus} />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};
export default PartnerCountries;