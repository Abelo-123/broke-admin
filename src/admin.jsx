import React, { useState } from 'react';

function Admin() {
  const [users, setUsers] = useState([
    { name: 'User1', accepted: 'Yes' },
    { name: 'User2', accepted: 'No' },
  ]);
  const [search, setSearch] = useState('');

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={handleSearchChange}
        className="w-full p-2 mb-4 border rounded"
      />
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Users</th>
            <th className="border border-gray-300 p-2">Accepted</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={index}>
              <td className="border border-gray-300 p-2">{user.name}</td>
              <td className="border border-gray-300 p-2">{user.accepted}</td>
              <td className="border border-gray-300 p-2">
                <button className="px-4 py-2 bg-blue-500 text-white rounded">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Admin;
