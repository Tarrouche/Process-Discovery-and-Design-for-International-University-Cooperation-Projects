import { Table, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus } from '@fortawesome/free-solid-svg-icons';

function SelectedFilesTable({ selectedFiles, setSelectedFiles }) {
    const handleRemoveFile = (index) => {
        const newSelectedFiles = [...selectedFiles];
        newSelectedFiles.splice(index, 1);
        setSelectedFiles(newSelectedFiles);
    };
    return (
        <Table>
            <thead>
                <tr>
                    <th>Selected Files</th>
                    <th className='dashbord-icon-cell'>Action</th>
                </tr>
            </thead>
            <tbody>
                {selectedFiles.map((file, index) => (
                    <tr key={index}>
                        <td>{file.name}</td>
                        <td className='dashbord-icon-cell'>
                            <Button style={{ border: 'none', background: 'none', color: 'inherit' }}
                                onClick={() => handleRemoveFile(index)}>
                                <FontAwesomeIcon icon={faMinus} className="text-secondary" />
                            </Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default SelectedFilesTable;
