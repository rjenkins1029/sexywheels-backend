
const express = require("express");
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_SECRET_ADMIN } = process.env;
const { createUser, getUser, updateUser, getUserByEmail, getUserById, getResetUserById, deleteResetUser, getAdminById, getInactiveUserById, updateShippingAddress, updateBillingAddress, getAllUsers } = require('../db/users');
const { checkAuthorization } = require("./utils");


usersRouter.get('/', async (req, res, next) => {
  try {
    const result = await getAllUsers();

    res.send(result);
  } catch (error) {
    next(error);
  }
});
usersRouter.post('/register', async (req, res, next) => {
  const {
      firstName,
      lastName,
      password,
      phone,
      email,
      username
      
  } = req.body;

  try {
    const _user = await getUserByEmail(username);

    if (_user) {
      res.status(403);
      next({
          error: '403',
          name: 'UsernameInUseError',
          message: `${username} is already registered.`
      });
    }

    if (password.length < 8) {
      res.status(400);
      next({
          error: '400',
          name: 'PasswordTooShortError',
          message: 'Password too short!'
      })
    }

    const user = await createUser({
      firstName,
      lastName,
      password,
      phone,
      email,
      username
      
    });

    const token = jwt.sign({ 
      id: user.id, 
      username
    }, process.env.JWT_SECRET, {
      expiresIn: '1w'
    });

    res.send({ 
      message: "you're signed up!",
      token,
      user 
    });
  } catch ({ error, name, message }) {
    next({ error, name, message });
  } 
});


usersRouter.post('/login', async (req, res, next) => {
  const { username, password } = req.body;
    console.log(req.body , "RICKY")
  try {
      const user = await getUser({ username, password });
      
      if (!user) {
          res.status(400);
          next({
              error: '400',
              name: 'IncorrectCredentialsError',
              message: 'Incorrect username or password'
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


      const token = jwt.sign({ id: user.id, username }, JWT_SECRET);
      const admin = await getAdminById(user.id);

      if(admin) {
          const adminToken = jwt.sign({ id: user.id, username }, JWT_SECRET_ADMIN);
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


usersRouter.delete('/password_reset/:userId', async (req, res, next) => {
  try {
      const { password } = req.body;
      const { userId } = req.params;

      const user = await deleteResetUser(userId, password);

      if (!user) {
          res.status(400);
          next({
              error: '400',
              name: 'SamePasswordError',
              message: 'New password must be different'
          });
      } else {
          const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
          const admin = await getAdminById(user.id);

          if(admin) {
              const adminToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET_ADMIN);
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
      }
  } catch ({ error, name, message }) {
      next({ error, name, message });
  } 
})


usersRouter.get('/me', checkAuthorization, async (req, res, next) => {
  try {
      res.send(req.user);
  } catch ({ error, name, message }) {
      next({ error, name, message });
  } 
})


usersRouter.patch('/me', checkAuthorization, async (req, res, next) => {
  try {
      const { id: userId } = req.user;
      const userInfo = { ...req.body };

      delete userInfo.shippingAddress;
      delete userInfo.billingAddress;

      const user = await getUserById(userId);

      if (!user) {
          res.status(404);
          next({
              error: '404',
              name: 'UserNotFoundError',
              message: 'User not found'
          })
      } else if (req.body.username) {
          const userByUsername = await getUserByUsername(req.body.username);

          if (userByUsername && userByUsername.id !== userId) {
              res.status(400);
              next({
                  error: '400',
                  name: 'UsernameInUseError',
                  message: 'That Username is already in use'
              })
          } else {
              if (req.body.shippingAddress) {
                  await updateShippingAddress(userId, req.body.shippingAddress);
              }
              if (req.body.billingAddress) {
                  await updateBillingAddress(userId, req.body.billingAddress);
              }
              const updatedUser = await updateUser({ id: userId, ...userInfo });
  
              if (!updatedUser) {
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
          if (req.body.shippingAddress) {
              await updateShippingAddress(userId, req.body.shippingAddress);
          }
          if (req.body.billingAddress) {
              await updateBillingAddress(userId, req.body.billingAddress);
          }
          const updatedUser = await updateUser({ id: userId, ...userInfo });

          if (!updatedUser) {
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