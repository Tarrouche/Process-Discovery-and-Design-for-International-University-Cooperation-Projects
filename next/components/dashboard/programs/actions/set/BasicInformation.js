import { Form } from 'react-bootstrap';
import PeriodInput from './manageFlow/PeriodInput';
import Funded, { FundingData } from './manageFlow/Funding';
import ReactHtmlParser from 'react-html-parser';

export default function BasicInformation({ updProgram, setProgram }) {
    const urlRegex = /^https?:\/\/(?:[\w-]+\.)+([a-z]{2,})\/?/;

    function isValidLink(link) {
        return urlRegex.test(link);
    }

    const handleCheckboxChange = (event) => {
        const { name, value } = event.target;
        if (updProgram.typeOfProgram.includes(event.target.value)) {
            // Remove value from array if it's already included
            setProgram((prevState) => ({
                ...prevState,
                [name]: prevState[name].filter((programType) => programType !== event.target.value),
            }));
        } else {
            // Add value to array if it's not already included
            setProgram((prevState) => ({
                ...prevState,
                [name]: [...prevState[name], event.target.value],
            }));
        }
    }

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setProgram(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <>

            <Form.Group controlId="formBasicOfferer">
                <h6 className="">Offerer</h6>
                <Form.Control type="text" name="offerer" placeholder="Enter offerer" value={ReactHtmlParser(updProgram.offerer)} onChange={handleInputChange} />
            </Form.Group>

            <Form.Group controlId="formBasicTitle">
                <h6 className="pt-3">Title</h6>
                <Form.Control type="text" name="title" placeholder="Enter title" value={ReactHtmlParser(updProgram.title)} onChange={handleInputChange} />
            </Form.Group>

            <div className="row">
                <div className="col-3">
                    <Form.Group controlId="formBasicTypeOfProgram">
                        <h6 className="pt-3">Type of Program</h6>
                        <div>
                            {['Teaching', 'Research'].map((programType) => (
                                <Form.Check
                                    key={programType}
                                    type="checkbox"
                                    label={programType}
                                    name="typeOfProgram"
                                    value={programType}
                                    checked={updProgram.typeOfProgram && updProgram.typeOfProgram.includes(programType)}
                                    onChange={handleCheckboxChange}
                                />
                            ))}
                        </div>
                    </Form.Group>


                </div>
                <div className="col">

                    <Funded updProgram={updProgram} setProgram={setProgram} />
                    {updProgram.funded.funded &&
                        <PeriodInput period={'Funding period'} updProgram={updProgram} setProgram={setProgram} />}
                </div>
            </div>

            <Form.Group controlId="formBasicWebsite">
                <h6 className="pt-3">Website</h6>
                <Form.Control
                    type="text"
                    name="website"
                    placeholder="Enter website link"
                    value={updProgram.website}
                    onChange={handleInputChange}
                    isValid={isValidLink(updProgram.website)}
                    isInvalid={!isValidLink(updProgram.website)}
                />
                <Form.Control.Feedback type="invalid">
                    Please enter a valid link. (HTTP/HTTPS)
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formBasicLogo">
                <h6 className="pt-3">Logo</h6>
                <Form.Control
                    type="text"
                    name="logo"
                    placeholder="Enter logo link"
                    value={updProgram.logo}
                    onChange={handleInputChange}
                    isValid={isValidLink(updProgram.logo)}
                    isInvalid={!isValidLink(updProgram.logo)}
                />
                <Form.Control.Feedback type="invalid">
                    Please enter a valid link. (HTTP/HTTPS)
                </Form.Control.Feedback>
            </Form.Group>

            <div className="row">
                <div className="col-3">

                    <Form.Group controlId="formBasicTransfer">
                        <h6 className="pt-3">Transfer</h6>
                        <Form.Control as="select" name="transfer" value={updProgram.transfer || 'Transfer'} onChange={handleInputChange}>
                            <option value="Transfer" disabled>Transfer?</option>
                            {['Required', 'Possible', 'Not allowed'].map((transfer) => (
                                <option key={transfer} value={transfer}>
                                    {transfer}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </div>
                <div className="col">
                    <PeriodInput period={'Application period'} updProgram={updProgram} setProgram={setProgram} />
                </div>
            </div>
            <FundingData updProgram={updProgram} setProgram={setProgram} />


        </>
    );
}