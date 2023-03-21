import React, { useState } from 'react';
import { Card, Col, Row, Button, Accordion } from 'react-bootstrap';

const ExampleCard = () => {
    const x = {
        title: 'Erasmus+',
        logo: 'https://64os.de/wp-content/uploads/2021/09/erasmus-logo.jpg',
        location: 'EU',
        benefits: ['Funded', 'Poop'],
        parameters: [{ name: 'Required works hours', value: '8h per week' },
        { name: 'Registration deadline', value: '20.04.2023' }]
    };


    return (
        <>
            <div className="accordion bg-white" id="accordionExample">
                <div className="px-5 py-5">
                    <div className="accordion-item bg-white" style={{ backgroundColor: 'white' }}>
                        <button className="accordion-button py-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" style={{ backgroundColor: 'white', outline: 'none', boxShadow: 'none' }} aria-expanded="false" aria-controls="collapseOne">
                            <Card style={{ width: '100%', border: 'none' }}>
                                <Card.Body>
                                    <Row>

                                        <Card.Img
                                            variant="top"
                                            src={x.logo}
                                            style={{ maxWidth: "200px", maxHeight: "200px" }}
                                        />

                                        <Col className="d-flex flex-column">
                                            <Card.Title>{x.title}</Card.Title>
                                            <Card.Text className="text-muted">{x.location}</Card.Text>
                                            <div style={{ color: 'black' }} className="flex-grow-1 d-flex justify-content-between flex-column">
                                                <div>
                                                    {x.parameters.map((param, index) => (
                                                        <Card.Text key={`param-${index}`} className='my-0'>{param.name}: {param.value}</Card.Text>
                                                    ))}
                                                </div>
                                                <div>
                                                    {x.benefits.map((benefit, index) => (
                                                        <> <span key={`benef-${index}`} className="badge rounded-pill bg-primary">
                                                            {benefit}
                                                        </span></>

                                                    ))}
                                                </div>
                                            </div>
                                        </Col>

                                    </Row>
                                </Card.Body>
                            </Card>
                        </button>

                        <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                            <div className="accordion-body">
                                <Card.Text>
                                    Additional information lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget sapien ac risus elementum sollicitudin at ut est. Sed vel velit eget ante luctus accumsan in sed tellus. Morbi condimentum euismod dui, sed posuere odio suscipit eget. Vestibulum aliquet elit eu elit consectetur, a lacinia nunc sagittis. Duis vel lectus nec velit feugiat volutpat. Morbi euismod varius metus vitae pretium. Suspendisse potenti. Nulla facilisi. Vivamus sed tristique sapien. Nam euismod, turpis in feugiat maximus, quam nunc lobortis enim, sit amet gravida arcu quam ac est.
                                </Card.Text>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="accordion-item bg-white" style={{ backgroundColor: 'white' }}>
                    <button className="accordion-button my-0 py-0 ml-0" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" style={{ backgroundColor: 'white' }} aria-expanded="false" aria-controls="collapseTwo">
                        <Card>
                            <Card.Body>
                                <Row>
                                    <Col xs={3}>
                                        <Card.Img variant="top" src="https://picsum.photos/200" />
                                    </Col>
                                    <Col xs={9}>
                                        <Card.Title>Card Title 2</Card.Title>
                                        <Card.Text style={{ textDecoration: 'none' }}>

                                        </Card.Text>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </button>
                </div>
                <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                    <div className="accordion-body">
                        <Card.Text>
                            Additional information 2 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget sapien ac risus elementum sol

                            Additional information Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla eget sapien ac risus elementum sollicitudin at ut est. Sed vel velit eget ante luctus accumsan in sed tellus. Morbi condimentum euismod dui, sed posuere odio suscipit eget. Vestibulum aliquet elit eu elit consectetur, a lacinia nunc sagittis. Duis vel lectus nec velit feugiat volutpat. Morbi euismod varius metus vitae pretium. Suspendisse potenti. Nulla facilisi. Vivamus sed tristique sapien. Nam euismod, turpis in feugiat maximus, quam nunc lobortis enim, sit amet gravida arcu quam ac est.
                        </Card.Text>
                    </div>
                </div>
            </div>

        </>
    );
};

export default ExampleCard;
