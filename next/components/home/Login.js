import Link from 'next/link';
import { UserContext } from '../../pages/_app'
import { useContext, useState } from 'react';

function Login({ error, handleClick }) {
    const { setUser } = useContext(UserContext);
    const [invalidCredentials, setInvalidCredentials] = useState(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch(
            'https://www.snorlax.wtf:4000/api/user/login',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            }
        );
        const result = await response.json();
        if (response.status == 200) {
            setUser(result.message);
        } else {
            setInvalidCredentials(result.message);
        }
        console.log(result)

    };

    return (
        <form className="px-5 py-5" onSubmit={handleSubmit}>
            <h4>Log in</h4>
            <br />
            {(invalidCredentials || error) && (
                <div className="alert alert-danger" role="alert" style={{ textAlign: 'center' }}>
                    {invalidCredentials ? invalidCredentials : error}
                </div>
            )}
            <div>
                <input type="text" className="form-control mb-3" placeholder="Email" name="email" value={formData.email} onChange={handleChange} />
                <input type="password" className="form-control mb-3" placeholder="Password" name="password" value={formData.password} onChange={handleChange} />
            </div>

            <div className="text-center pt-3 mb-5 pb-1">
                <button className="btn btn-primary btn-block" type="submit">Log In</button><br /><br />
                <Link href="#!" style={{ textDecoration: 'none' }}>Forgot password?</Link><br />
                <a className="text-muted" style={{ textDecoration: 'none' }}>No account? </a><Link href="#!" style={{ textDecoration: 'none' }} onClick={handleClick}>Sign Up</Link>
            </div>

        </form>
    );
}

export default Login;