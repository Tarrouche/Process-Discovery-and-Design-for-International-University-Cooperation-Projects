import React, { useState } from 'react';
import { Card, Col, Row, Button, Accordion } from 'react-bootstrap';
import Link from 'next/link';








const ProgramCard = ({ programId, title, logo, location, description, benefits, parameters, fundingRequirements, fundingAllowances }) => {


        return (
                <div key={`progr-${programId}`} className="py-3">
                        <div className="accordion-item bg-white" style={{ backgroundColor: 'white' }}>
                                <button className="accordion-button py-0 collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${programId}`} style={{ backgroundColor: 'white', outline: 'none', boxShadow: 'none' }} aria-expanded="false" aria-controls={`collapse-${programId}`}>

                                        <Card key={`prog-${programId}`} style={{ width: '100%', border: 'none' }}>
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
                                                                                        {parameters.map((param, index) => (
                                                                                                <Card.Text key={`param-${index}`} className='my-0'>{param.name}: {param.value}</Card.Text>
                                                                                        ))}
                                                                                </div>
                                                                                <div>
                                                                                        {benefits.map((benefit, index) => (
                                                                                                <div key={`benef-${index}`}> <span className="badge rounded-pill bg-primary">
                                                                                                        {benefit}
                                                                                                </span></div>

                                                                                        ))}
                                                                                </div>
                                                                        </div>
                                                                </Col>

                                                        </Row>
                                                </Card.Body>
                                        </Card>
                                </button>

                                <div id={`collapse-${programId}`} className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                        <div className="accordion-body">
                                                <Card.Text>
                                                        Additional information lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget sapien ac risus elementum sollicitudin at ut est. Sed vel velit eget ante luctus accumsan in sed tellus. Morbi condimentum euismod dui, sed posuere odio suscipit eget. Vestibulum aliquet elit eu elit consectetur, a lacinia nunc sagittis. Duis vel lectus nec velit feugiat volutpat. Morbi euismod varius metus vitae pretium. Suspendisse potenti. Nulla facilisi. Vivamus sed tristique sapien. Nam euismod, turpis in feugiat maximus, quam nunc lobortis enim, sit amet gravida arcu quam ac est.
                                                </Card.Text>
                                        </div>
                                </div>
                        </div>
                </div >
        );
};

export default ProgramCard;
