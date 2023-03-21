import React, { useState } from 'react';
import InstitutionsTable from '../../components/dashboard/institutions/Institutions';
import ProgramsTable from '../../components/dashboard/programs/Programs';
import UsersTable from '../../components/dashboard/users/Users';


const Dashboard = (props) => {
    const { data, allowedRoles } = props;
    const [institutions, setInstitutions] = useState(data.institutions);
    const [programs, setPrograms] = useState(data.programs);
    const [users, setUsers] = useState(data.users);

    const handleDeleteInstitution = (id) => { // Delete institution by id and handle changes for client
        fetch(`https://snorlax.wtf:4000/api/institution/${id}/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id }),
            credentials: 'include'
        })
            .then((response) => {
                if (response.ok) {
                    const updInstitutions = institutions.filter((inst) => inst.institutionId !== id);
                    setInstitutions(updInstitutions);
                } else {
                    console.log("Institution Delete Error");
                }
            });
    };

    const handleEditInstitution = async (id, institution) => { // Edit institution by id and handle changes for client
        const { name, country, city, logo, website } = institution;
        const data = { name, country, city, logo, website };

        if (id) {//edit
            fetch(`https://snorlax.wtf:4000/api/institution/${id}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        let edited = false;
                        const updatedInstitutions = institutions.map((inst) => {
                            if (inst.institutionId === id) {
                                edited = true;
                                return { ...inst, ...institution };
                            } else {
                                return inst;
                            }
                        });
                        if (!edited) {
                            updatedInstitutions.push({ ...institution, institutionId: id });
                        }
                        setInstitutions(updatedInstitutions);
                    } else {
                        response.json().then(data => console.log(data.message + ' (Edit Institution)'));
                    }
                })
                .catch(error => console.log(error.message));
        } else { //create
            await fetch(`https://snorlax.wtf:4000/api/institution/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        response.json().then(data => {
                            let edited = false;
                            const updatedInstitutions = institutions.map((inst) => {
                                if (inst.institutionId === id) {
                                    edited = true;
                                    return { ...inst, ...institution };
                                } else {
                                    return inst;
                                }
                            });
                            if (!edited) {
                                updatedInstitutions.push({ ...institution, institutionId: data.institutionId, programs: [] });
                            }

                            setInstitutions(updatedInstitutions);
                        });
                    }
                })
                .catch(error => console.log(error.message));
        }
    };

    const handleSetInstitution = (id, data) => { // Institutions settings
        fetch(`https://snorlax.wtf:4000/api/institution/${id}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
            .then(response => {
                if (response.ok) {
                    response.json().then(data => {
                        const updatedInstitutions = [...institutions]; // create a copy of the state
                        for (let i = 0; i < updatedInstitutions.length; i++) {
                            if (updatedInstitutions[i].id === id) {
                                updatedInstitutions[i].programs = data.programs;
                            }
                        }
                        setInstitutions(updatedInstitutions); // set the state to the updated copy

                    });
                } else {
                    response.json().then(data => console.log(data.message + ' (Set Institution)'));
                }
            })
            .catch(error => console.log(error.message));
    };

    const handleDeleteProgram = (id) => { // Delete program by id and handle changes for client
        fetch(`https://snorlax.wtf:4000/api/program/${id}/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id }),
            credentials: 'include'
        })
            .then((response) => {
                if (response.ok) {
                    const updPrograms = programs.filter((program) => program.programId !== id);
                    setPrograms(updPrograms);
                } else {
                    console.log("Program Delete Error");
                }
            });
    };

    const handleEditProgram = (id, program) => { // Edit program by id and handle changes for client
        const { name, location, logo, typeOfProgram, funded } = program;
        const data = { name, location, logo, typeOfProgram, funded };

        if (id) { //edit
            fetch(`https://snorlax.wtf:4000/api/program/${id}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        let edited = false;
                        const updatedPrograms = programs.map((prg) => {
                            if (prg.programId === id) {
                                edited = true;
                                return { ...prg, ...program };
                            } else {
                                return prg;
                            }
                        });
                        if (!edited) {
                            updatedPrograms.push({ ...program, programId: id });
                        }
                        setPrograms(updatedPrograms);
                    } else {
                        response.json().then(data => console.log(data.message + ' (Edit Institution)'));
                    }
                })
                .catch(error => console.log(error.message));
        } else { //create
            fetch('https://snorlax.wtf:4000/api/program/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            })
                .then(response => {
                    if (response.ok) {
                        response.json().then(data => {
                            const updatedPrograms = programs.map((prg) => {
                                if (prg.programId === id) {
                                    return { ...prg, ...program };
                                } else {
                                    return prg;
                                }
                            });
                            updatedPrograms.push({ ...program, programId: data.programId, responsibles: [] });

                            setPrograms(updatedPrograms);
                        });
                    } else {
                        response.json().then(data => console.log(data.message + ' (Create Program)'));
                    }
                })
                .catch(error => console.log(error.message));
        }

    };

    const handleSetProgram = (id, data) => { // Program settings
        fetch(`https://snorlax.wtf:4000/api/program/${id}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
            .then(response => {
                if (response.ok) {
                    const updatedPrograms = programs.map((prg) => {
                        if (prg.programId === id) {
                            return { ...prg, ...data };
                        } else {
                            return prg;
                        }
                    });
                    setPrograms(updatedPrograms);

                } else {
                    response.json().then(data => console.log(data.message + ' (Set Program)'));
                }
            })
            .catch(error => console.log(error.message));
    };

    const handleDeleteUser = (id) => { // Delete user by id and handle changes for client
        fetch("https://snorlax.wtf:4000/api/user/`{id}`/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id }),
            credentials: 'include'
        })
            .then((response) => {
                if (response.ok) {
                    const updUsers = users.filter((user) => user.userId !== id);
                    setUsers(updUsers);
                } else {
                    console.log("User Delete Error");
                }
            });
    };

    const handleSetRole = (id, newRole) => { // Set user role
        fetch("https://snorlax.wtf:4000/api/user/role", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id, role: newRole }),
            credentials: 'include'
        })
            .then((response) => {
                if (response.ok) {
                    const updatedUsers = users.map((user) => {
                        if (user.userId === id) {
                            return { ...user, role: newRole };
                        } else {
                            return user;
                        }
                    });
                    setUsers(updatedUsers);
                } else {
                    console.log("Set Role Error");
                }
            });
    };

    return (
        <div className="container">
            <InstitutionsTable
                institutions={institutions}
                programs={programs}
                onEditInstitution={handleEditInstitution}
                onSetInstitution={handleSetInstitution}
                onDeleteInstitution={handleDeleteInstitution}
            />

            <ProgramsTable
                programs={programs}
                onEditProgram={handleEditProgram}
                onSetProgram={handleSetProgram}
                onDeleteProgram={handleDeleteProgram}
            />
            <UsersTable
                users={users}
                onSetRole={handleSetRole}
                allowedRoles={allowedRoles}
                onDeleteUser={handleDeleteUser}
            />

        </div >
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




    const [DashboardDataRes, allowedRolesRes] = await Promise.all([
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

    return { props: { data, allowedRoles } };
}

export default Dashboard;