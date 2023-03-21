import Link from 'next/link';
import { UserContext } from '../../pages/_app';
import { useContext, useEffect } from 'react';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';



const Nav = () => {
  const { user, setUser } = useContext(UserContext);
  const router = useRouter();

  if (!user.email) {
    useEffect(() => {
      const fetchUser = async () => {
        const res = await fetch('https://snorlax.wtf:4000/api/user', {
          credentials: 'include'
        });
        const data = await res.json();
        setUser(data);
      };

      fetchUser();
    }, [setUser]);
  }

  return (
    <nav className="navbar sticky-top navbar-expand-lg navbar-light bg-light shadow-box">
      <Link className="navbar-brand" href="/">Snorlax</Link>
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <ul className="navbar-nav" style={{ width: '100%' }}>
          <li className="nav-item"><Link className="nav-link" href="/programs">Find Programs</Link></li>
          <li className="nav-item"><Link className="nav-link" href="/institutions">Browse Institutions</Link></li>
          {router.pathname !== '/' && !user.email &&
            <li className='nav-item ms-auto'><Link className="nav-link" href="/">Login</Link></li>
          }
        </ul>
        {user.email &&
          <ul className="navbar-nav ms-auto px-2">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <FontAwesomeIcon icon={faUser} className="px-2" />
                {user.name}
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                <li><Link className="dropdown-item" href="#">Account</Link></li>
                {user.role == 'Admin' && <li><Link className="dropdown-item" href="/dashboard">Dashboard</Link></li>}
                {user.role == 'Applicant' && <li><Link className="dropdown-item" href="/applications">Applications</Link></li>}
                <li>
                  <form action="https://snorlax.wtf:4000/api/user/logout" method="POST">
                    <button type="submit" className="dropdown-item">Logout</button>
                  </form>
                </li>
              </ul>
            </li>
          </ul>
        }
      </div>
    </nav >
  )
};

export default Nav;

