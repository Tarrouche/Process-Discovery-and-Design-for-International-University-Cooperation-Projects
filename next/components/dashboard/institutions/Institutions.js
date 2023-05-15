import { useContext } from 'react';
import { UserContext } from '../../../pages/_app';
import IEditModal from './actions/settings/IEditModal';
import ISettingsModal from './actions/settings/ISettingsModal';
import IDeleteModal from './actions/settings/IDeleteModal';
import ReactHtmlParser from 'react-html-parser';


const InstitutionsTable = ({ institutions, programs, setInstitutions, countries }) => {
    const { user } = useContext(UserContext);

    const handleEditInstitution = async (id, institution) => {
        const { name, country, logo, website } = institution;
        const data = { name, country, logo, website };
        console.log(id)
        let response;
        if (id) {//edit
            response = await fetch(`https://snorlax.wtf:4000/api/institution/${id}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

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

        } else { //create
            response = await fetch(`https://snorlax.wtf:4000/api/institution/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
                credentials: 'include'
            });

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
        }
    };

    const handleSetInstitution = async (id, data) => {
        const response = await fetch(`https://snorlax.wtf:4000/api/institution/${id}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
            credentials: 'include'
        });

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
    };

    const handleDeleteInstitution = async (id) => {
        const response = await fetch(`https://snorlax.wtf:4000/api/institution/${id}/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: id }),
            credentials: 'include'
        });
        if (response.ok) {
            const updInstitutions = institutions.filter((inst) => inst.institutionId !== id);
            setInstitutions(updInstitutions);
        } else {
            console.log("Institution Delete Error");
        }
    };
    return (
        <>
            <h2 className="mt-4 mb-4">Institutions</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Country</th>
                        <th className='dashbord-icon-cell'>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {institutions.map(institution => (
                        <tr key={institution.institutionId}>
                            <td>{ReactHtmlParser(institution.name)}</td>
                            <td>{institution.country}</td>
                            <td className='dashbord-icon-cell'>
                                <IEditModal
                                    institution={institution}
                                    create={false}
                                    onEdit={handleEditInstitution}
                                    countriesJSON={countries}
                                />

                                <ISettingsModal
                                    institution={institution}
                                    allPrograms={programs}
                                    onSet={handleSetInstitution}
                                />

                                <IDeleteModal
                                    id={institution.institutionId}
                                    name={institution.name}
                                    onDelete={handleDeleteInstitution}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {user.role === 'Admin' &&
                <IEditModal
                    institution={{ name: '', county: '', city: '', logo: '', website: '' }}
                    onEdit={handleEditInstitution}
                    countriesJSON={countries}
                />
            }
        </>
    );
};

export default InstitutionsTable;