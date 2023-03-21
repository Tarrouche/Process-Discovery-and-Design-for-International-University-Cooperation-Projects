import IEditModal from './actions/settings/IEditModal';
import ISettingsModal from './actions/settings/ISettingsModal';
import IDeleteModal from './actions/settings/IDeleteModal';

const InstitutionsTable = ({ institutions, programs, onEditInstitution, onSetInstitution, onDeleteInstitution }) => {

    const handleEditInstitution = (id, institution) => {
        onEditInstitution(id, institution);
    };

    const handleSetInstitution = (id, institution) => {
        onSetInstitution(id, institution);
    };

    const handleDeleteInstitution = (id) => {
        onDeleteInstitution(id);
    };
    return (
        <>
            <h2 className="mt-4 mb-4">Institutions</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Country</th>
                        <th>City</th>
                        <th className='dashbord-icon-cell'>
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {institutions.map(institution => (
                        <tr key={institution.institutionId}>
                            <td>{institution.name}</td>
                            <td>{institution.country}</td>
                            <td>{institution.city}</td>
                            <td className='dashbord-icon-cell'>
                                <IEditModal
                                    institution={institution}
                                    create={false}
                                    onEdit={handleEditInstitution}
                                />

                                <ISettingsModal
                                    institution={{ institutionId: institution.institutionId, programs: institution.programs }}
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
            <IEditModal
                institution={{ name: '', county: '', city: '', logo: '', website: '' }}
                onEdit={handleEditInstitution}
            />
        </>
    );
};

export default InstitutionsTable;