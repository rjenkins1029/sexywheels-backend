const apiRouter = require('express').Router();


apiRouter.get('/', (req, res, next) => {
  res.send({
    message: 'API is under construction!',
  });
});

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

const adminRouter = require('./admin')
apiRouter.use('/admin', adminRouter);

const categoriesRouter = require('./categories')
apiRouter.use('/categories', categoriesRouter);




module.exports = apiRouter;