const express = require('express');
const productUnitsRouter = express.Router();
const {
  createProduct,
  deleteProduct,
} = require('../db/models/products');


productUnitsRouter.post('/', async (req, res, next) => {
  try {
    const newProductUnit = await createProduct(req.body);

    res.send(newProductUnit);
  } catch (error) {
    next(error);
  }
});


productUnitsRouter.delete('/:productUnitId', async (req, res, next) => {
  const { productUnitId } = req.params;

  console.log('from the api', productUnitId)

  try {
    const deletedProductUnit = await deleteProduct
      (productUnitId);

    res.send(deletedProductUnit);
  } catch (error) {
    next(error);
  }
});

module.exports = productUnitsRouter;