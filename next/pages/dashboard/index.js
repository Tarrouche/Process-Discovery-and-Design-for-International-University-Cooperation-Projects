import React, { useState } from 'react';
import InstitutionsTable from '../../components/dashboard/institutions/Institutions';
import ProgramsTable from '../../components/dashboard/programs/Programs';
import UsersTable from '../../components/dashboard/users/Users';


const Dashboard = (props) => {
    const { data, allowedRoles, countries } = props;
    const [institutions, setInstitutions] = useState(data.institutions);
    const [programs, setPrograms] = useState(data.programs);
    const [users, setUsers] = useState(data.users);
    console.log(props);
    return (
        <div className="container">
            <InstitutionsTable
                institutions={institutions}
                programs={programs}
                countries={countries}
                setInstitutions={setInstitutions}
            />

            <ProgramsTable
                programs={programs}
                countries={countries}
                setPrograms={setPrograms}
            />

            {users &&
                <UsersTable
                    users={users}
                    allowedRoles={allowedRoles}
                    setUsers={setUsers}
                />
            }

        </div>
    );
};

export async function getServerSideProps(context) { // Loading initial page data on the server
    const { req } = context;
    // fetch data from the API

    const cookie = req.headers.cookie;
    // If no cookies then user needs to authenticate
    if (!cookie) {
        return {
            redirect: {
                destination: `/?error=${encodeURIComponent('Authentication required')}`,
                permanent: false,
            },
        };
    }

    const [DashboardDataRes, allowedRolesRes, countriesRes] = await Promise.all([
        fetch('http://127.0.0.1:4000/api/dashboard', {
            headers: {
                cookie: cookie,
            },
        }),
        fetch('http://127.0.0.1:4000/api/roles', {
            headers: {
                cookie: cookie,
            },
        }),
        fetch('http://127.0.0.1:4000/api/countries'),
    ]);

    const data = await DashboardDataRes.json();

    // Either not authorized or not authenticated to the backend
    if (DashboardDataRes.status === 403) {
        return {
            redirect: {
                destination: `/?error=${encodeURIComponent(data.message)}`,
                permanent: false,
            },
        };
    }

    const allowedRoles = await allowedRolesRes.json();
    const countries = await countriesRes.json();

    return { props: { data, allowedRoles, countries } };
}

export default Dashboard;