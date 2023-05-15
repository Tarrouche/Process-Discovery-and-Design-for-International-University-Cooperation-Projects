import { faPlus, faMinus, faEdit } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { Form, Button, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactHtmlParser from 'react-html-parser';


function Modules({ updProgram, setProgram }) {
    const [newModule, setNewModule] = useState({ name: '', applicationTime: '' });
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editModule, setEditModule] = useState({ name: '', applicationTime: '' })

    const handleAddModule = () => {
        if (newModule.name.trim() === '') {
            return;
        }

        setProgram({
            ...updProgram,
            modules: { state: 'Available', modules: [...updProgram.modules.modules, newModule] }
        });
        setNewModule({ name: '' });
    };

    if (!updProgram.modules) {
        setProgram({
            ...updProgram,
            modules: { modules: [] }
        });
    };

    const handleDelete = (index) => {
        const updatedModules = [...updProgram.modules.modules];
        updatedModules.splice(index, 1);
        setProgram({
            ...updProgram,
            modules: { state: 'Available', modules: updatedModules }
        });
    };

    const handleEdit = (index) => {
        if (editingIndex === -1) {
            setEditingIndex(index);
            setEditModule(updProgram.modules.modules[index])
        } else {
            const updatedModules = [...updProgram.modules.modules];
            updatedModules[index] = editModule;
            setProgram({
                ...updProgram,
                modules: { state: 'Available', modules: updatedModules }
            });
            if (editingIndex === index)
                setEditingIndex(-1);
            else
                setEditingIndex(index);
        }

    };

    return (
        <>

            <Form.Group controlId="formBasicApplicationForm">
                <h6 className="pt-3">Modules</h6>

                <Form.Control as="select" name="state" value={(updProgram.modules && updProgram.modules.state) || 'Modules'} onChange={(e) => setProgram({
                    ...updProgram,
                    modules: { ...updProgram.modules, state: e.target.value }
                })}>
                    <option value="Modules" disabled>Modules available?</option>
                    {['Available', 'Not Available'].map((state) => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </Form.Control>
                {updProgram.modules && updProgram.modules.state === 'Available' &&
                    <>

                        {
                            updProgram.modules.modules.length !== 0 &&
                            <Table>
                                <thead>
                                    <tr>
                                        <th>Module Name</th>
                                        <th className="text-center">Application Time</th>
                                        <th className='dashbord-icon-cell'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {updProgram.modules.modules.map((module, index) => (
                                        <tr key={module.name} className="align-middle">
                                            <td>
                                                {editingIndex === index ? (
                                                    <Form.Control
                                                        type="text"
                                                        value={ReactHtmlParser(editModule.name)}
                                                        onChange={(e) => setEditModule({ ...editModule, name: e.target.value })}
                                                    />
                                                ) : (
                                                    <span>{ReactHtmlParser(module.name)}</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {editingIndex === index ? (
                                                    <Form.Control
                                                        as="select"
                                                        value={editModule.applicationTime}
                                                        onChange={(e) => setEditModule({ ...editModule, applicationTime: e.target.value })}
                                                    >
                                                        {['During Application', 'During Program', 'Both'].map((state) => (
                                                            <option key={state} value={state}>
                                                                {state}
                                                            </option>
                                                        ))}
                                                    </Form.Control>
                                                ) : (
                                                    <span>{module.applicationTime}</span>
                                                )}
                                            </td>
                                            <td className='dashbord-icon-cell'>
                                                <Button
                                                    style={{ border: 'none', background: 'none', color: 'inherit' }}
                                                    onClick={() => handleEdit(index)}>
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </Button>
                                                <Button
                                                    style={{ border: 'none', background: 'none', color: 'inherit' }}
                                                    onClick={() => handleDelete(index)}>
                                                    <FontAwesomeIcon icon={faMinus} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        }

                        <h6 className="pt-3">Add Module</h6>
                        <div className='row'>
                            <div className='col-7'>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Enter module name"
                                    value={newModule.name}
                                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                                />
                            </div>
                            <div className='col'>
                                <Form.Control as="select" name="applicationTime" value={newModule.applicationTime || 'ApplicationTime'} onChange={(e) => setNewModule({
                                    ...newModule,
                                    applicationTime: e.target.value
                                })}>
                                    <option value="ApplicationTime" disabled>When applicable?</option>
                                    {['During Application', 'During Program', 'Both'].map((state) => (
                                        <option key={state} value={state}>
                                            {state}
                                        </option>
                                    ))}
                                </Form.Control>
                            </div>
                            <div className='col-auto'>
                                <Button onClick={handleAddModule} style={{ border: 'none', background: 'none', color: 'inherit' }}>
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            </div>
                        </div>
                    </>

                }

            </Form.Group>
        </>

    );
}

export default Modules;
