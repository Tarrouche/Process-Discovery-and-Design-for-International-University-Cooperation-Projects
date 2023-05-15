import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons';
import { Table, Button, Form } from 'react-bootstrap';

function EntityResponsibles(props) {
    const [addResponsible, setAddResponsible] = useState('');

    const handleAddResponsible = async () => {
        const response = await fetch(`https://snorlax.wtf:4000/api/${type}/${entity[`${type}Id`]}/responsibles/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ responsible: addResponsible }),
            credentials: 'include'
        });
        if (response.ok) {
            setEntity({ ...entity, responsibles: [...entity.responsibles, { email: addResponsible }] })
            setAddResponsible('');
        } else {
            const errorResponse = await response.json();
            console.log(`Add Responsible Error: ${errorResponse.message}`);
        }
    };

    const handleRemoveResponsible = async (index) => {
        const email = entity.responsibles[index].email;
        const response = await fetch(`https://snorlax.wtf:4000/api/${type}/${entity[`${type}Id`]}/responsibles/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ responsible: email }),
            credentials: 'include'
        });
        if (response.ok) {
            const updatedResponsibles = entity.responsibles.filter(responsible => responsible.email !== email);
            setEntity({ ...entity, responsibles: updatedResponsibles })
            setAddResponsible('');
        } else {
            const errorResponse = await response.json();
            console.log(`Remove Responsible Error: ${errorResponse.message}`);
        }
    };
    const { entity, setEntity, type } = props;

    return (
        <>
            {entity.responsibles && entity.responsibles.length !== 0 && (
                <Table>
                    <thead>
                        <tr>
                            <th>Responsible</th>
                            <th className='dashbord-icon-cell'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entity.responsibles.map((responsible, index) => (
                            <tr key={index} className="align-middle">
                                <td>{responsible.email}</td>
                                <td className='dashbord-icon-cell'>
                                    <Button
                                        style={{ border: 'none', background: 'none', color: 'inherit' }}
                                        onClick={() => handleRemoveResponsible(index)}
                                    >
                                        <FontAwesomeIcon icon={faMinus} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
            <h6 className="pt-3">Add Responsible</h6>
            <div className='row'>
                <div className='col'>
                    <Form.Control
                        type="text"
                        name="name"
                        placeholder="Enter responsible's email"
                        value={addResponsible}
                        onChange={(e) => setAddResponsible(e.target.value)}
                    />
                </div>
                <div className='col-auto'>
                    <Button
                        style={{ border: 'none', background: 'none', color: 'inherit' }}
                        onClick={handleAddResponsible}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                    </Button>
                </div>
            </div>
        </>
    );
}

export default EntityResponsibles;
