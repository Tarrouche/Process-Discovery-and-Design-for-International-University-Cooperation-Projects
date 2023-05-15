import React, { useEffect, useState } from "react";
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Form, Button, Table } from 'react-bootstrap';
import TargetsConditions from "./TargetsConditions";
import SearchDropdown from "./SearchDropdow";
import ParticipatingInstitutions from "./ParticipatingInstitutions";
import PartnerCountries from "./PartnerCountries";

export default function Targets({ which, showTable, updProgram, setProgram, countries, partnerInstitutions, setPartnerInstitutions }) {
    const [selectedCountries, setSelectedCountries] = useState(updProgram.location[which.toLowerCase()].countries || []);
    const handleInputChange = (event) => {
        const value = event.target.value;

        setProgram((prevState) => ({
            ...prevState,
            location: {
                ...prevState.location,
                [which.toLowerCase()]: {
                    ...prevState.location[which.toLowerCase()],
                    state: value
                }
            },
        }));
    };


    const handleCountryChange = (country) => {
        if (selectedCountries.includes(country)) {
            setSelectedCountries(
                selectedCountries.filter(
                    (selectedCountry) => selectedCountry !== country
                )
            );
        } else {
            setSelectedCountries([...selectedCountries, { country: country }]);
        }
    };

    const handleInstitutionChange = (id) => {
        let item = partnerInstitutions.find((item) => item.applicationId === id);
        if (item) {
            const updatedPartnerInstitutions = [...partnerInstitutions];
            updatedPartnerInstitutions[updatedPartnerInstitutions.indexOf(item)] = { ...item, programConfirmed: !item.programConfirmed };
            setPartnerInstitutions(updatedPartnerInstitutions);
        }
    };


    const dropdownCountries = countries.filter((country) =>
        !(selectedCountries.find((selectedCountry) => selectedCountry.country === country) !== undefined)
    );


    useEffect(() => {
        setProgram(prevState => ({
            ...prevState,
            location: {
                ...prevState.location,
                [which.toLowerCase()]: {
                    ...prevState.location[which.toLowerCase()],
                    countries: selectedCountries
                }
            },
        }));
    }, [selectedCountries]);

    function deleteTarget(input, index) {
        if (input === 'country') {
            const newSelectedCountries = [...selectedCountries];
            newSelectedCountries.splice(index, 1);
            setSelectedCountries(newSelectedCountries);
        } else if (input === 'institution') {
            const updatedPartnerInstitutions = [...partnerInstitutions];
            updatedPartnerInstitutions[index].programConfirmed = !updatedPartnerInstitutions[index].programConfirmed;
            setPartnerInstitutions(updatedPartnerInstitutions);

        }
    }
    return (
        <>
            <Form.Group controlId="formBasicTarget">
                <h6 className="pt-3">{which}</h6>
                <Form.Control
                    as="select"
                    name={which}
                    value={updProgram.location[which.toLowerCase()].state}
                    onChange={handleInputChange}
                >
                    {[
                        "Participating Institutions",
                        "International",
                        "Partner Countries",
                    ].map((target) => (
                        <option key={target} value={target}>
                            {target}
                        </option>
                    ))}
                </Form.Control>
            </Form.Group>

            {updProgram.location[which.toLowerCase()].state === "Partner Countries" && selectedCountries.length !== 0 &&
                <PartnerCountries
                    which={which}
                    countries={selectedCountries}
                    deleteTarget={deleteTarget}
                />
            }
            {showTable && updProgram.location[which.toLowerCase()].state === "Participating Institutions" && partnerInstitutions.length !== 0 &&
                <ParticipatingInstitutions
                    which={which}
                    partnerInstitutions={partnerInstitutions}
                    deleteTarget={deleteTarget}
                />
            }

            {updProgram.location[which.toLowerCase()].state === "Partner Countries" &&
                <SearchDropdown
                    dropdownItems={dropdownCountries}
                    handleItemChange={handleCountryChange}
                    placeholder={"Search for a country..."}
                />
            }

            {showTable && updProgram.location[which.toLowerCase()].state === "Participating Institutions" &&
                <SearchDropdown
                    dropdownItems={partnerInstitutions.filter((institution) => !institution.programConfirmed)}
                    handleItemChange={handleInstitutionChange}
                    placeholder={"Search for an institution..."}
                />
            }

            {updProgram.location[which.toLowerCase()].state === "Partner Countries" && selectedCountries.length > 0 &&
                <TargetsConditions
                    targets={selectedCountries}
                    setTargets={setSelectedCountries}
                />
            }
            {updProgram.location[which.toLowerCase()].state === "International" &&
                <TargetsConditions
                    international={countries}
                    targets={selectedCountries}
                    setTargets={setSelectedCountries}
                />

            }

        </>
    );
}

