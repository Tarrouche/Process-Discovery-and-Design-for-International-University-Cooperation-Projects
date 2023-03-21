import Head from 'next/head';

import Signup from '../components/home/Signup';
import Login from '../components/home/Login';

import { UserContext } from './_app';
import { useContext, useState } from 'react';


export default function Home({ error }) {
  const { user } = useContext(UserContext);
  const [noAccount, setNoAccount] = useState(false);

  const handleToggleSignUp = () => {
    setNoAccount(prevNoAccount => !prevNoAccount);
  }

  return (
    <>
      <Head>
        <title>Snorlax</title>
      </Head>
      {user.email ? null : (
        <div className="d-block d-sm-none row phoneBar shadow-box">
          {noAccount ?
            <Signup handleClick={handleToggleSignUp} /> :
            <Login error={error} handleClick={handleToggleSignUp} />
          }
        </div>
      )}
      <div className="row">
        <div className="col">
          <section className="classWithPad20">
            <h2>First time visiting? Welcome!</h2>
            <br />
            <p>This tool can be used to find programs in different higher education institutions and to
              guide applicants through the application process.</p>

            <p>You don’t have to sign up to use the features to find programs and browse institutions.</p>

            <p>If you want your application process to be guided and to store your documents (which
              will be encrypted) to avoid losing them, you can create an account.</p>

            <p>Upon signing up, you will be asked to give the institute you are
              working and the role you have within it. This information is used to find programs for
              which you are eligible.</p>
          </section>
        </div>
        {user.email ? null : (
          <div className="d-none d-sm-block col-5 col-sm-4 col-md-4 col-lg-4 col-xl-3 sideBar shadow-box">
            {noAccount ?
              <Signup handleClick={handleToggleSignUp} /> :
              <Login error={error} handleClick={handleToggleSignUp} />
            }
          </div>
        )}
      </div>
    </>
  )
}

export async function getServerSideProps(context) { // Load redirection error message
  const { query } = context;
  const error = query.error || null;

  return {
    props: {
      error
    }
  }
}