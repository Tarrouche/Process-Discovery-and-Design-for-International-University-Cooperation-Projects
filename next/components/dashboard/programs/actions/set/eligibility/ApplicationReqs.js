import EligiblePositions from './EligiblePositions';
import Targets from './Targets';
import { FundingData } from '../manageFlow/Funding';
import { Row, Col } from 'react-bootstrap';
import React, { useEffect, useState, useRef } from "react";
import ParticipatingInstitutions from './ParticipatingInstitutions';
import SearchDropdown from './SearchDropdow';

export default function ApplicantionReqs({ updProgram, setProgram, countries }) {
    const partnerInstitutions = updProgram.participatingInstitutions || [];
    console.log(partnerInstitutions)
    function setPartnerInstitutions(updatedPartnerInstitutions) {
        setProgram({ ...updProgram, participatingInstitutions: updatedPartnerInstitutions });
    }
    function deleteTarget(input, index) {
        if (input === 'institution') {
            const updatedPartnerInstitutions = [...updProgram.participatingInstitutions || []];
            updatedPartnerInstitutions[index].programConfirmed = !updatedPartnerInstitutions[index].programConfirmed;
            setPartnerInstitutions(updatedPartnerInstitutions);

        }
    }

    const handleInstitutionChange = (id) => {
        let item = partnerInstitutions.find((item) => item.applicationId === id);
        if (item) {
            const updatedPartnerInstitutions = [...updProgram.participatingInstitutions || []];
            updatedPartnerInstitutions[updatedPartnerInstitutions.indexOf(item)] = { ...item, programConfirmed: !item.programConfirmed };
            setPartnerInstitutions(updatedPartnerInstitutions);
        }
    };

    return (
        <>
            <EligiblePositions updProgram={updProgram} setProgram={setProgram} />
            <Row>
                <Col>
                    <Targets
                        which={'From'}
                        updProgram={updProgram}
                        setProgram={setProgram}
                        countries={countries.map((obj) => obj.country)}
                        partnerInstitutions={updProgram.participatingInstitutions || []}
                        setPartnerInstitutions={setPartnerInstitutions}
                        showTable={
                            !(updProgram.location.from.state === 'Participating Institutions' &&
                                updProgram.location.to.state === 'Participating Institutions')
                        }
                    />
                </Col>
                {updProgram.transfer !== 'Not allowed' &&
                    <Col>
                        <Targets which={'To'} showTable={!(updProgram.location.from.state === 'Participating Institutions' && updProgram.location.to.state === 'Participating Institutions')} updProgram={updProgram} setProgram={setProgram} countries={countries.map((obj) => obj.country)} partnerInstitutions={partnerInstitutions} setPartnerInstitutions={setPartnerInstitutions} />
                    </Col>
                }
            </Row>

            <Row>

                {updProgram.location.from.state === 'Participating Institutions' && updProgram.location.to.state === 'Participating Institutions' &&
                    <>
                        <ParticipatingInstitutions
                            which={'To'}
                            partnerInstitutions={updProgram.participatingInstitutions || []}
                            deleteTarget={deleteTarget}
                        />
                        <SearchDropdown
                            dropdownItems={(updProgram.participatingInstitutions || []).filter((institution) => !institution.programConfirmed)}
                            handleItemChange={handleInstitutionChange}
                            placeholder={"Search for an institution..."}
                        />
                    </>
                }
            </Row>
        </>
    );
}
