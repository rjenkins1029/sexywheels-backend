const client = require('./client');
const { getOpenOrderByUserId } = require('./orders');

const getOrderProductById = async id => {
  try {
    const {
      rows: [orderProduct],
    } = await client.query(`
      SELECT *
      FROM orderproducts
      WHERE id=${id};
    `);

    return orderProduct;
  } catch (error) {
    console.log('Error getting order product by ID');
    throw error;
  }
};

const checkForOrderProductPair = async (userId, orderId, productId) => {
  try {
    const {
      rows: [orderProduct],
    } = await client.query(`
      SELECT orderproducts.*
      FROM orders
      JOIN users ON users.id = orders."userId"
      JOIN orderproducts ON orderproducts."orderId" = orders.id
      JOIN products ON orderproducts."productId" = products.id
      WHERE users.id=${userId} AND "orderId"=${orderId} AND "productId"=${productId} AND "isOpen" = true;
    `);

    return orderProduct;
  } catch (error) {
    console.log('Error checking for order product pair');
    throw error;
  }
};

const addProductToOrder = async ({ userId, orderId, productId, quantity }) => {
  try {
    const check = await checkForOrderProductPair(userId, orderId, productId);
    if (!check) {
      const {
        rows: [orderProduct],
      } = await client.query(`
        INSERT INTO orderproducts ("orderId", "productId", quantity)
        VALUES (${orderId}, ${productId}, ${quantity})
        RETURNING *;
      `);

      return orderProduct;
    }
  } catch (error) {
    console.log('Error adding product to order');
    throw error;
  }
};

const updateOrderProduct = async (id, quantity) => {
  try {
    {
      await client.query(
        `
        UPDATE orderproducts
        SET quantity = ${quantity}
        WHERE id=${id}
        RETURNING *;
      `
      );
    }

    return await getOrderProductById(id);
  } catch (error) {
    console.log('Error updating order product');
    throw error;
  }
};

const deleteProductFromOrder = async (userId, orderId, productId) => {
  try {
    await client.query(`
    DELETE FROM orderproducts
    WHERE "orderId"=${orderId} AND "productId"=${productId};
    `);

    const openOrder = await getOpenOrderByUserId(userId);

    return openOrder;
  } catch (error) {
    console.log('Error deleting product from order');
    throw error;
  }
};

module.exports = {
  addProductToOrder,
  getOrderProductById,
  checkForOrderProductPair,
  updateOrderProduct,
  deleteProductFromOrder,
};