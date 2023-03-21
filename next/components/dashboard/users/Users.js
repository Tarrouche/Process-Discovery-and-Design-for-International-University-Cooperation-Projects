import UDeleteModal from './actions/UDeleteModal';
import RoleModal from './actions/SetRole';

const UsersTable = ({ users, allowedRoles, onSetRole, onDeleteUser }) => {
    const handleSetRole = (id, newRole) => {
        onSetRole(id, newRole);
    };

    const handleDeleteUser = (id) => {
        onDeleteUser(id);
    };

    return (
        <>
            <h2 className="mt-4 mb-4">Users</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th className='dashbord-icon-cell'>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.userId}>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td className='dashbord-icon-cell'>
                                <RoleModal
                                    id={user.userId}
                                    email={user.email}
                                    role={user.role}
                                    allowedRoles={allowedRoles}
                                    onEdit={handleSetRole}
                                />
                                <UDeleteModal
                                    id={user.userId}
                                    email={user.email}
                                    onDelete={handleDeleteUser}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default UsersTable;