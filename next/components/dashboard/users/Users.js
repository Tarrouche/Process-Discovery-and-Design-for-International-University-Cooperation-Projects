import UDeleteModal from './actions/UDeleteModal';
import RoleModal from './actions/SetRole';

const UsersTable = ({ users, allowedRoles, setUsers }) => {

    const handleDeleteUser = (id) => { // Delete user by id and handle changes for client
        fetch(`https://snorlax.wtf:4000/api/user/${id}/delete`, {
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