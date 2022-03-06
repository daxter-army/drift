const users = [];

const addUser = (id, username, roomName) => {
  const existingUser = users.find(
    (user) => user.roomName === roomName && user.username === username
  );

  if (existingUser) {
    return { error: "Username is taken already!" };
  }

  const user = { id, username, roomName };

  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.roomName === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
