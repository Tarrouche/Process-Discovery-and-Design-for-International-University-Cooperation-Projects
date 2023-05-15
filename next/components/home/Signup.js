import Link from 'next/link';
import { useState, useEffect } from 'react';

function Signup({ handleClick }) {
    const [invalidSignUp, setInvalidSignUp] = useState(null);
    const [accountCreated, setCreated] = useState(false);
    const [formDataSignUp, setFormDataSignUp] = useState({
        firstName: '',
        lastName: '',
        institution: '',
        email: '',
        password: ''
    });

    const [institutionOptions, setInstitutionOptions] = useState([]);
    const [nationalityOptions, setNationalityOptions] = useState([]);

    useEffect(() => {
        fetch('https://www.snorlax.wtf:4000/institutions')
            .then(response => response.json())
            .then(data => setInstitutionOptions(data.message));

        fetch('https://snorlax.wtf:4000/api/nationalities')
            .then(response => response.json())
            .then(data => {
                const citizenships = data.map(nationality => nationality.citizenship);
                setNationalityOptions(citizenships);
            });
    }, []);


    const handleChangeSignUp = (event) => {
        const { name, value } = event.target;
        setFormDataSignUp((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmitSignUp = async (event) => {
        event.preventDefault();
        const { firstName, lastName, email } = formDataSignUp;

        // Check if first name and last name are not empty
        if (!firstName || !lastName) {
            setInvalidSignUp('First name and last name are required.');
            return;
        }

        // Check email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setInvalidSignUp('Invalid email.');
            return;
        }

        const response = await fetch('https://www.snorlax.wtf:4000/api/user/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formDataSignUp)
        });

        if (response.status === 200) {
            setCreated(true);
            setFormDataSignUp({
                firstName: '',
                lastName: '',
                institution: '',
                nationality: '',
                email: '',
                password: ''
            });
        } else {
            console.log(await response.json());
        }
    };

    return (
        <form className="px-5 py-5" onSubmit={handleSubmitSignUp}>
            <h4>Sign up</h4>
            <br />
            {accountCreated && (
                <div className="alert alert-success" role="alert" style={{ textAlign: 'center' }}>
                    Account created.
                </div>
            )}
            {invalidSignUp && (
                <div className="alert alert-danger" role="alert" style={{ textAlign: 'center' }}>
                    {invalidSignUp}
                </div>
            )}
            <div>
                <div style={{ display: 'flex' }}>
                    <input type="text" className="form-control mb-2" placeholder="First Name" name="firstName" value={formDataSignUp.firstName} onChange={handleChangeSignUp} />
                    <input type="text" className="form-control mb-2" placeholder="Last Name" name="lastName" value={formDataSignUp.lastName} onChange={handleChangeSignUp} />
                </div>
                <select className="form-control mb-2" name="institution" value={formDataSignUp.institution} onChange={handleChangeSignUp}>
                    <option value="unspecified">Institution</option>
                    {institutionOptions.map(institution => (
                        <option key={institution._id} value={institution._id}>{institution.name}</option>
                    ))}
                </select>
                <select className="form-control mb-3" name="nationality" value={formDataSignUp.nationality} onChange={handleChangeSignUp}>
                    <option value="unspecified">Nationality</option>
                    {nationalityOptions.map((nationality, index) => (
                        <option key={`nationality-${index}`} value={nationality}>{nationality}</option>
                    ))}
                </select>

                <input type="text" className="form-control mb-2" placeholder="Email" name="email" value={formDataSignUp.email} onChange={handleChangeSignUp} />
                <input type="password" className="form-control" placeholder="Password" name="password" value={formDataSignUp.password} onChange={handleChangeSignUp} />

            </div>

            <div className="text-center pt-3 mb-5 pb-1">
                <button className="btn btn-primary btn-block" type="submit">Sign Up</button><br /><br />
                <a className="text-muted" style={{ textDecoration: 'none' }}>Already have an account? </a><br />
                <Link href="#!" style={{ textDecoration: 'none' }} onClick={handleClick}>Log In</Link>
            </div>

        </form>
    );

}

export default Signup;