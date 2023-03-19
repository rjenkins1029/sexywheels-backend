const client = require('./client');
const bcrypt = require('bcrypt');

const createUser = async ({
  username,
  password,
  isAdmin,
  firstName,
  lastName,
  email,
  profilePicture,
}) => {
  try {
    const SALT_COUNT = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users (username, password, "isAdmin", "firstName", "lastName", email, "profilePicture")
        VALUES($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (username, email) DO NOTHING
        returning id, username;
        `,
      [
        username,
        hashedPassword,
        isAdmin,
        firstName,
        lastName,
        email,
        profilePicture,
      ]
    );

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
async function getUser({ 
  email,
  password
}) {
  try{
    const user = await getUserByEmail(email);
    const hashedPassword = user.password;
    
    let passwordsMatch = await bcrypt.compare(password, hashedPassword) 
      if (passwordsMatch) {
        delete user.password;
        const userWithData = await attachUserData(user);
        return userWithData;
      } else {
        return false;
    }
  } catch (error) {
    console.error(error)
  }
}
async function getResetUserById(userId) {
  try{
      const { rows: [ user ] } = await client.query(`
          SELECT * 
          FROM reset_users
          WHERE "userId"=${ userId };
      `);

      if (user) {
          return true;
      } else {
          return false;
      }
  } catch (error) {
    console.error(error)
  }
}
const getAllUsers = async () => {
  try {
    const { rows: users } = await client.query(`
      SELECT username, "isAdmin", "firstName", "lastName", email
      FROM users;
    `);
    return users;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateUser = async (id, fields = {}) => {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUser = async ({ username, password }) => {
  try {
    const user = await getUserByUsername(username);
    const hashedPassword = user.password;
    const matchingPasswords = await bcrypt.compare(password, hashedPassword);

    if (matchingPasswords) {
      const userResult = (({ id, username }) => ({ id, username }))(user);
      return userResult;
    }
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUserById = async userId => {
  try {
    const {
      rows: [user],
    } = await client.query(`
      SELECT id, username, "isAdmin"
      FROM users
      WHERE id = ${userId};
    `);

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUserByUsername = async userName => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE username = $1;
    `,
      [userName]
    );

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getUserByEmail = async email => {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
      SELECT *
      FROM users
      WHERE email = $1;
    `,
      [email]
    );

    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const deleteUser = async id => {
  try {
    const userToDelete = await getUserById(id);
    if (userToDelete) {
      await client.query(`
      DELETE FROM users
      WHERE id = ${id};
    `);

      return 'User Deleted';
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
async function deleteResetUser(userId, password) {
  try{
      const { rows: [ user ] } = await client.query(`
      SELECT *
      FROM users
      WHERE id=$1
      `, [userId])

      const hashedPassword = user.password;

      let passwordsMatch = await bcrypt.compare(password, hashedPassword) 
      if (!passwordsMatch) {
          
          const newHashedPassword = await bcrypt.hash(password, SALT_COUNT);
          const { rows: [ reset_user ] } = await client.query(`
              DELETE FROM reset_users
              WHERE "userId"=$1
              RETURNING *;
          `, [userId])
  
          const { rows: [ updatedUser ]} = await client.query(`
              UPDATE users
              SET "password"=$1
              WHERE id=$2
              RETURNING *;
          `, [ newHashedPassword, userId ])
  
          delete updatedUser.password;
  
          return updatedUser;
      } else {
          return false;
      }
  } catch (error) {
      console.error(error)
  }
}
async function createResetUser(userId) {
  try{
      const { rows: [reset_user] } = await client.query(`
          INSERT INTO reset_users("userId")
          VALUES ($1)
          RETURNING *;
      `, [userId])

      return reset_user;
  } catch (error) {
      console.error(error)
  }
}
async function getInactiveUserById(userId) {
  try{
      const { rows: [ user ] } = await client.query(`
          SELECT * 
          FROM inactive_users
          WHERE "userId"=${ userId };
      `);

      if (user) {
          return true;
      } else {
          return false;
      }
  } catch (error) {
    console.error(error)
  }
}
module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  getUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  deleteUser,
  getResetUserById,
  deleteResetUser,
  createResetUser,
  getInactiveUserById

};