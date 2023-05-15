import { Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

function SelectedLinksTable({ selectedLinks, setSelectedLinks }) {
    const handleRemoveLink = (index) => {
        const newSelectedLinks = [...selectedLinks];
        newSelectedLinks.splice(index, 1);
        setSelectedLinks(newSelectedLinks);
    };
    return (
        <Table>
            <thead>
                <tr>
                    <th>File Name</th>
                    <th className='text-center'>File Link</th>
                    <th className='dashbord-icon-cell'>Action</th>
                </tr>
            </thead>
            <tbody>
                {selectedLinks.map((file, index) => (
                    <tr key={index}>
                        <td>{file.name}</td>
                        <td className='text-center'>{file.url}</td>
                        <td className='dashbord-icon-cell'>
                            <Button style={{ border: 'none', background: 'none', color: 'inherit' }}
                                onClick={() => handleRemoveLink(index)}>
                                <FontAwesomeIcon icon={faMinus} className="text-secondary" />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default SelectedLinksTable;
