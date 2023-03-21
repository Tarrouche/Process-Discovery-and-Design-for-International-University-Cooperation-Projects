import Head from 'next/head';
import { UserContext } from '../_app';
import { useContext } from 'react';
import ICard from '../../components/cards/ICard';

export default function Institutions({ institutions }) {
  const { user } = useContext(UserContext);

  return (
    <>
      <Head>
        <title>Institutions</title>
      </Head>

      <br />
      <div className="container pt-4 px-4">
        <h3 className=''>Institutions</h3>
        <p>Showing {institutions.length} results:</p>

        <ul className='px-0'>
          {institutions.map(({ institutionId, name, country, city, logo, programs }, index) => (
            <ICard key={`inst-${index}`}
              institutionId={institutionId}
              title={name}
              logo={logo}
              location={country + ", " + city}
              programs={programs}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

export async function getStaticProps() { // Getting initial data server-side
  const res = await fetch('http://127.0.0.1:4000/institutions')
  const institutions = (await res.json()).message

  return {
    props: {
      institutions,
    },
    revalidate: 1800 // regenerate every 30 minutes
  };
}

