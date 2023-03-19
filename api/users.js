
const express = require('express');
const usersRouter = express.Router();
const {
  getAllUsers,
  createUser,
  getUserByEmail,
  getUserByUsername,
  getUserById,
  updateUser,
  deleteUser,
} = require('../db/users.js');
const { checkAuthorization } = require("./utils");
usersRouter.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
      const user = await getUser({ email, password });
      
      if (!user) {
          res.status(400);
          next({
              error: '400',
              name: 'IncorrectCredentialsError',
              message: 'Incorrect email or password'
          });
      }
      
      const resetUser = await getResetUserById(user.id);
      const inactiveUser = await getInactiveUserById(user.id);

      if (inactiveUser) {
          res.send({
              message: "Your account has been deactivated",
              userId: user.id,
              status: "inactive"
          });
      }

      if (resetUser) {
          res.send({
              message: "Please reset your password",
              userId: user.id,
              needsReset: true
          });
      }


      const token = jwt.sign({ id: user.id, email }, JWT_SECRET);
      const admin = await getAdminById(user.id);

      if(admin) {
          const adminToken = jwt.sign({ id: user.id, email }, JWT_SECRET_ADMIN);
          res.send({
              message: "you're logged in!",
              token,
              adminToken,
              user
          });
      } else {
          res.send({ 
          message: "you're logged in!",
          token,
          user 
          });
      }
      
  } catch ({ error, name, message }) {
    next({ error, name, message });
  } 
});
usersRouter.get('/me', checkAuthorization, async (req, res, next) => {
  try {
      res.send(req.user);
  } catch ({ error, name, message }) {
      next({ error, name, message });
  } 
})
usersRouter.get('/', async (req, res) => {
  const user = verifyJWT(req.headers.authorization);

  if (user.isAdmin) {
    try {
      const users = await getAllUsers();

      return res.send({ users });
    } catch (error) {
      console.log(error);
    }
  }

  res.send(':P');
});

usersRouter.get('/whoami', (req, res) => {
  if (req.user) {
    res.send({
      user: req.user,
    });
  } else {
    res.status(401).send({
      message: 'You are not a signed in or authenticated user.',
    });
  }
});

usersRouter.get('/admin', (req, res) => {
  const user = verifyJWT(req.headers.authorization);

  if (user.isAdmin) {
    return res.send(true);
  }

  res.send(false);
});

usersRouter.post('/register', async (req, res, next) => {
  if (Object.keys(req.body).length < 3) {
    return res.status(400).send({
      name: 'CredentialsRequired',
      message: 'Please provide email, username and password to register.',
    });
  }

  const { username, password, email } = req.body;

  try {
    const existingUserByEmail = await getUserByEmail(email);
    const existingUserUsername = await getUserByUsername(username);

    if (existingUserByEmail) {
      return res.status(400).send({
        name: 'EmailExistsError',
        message: 'A user under that email already exists.',
      });
    }

    if (existingUserUsername) {
      return res.status(400).send({
        name: 'UserExistsError',
        message: 'A user under that username already exists.',
      });
    }

    if (password.length < 5 || !password) {
      return res
        .status(406)
        .send({ message: 'Password must be at least 5 characters long' });
    }

    const user = await createUser({ username, password, email });

    const token = createJWT(user.email, user.id, user.username);

    res.send({
      user: { id: user.id, username: user.username },
      message: 'Thank you for signing up',
      token,
    });
  } catch (error) {
    console.log(error);
  }
});



usersRouter.patch('/:id', (req, res) => {
  const { id } = req.params;
  const user = verifyJWT(req.headers.authorization);

  if (!user.isAdmin) {
    return res.send(':P');
  }

  const { username, email, isadmin } = req.body;

  const userObj = { username, email, isadmin };

  // Input validation for setString, psql should recieve no empty keys
  Object.keys(userObj).forEach((key) => {
    if (userObj[key] === undefined) {
      delete userObj[key];
    }
  });

  try {
    const result = updateUser(id, userObj);

    res.send(result);
  } catch (error) {
    console.error(error);
  }
});

usersRouter.delete('/:id', async (req, res) => {
  const user = verifyJWT(req.headers.authorization);

  if (!user.isAdmin) {
    return res.send(':P');
  }

  const { id } = req.params;

  try {
    const result = await deleteUser(id);

    res.send(result);
  } catch (error) {
    console.error(error);
  }
});

usersRouter.patch('/me', checkAuthorization, async (req, res, next) => {
  try {
      const { id: userId } = req.user
      const { ...fields } = req.body;

      const user = await getUserById(userId);

      if (!user) {
          res.status(404);
          next({
              error: '404',
              name: 'UserNotFoundError',
              message: 'User not found'
          })
      } else if (req.body.email) {
          const userByEmail = await getUserByEmail(req.body.email);

          if (userByEmail.id && userByEmail.id !== userId) {
              res.status(400);
              next({
                  error: '400',
                  name: 'EmailInUseError',
                  message: 'That email is already in use'
              })
          } else {
              const updatedUser = await updateUser({ userId, ...fields });
  
              if (!updatedUser.id) {
                  next({
                      error: '400',
                      name: 'UserUpdateError',
                      message: 'Unable to update user info'
                  })
              } else {
                  res.send(updatedUser);
              }
          }
      } else {
          const updatedUser = await updateUser({ userId, ...fields });

          if (!updatedUser.id) {
              res.status(400);
              next({
                  error: '400',
                  name: 'UserUpdateError',
                  message: 'Unable to update user info'
              })
          } else {
              res.send(updatedUser);
          }
      }
  } catch ({ error, name, message }) {
      next({ error, name, message });
  } 
})

module.exports = usersRouter;