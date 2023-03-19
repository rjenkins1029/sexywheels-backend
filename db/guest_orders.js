const client = require('./client');

const makeProductArray = rows => {
  let productArr = [];
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].products.length; j++) {
      productArr.push(rows[i].products[j]);
    }
  }
  rows[0].products = productArr;
  return rows[0];
};

const createGuestOrder = async (guestId, isOpen) => {
  try {
    console.log(guestId, isOpen);
    const {
      rows: [order],
    } = await client.query(
      `
      INSERT INTO orders ("guestId", "isOpen")
      VALUES (${guestId}, ${isOpen})
      RETURNING *;
        `
    );
    console.log('GUEST ORDER', order);
    return order;
  } catch (error) {
    console.log('Error creating guest order');
    throw error;
  }
};

const getOpenOrderByGuestId = async id => {
  try {
    const { rows } = await client.query(`
      SELECT orders.*, guests.id AS "guestId",
      jsonb_agg(jsonb_build_object(
        'id', products.id,
        'name', products.name,
        'price', products.price,
        'quantity', orderproducts.quantity,
        'image', products.image
      )) AS products
      FROM orders
      JOIN guests ON guests.id = orders."guestId"
      JOIN orderproducts ON orderproducts."orderId" = orders.id
      JOIN products ON orderproducts."productId" = products.id
      WHERE guests.id=${id} AND "isOpen" = true
      GROUP BY guests.id, orders.id, orderproducts.quantity;
  `);

    if (rows.length === 0) return false;

    const result = makeProductArray(rows);
    result.products.sort((a, b) => a.id - b.id);
    return result;
  } catch (error) {
    console.log('Error getting guest order by ID');
    throw error;
  }
};

const getOrderHistoryByGuestId = async id => {
  try {
    const { rows } = await client.query(`
      SELECT orders.*, guests.id AS "guestId",
      jsonb_agg(jsonb_build_object(
        'id', products.id,
        'name', products.name,
        'price', products.price,
        'image', products.image,
        'quantity', orderproducts.quantity
      )) AS products
      FROM orders
      JOIN guests ON guests.id = orders."guestId"
      JOIN orderproducts ON orderproducts."orderId" = orders.id
      JOIN products ON orderproducts."productId" = products.id
      WHERE guests.id=${id} AND "isOpen" = false
      GROUP BY guests.id, orders.id, orderproducts.quantity;
  `);

    const result = makeProductArray(rows);
    return result;
  } catch (error) {
    console.log('Error getting guest order history by ID');
    throw error;
  }
};

const checkGuestForOrderProductPair = async (guestId, orderId, productId) => {
  try {
    const {
      rows: [orderProduct],
    } = await client.query(`
        SELECT orderproducts.*
        FROM orders
        JOIN guests ON guests.id = orders."guestId"
        JOIN orderproducts ON orderproducts."orderId" = orders.id
        JOIN products ON orderproducts."productId" = products.id
        WHERE guests.id=${guestId} AND "orderId"=${orderId} AND "productId"=${productId} AND "isOpen" = true;
      `);

    return orderProduct;
  } catch (error) {
    console.log('Error checking for guest order product pair');
    throw error;
  }
};

const addProductToGuestOrder = async ({
  guestId,
  orderId,
  productId,
  quantity,
}) => {
  try {
    const check = await checkGuestForOrderProductPair(
      guestId,
      orderId,
      productId
    );
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
    console.log('Error adding product to guest order');
    throw error;
  }
};

const deleteProductFromGuestOrder = async (guestId, orderId, productId) => {
  try {
    await client.query(`
      DELETE FROM orderproducts
      WHERE "orderId"=${orderId} AND "productId"=${productId};
      `);

    const openOrder = await getOpenOrderByGuestId(guestId);

    return openOrder;
  } catch (error) {
    console.log('Error deleting product from guest order');
    throw error;
  }
};

module.exports = {
  createGuestOrder,
  getOpenOrderByGuestId,
  getOrderHistoryByGuestId,
  checkGuestForOrderProductPair,
  addProductToGuestOrder,
  deleteProductFromGuestOrder,
};