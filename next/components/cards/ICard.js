import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Link from 'next/link';



const ICard = ({ institutionId, title, logo, location, programs }) => {

    return (
        <div className="py-3">
            <Card style={{ width: '100%' }}>
                <Card.Body>
                    <Row>

                        <Card.Img
                            variant="top"
                            src={logo}
                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                        />

                        <Col className="d-flex flex-column">
                            <Card.Title>{title}</Card.Title>
                            <Card.Text className="text-muted">{location}</Card.Text>
                            <div style={{ color: 'black' }} className="flex-grow-1 d-flex justify-content-between flex-column">
                                <div>
                                    -- Additional information could be displayed here --
                                </div>
                                <div>
                                    {programs && programs.map((program, index) => (
                                        <span key={`prog-${index}`} className="badge rounded-pill bg-primary custom-margin-right-5">
                                            {program.offerer} - {program.title}
                                        </span>

                                    ))}
                                </div>
                            </div>
                        </Col>

                    </Row>
                </Card.Body>
            </Card>

        </div>
    );
};

export default ICard;