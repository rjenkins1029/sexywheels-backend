const express = require('express');
const ordersRouter = express.Router();
const {
  createOrder,
  getAllOrders,
  getOpenOrderByUserId,
  getOrderById,
} = require('./../db/orders');


//   getOrdersWithoutProducts,
//   updateOrder,
//   deleteOrder,
//   getOrderHistoryById,
const { checkAuthorization } = require("./utils");



ordersRouter.get('/', checkAuthorization, async (req, res, next) => {
  try {
      const { orderId } = req.params;
      const { id: userId } = req.user;

      const order = await getOrderById(orderId);

      if (!order.id) {
          res.status(400);
          next({
              error: '404',
              name: 'OrderNotFoundError',
              message: 'Order not found'
          })
      } else if (order.userId !== userId) {
          res.status(401);
          next({
            error: '401',
            name: 'UnauthorizedError',
            message: 'You do not have access to that order'
          });
      } else {
          res.send(order);
      }
  } catch ({ error, name, message }) {
      next({ error, name, message });
  } 
})


ordersRouter.get('/', async (req, res) => {
  try {
    const orders = await getAllOrders();
    if (!orders || orders.length === 0) {
      res.status(500).send({
        name: 'Not Orders Found',
        message: 'There are not orders submited at this moment.',
      });
    }

    res.send(orders);
  } catch (error) {
    console.log(error);
  }
});

ordersRouter.get('/details/:orderId', async (req, res) => {

  if (Object.keys(req.params).length === 0) {
    return res.status(400).send({
      name: 'InformationRequired',
      message: 'Please provide orderId to get your order deatails.',
    });
  }

  const { orderId } = req.params;

  try {

    const order = await getOrderById(orderId);

    !order || order.length === 0 && res.status(500).send({ name: 'Orders Not Found', message: 'There are not orders under this user Id.', })

    req.user.id !== order[0].userId ? res.status(403).send({ name: 'Wrong user', message: 'This order belongs to someone else.' }) : res.send(order);


  } catch (error) {
    console.log(error);
  }
});
ordersRouter.post('/guest', async (req, res) => {
  try {
    const { orderItems, date } = req.body;

    if (!orderItems[0]) {
      res.status(400);
      next({
          error: '400',
          name: 'EmptyCartError',
          message: 'Your cart is empty'
      })
  }

  const { userId, status, total } = req.body;

  if (req.user.id !== userId) return res.status(403).send({ name: 'Wrong user', message: 'Please login into your account.' })

  
    const order = await createOrder({ userId: 1, status, total, date });

    res.send({
      order: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        date: order.date,
      },
      message: 'Your order has been received, Thank you for your purchase',
    });
  } catch (error) {
    console.log(error);
  }
});

ordersRouter.get('/user_orders/:userId', async (req, res) => {
  console.log(req.user)
  if (Object.keys(req.params).length === 0) {
    return res.status(400).send({
      name: 'InformationRequired',
      message: 'Please provide userId to get your order deatails.',
    });
  }

  const { userId } = req.params;

  try {

    let orders = await getOpenOrderByUserId(userId);

    orders = orders.filter(order => req.user.id === order.userId)

    !orders || orders.length === 0 ? res.status(500).send({ name: 'Orders Not Found', message: 'There are not orders under this user Id.' }) : res.send(orders);

  } catch (error) {
    console.log(error);
  }
});


ordersRouter.post('/submit_order', async (req, res) => {

  if (Object.keys(req.body).length < 3) {
    return res.status(400).send({
      name: 'InformationRequired',
      message: 'Please provide userId, status and total to submit your order.',
    });
  }

  const { userId, status, total } = req.body;

  if (req.user.id !== userId) return res.status(403).send({ name: 'Wrong user', message: 'Please login into your account.' })

  try {
    const order = await createOrder({ userId, status, total });

    res.send({
      order: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        total: order.total,
        date: order.date,
      },
      message: 'Your order has been received, Thank you for your purchase',
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = ordersRouter;