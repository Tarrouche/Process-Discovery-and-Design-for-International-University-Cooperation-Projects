import React, { useState } from "react";
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, Button } from 'react-bootstrap';
import ReactHtmlParser from 'react-html-parser';

export default function Funded({ updProgram, setProgram }) {
    const handleCheckboxChange = (event) => {
        setProgram({
            ...updProgram,
            funded: {
                ...updProgram.funded,
                funded: !updProgram.funded.funded,
            },
        })
    }

    return (
        <Form.Group controlId="formBasicFunded">
            <h6 className="pt-3">Funded</h6>
            <div>
                <Form.Check
                    type="checkbox"
                    label="Funded"
                    name="funded"
                    checked={updProgram.funded && updProgram.funded.funded}
                    onChange={handleCheckboxChange}
                />
            </div>
        </Form.Group>
    );
}

export function FundingData({ updProgram, setProgram }) {
    const [editingFundingRequirements, setEditingFundingRequirements] = useState(false);
    const [editingFundingAllowances, setEditingFundingAllowances] = useState(false);


    const toggleFundingReq = () => setEditingFundingRequirements(!editingFundingRequirements);
    const toggleFundingAll = () => setEditingFundingAllowances(!editingFundingAllowances);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'fundingRequirements') {
            setProgram(prevState => ({
                ...prevState,
                funded: {
                    ...prevState.funded,
                    fundingRequirements: value.split('\n')
                }
            }));
        } else if (name === 'fundingAllowances') {
            setProgram(prevState => ({
                ...prevState,
                funded: {
                    ...prevState.funded,
                    fundingAllowances: value.split('\n')
                }
            }));
        }
    };

    return (
        <>
            {updProgram.funded && updProgram.funded.funded && (
                <>
                    <Form.Group controlId="formBasicFundingRequirements">
                        <div className="row">
                            <div className="col">
                                <h6 className="pt-3">Funding Requirements</h6>
                            </div>
                            <div className="col-auto">
                                <Button style={{ border: 'none', background: 'none', color: 'inherit' }} onClick={toggleFundingReq}>

                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        className="px-2"
                                    />
                                </Button>

                            </div>
                        </div>
                        {editingFundingRequirements ?
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="fundingRequirements"
                                value={ReactHtmlParser(updProgram.funded.fundingRequirements.join('\n'))}
                                onChange={handleInputChange}
                            />
                            :
                            <>
                                {updProgram.funded && updProgram.funded.fundingRequirements && (
                                    <ul>
                                        {updProgram.funded.fundingRequirements.map((requirement, index) => (
                                            <li key={index}>{ReactHtmlParser(requirement)}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        }
                    </Form.Group>
                    <Form.Group controlId="formBasicFundingAllowances">
                        <div className="row">
                            <div className="col">
                                <h6 className="pt-3">Funding Allowances</h6>
                            </div>
                            <div className="col-auto">
                                <Button style={{ border: 'none', background: 'none', color: 'inherit' }} onClick={toggleFundingAll}>

                                    <FontAwesomeIcon
                                        icon={faEdit}
                                        className="px-2"
                                    />
                                </Button>
                            </div>
                        </div>
                        {editingFundingAllowances ?
                            <Form.Control
                                as="textarea"
                                rows={4}
                                name="fundingAllowances"
                                value={ReactHtmlParser(updProgram.funded.fundingAllowances.join('\n'))}
                                onChange={handleInputChange}
                            />
                            :
                            <>
                                {updProgram.funded && updProgram.funded.fundingAllowances && (
                                    <ul>
                                        {updProgram.funded.fundingAllowances.map((allowance, index) => (
                                            <li key={index}>{ReactHtmlParser(allowance)}</li>
                                        ))}
                                    </ul>
                                )}
                            </>
                        }
                    </Form.Group>
                </>
            )}
        </>
    );
}

