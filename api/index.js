const express = require('express');
const apiRouter = express.Router();




apiRouter.get('/health', (req, res, next) => {
  res.send({
    healthy: true,
  });
});




const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);

const productsRouter = require('./products')
apiRouter.use('/products', productsRouter);


const cartRouter = require('./cart')
apiRouter.use('/cart', cartRouter);

const productUnitsRouter = require('./productUnits')
apiRouter.use('/productUnits', productUnitsRouter);

const ordersRouter = require('./orders')
apiRouter.use('/orders', ordersRouter);

// const adminRouter = require('./admin')
// apiRouter.use('/admin', adminRouter);

const categoriesRouter = require('./categories')
apiRouter.use('/categories', categoriesRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
      error: error.error,
      name: error.name,
      message: error.message
  });
});

apiRouter.use((req, res, next) => {
  res.status(404).send({
      error: '404',
      name: 'PageNotFoundError',
      message: 'Page not found'
  })
});


module.exports = apiRouter;