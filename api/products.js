const express = require('express');
const productsRouter = express.Router();
const {
  getAllCars,
  getCarById,
  getCarByName,
  getCarByPrice,
  createCar,
  updateCar,
  deleteCar,
} = require('../db/cars.js');
// const {
//   getProductByName,
//   getMostRecentProducts,
//   getAllCategorys,
//   getProductsByCategory,
// } = require('../db/models/products.js');

productsRouter.get('/cars/:categoryId', async (req, res, next) => {
  try {
      const params = req.params;
      const categoryId = Number(params.categoryId);
      const taggedCars = await getCarByPrice({ categoryId });

      res.send(taggedCars);
  } catch ({ error, name, message }) {
      next({ error, name, message });
  } 
})
productsRouter.get('/', async (req, res, next) => {
  try {
    const result = await getAllCars();

    res.send(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/product/:productID', async (req, res, next) => {
  const { productID } = req.params;

  try {
    const result = await getCarById(productID);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/name/:name', async (req, res, next) => {
  const { name } = req.params;

  try {
    const productNames = await getCarByName(name);

    res.send(productNames);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/type/:type', async (req, res, next) => {
  const { type } = req.params;

  try {
    const productType = await getProductByName(type);

    res.send(productType);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/categorys', async (req, res, next) => {
  try {
    const categorys = await getAllCategorys();

    res.send(categorys);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/categorys/:category', async (req, res, next) => {
  let { category } = req.params;
  category = category.split('&').map((g) => {
    return g.charAt(0).toUpperCase() + g.slice(1).toLowerCase();
  });

  try {
    const products = await getProductsByCategory(category);

    res.send(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/recent', async (req, res, next) => {
  try {
    const products = await getMostRecentProducts();

    res.send(products);
  } catch (error) {
    next(error);
  }
});

// POST
productsRouter.post('/', async (req, res, next) => {
  const user = verifyJWT(req.headers.authorization);

  if (!user.isAdmin) {
    return res.send(':P');
  }

  if (Object.keys(req.body).length < 10) {
    return res.status(400).send({
      name: 'InformationRequiredRequired',
      message: 'Please provide all fields required.',
    });
  }

  let {
    name,
    price,
    quantity,
    reorder,
    image,

  } = req.body;

  if (typeof categorys == 'string') {
    categorys = categorys.split(',').map((category) => category.trim());
  }

  try {
    const result = await createCar({
      name,
      price,
      quantity,
      reorder,
      image,

    });

    res.send(result);
  } catch (error) {
    next(error);
  }
});

// PATCH
productsRouter.patch('/:productID', async (req, res, next) => {
  const user = verifyJWT(req.headers.authorization);

  if (!user.isAdmin) {
    return res.send(':P');
  }

  if (Object.keys(req.body).length < 10) {
    return res.status(400).send({
      name: 'InformationRequiredRequired',
      message: 'Please provide all fields required.',
    });
  }

  const { productID } = req.params;

  let {
    name: product_name,
    categorys,
    price,
    quantity,
    image: img_url,

  } = req.body;

  if (typeof categorys == 'string') {
    categorys = categorys.split(',').map((category) => category.trim());
  }

  const productObj = {
    name,
    price,
    quantity,
    reorder,
    image,

  };

  // Input validation for setString, psql should recieve no empty keys
  Object.keys(productObj).forEach((key) => {
    if (productObj[key] === undefined) {
      delete productObj[key];
    }
  });

  try {
    const result = await updateCar(productID, productObj);

    res.send(result);
  } catch (error) {
    next(error);
  }
});

// DELETE
productsRouter.delete('/:productID', async (req, res, next) => {
  const user = verifyJWT(req.headers.authorization);

  if (!user.isAdmin) {
    return res.send(':P');
  }

  const { productID } = req.params;

  try {
    const result = await deleteCar(productID);

    res.send(result);
  } catch (error) {
    next(error);
  }
});

module.exports = productsRouter;
