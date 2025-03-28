import React from 'react';

const UserList = ({ users, onSelectUser }) => {
  return (
    <div className="bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {users.length === 0 ? (
          <li className="p-4 text-gray-500">No users found</li>
        ) : (
          users.map((user) => (
            <li 
              key={user.account_id}
              className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onSelectUser(user)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                  {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user.username || user.account_id}</p>
                  <p className="text-xs text-gray-500 truncate">{user.account_id}</p>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UserList;
