import React, { useState } from 'react';
import { Card, Col, Row, Button, Accordion } from 'react-bootstrap';
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
                                    Hello ser
                                </div>
                                <div>
                                    {programs && programs.map((program, index) => (
                                        <div key={`prog-${index}`}> <span className="badge rounded-pill bg-primary">
                                            {program.programId}
                                        </span></div>

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