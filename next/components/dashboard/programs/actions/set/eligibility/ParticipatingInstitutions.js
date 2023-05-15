import { Table, Button } from 'react-bootstrap';
import { faCircleCheck, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ParticipatingInstitutions = ({ which, partnerInstitutions, deleteTarget }) => {
    return (
        <Table>
            <thead>
                <tr>
                    <th>{which}</th>
                    <th className='dashbord-icon-cell'>Parameters</th>
                    <th className='dashbord-icon-cell'>Action</th>
                </tr>
            </thead>
            <tbody>
                {partnerInstitutions.map((target, index) => (
                    <tr key={target.applicationId}>
                        <td>
                            {target.name}
                        </td>
                        <td className='dashbord-icon-cell'>

                            <Button
                                style={{ border: 'none', background: 'none', color: 'inherit' }}
                                className={target.in ? "text-success" : "text-secondary"}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} />
                            </Button>

                            <Button
                                style={{ border: 'none', background: 'none', color: 'inherit' }}
                                className={target.out ? "text-success" : "text-secondary"}
                            >
                                <FontAwesomeIcon icon={faSignOutAlt} />
                            </Button>
                        </td>
                        <td className='dashbord-icon-cell'>
                            <Button
                                onClick={() => deleteTarget('institution', index)}
                                style={{ border: 'none', background: 'none', color: 'inherit' }}
                                className={target.programConfirmed ? "text-primary" : "text-secondary"}                                    >
                                <FontAwesomeIcon icon={faCircleCheck} />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
};
export default ParticipatingInstitutions;