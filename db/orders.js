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

const createOrder = async (userId, isOpen) => {
  try {
    const {
      rows: [order],
    } = await client.query(
      `
      INSERT INTO orders ("userId", "isOpen")
      VALUES (${userId}, ${isOpen})
      RETURNING *;
    `
    );
    return order;
  } catch (error) {
    console.log('Error creating order');
    throw error;
  }
};

const getOrdersWithoutProducts = async () => {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM orders;
    `);
    return rows;
  } catch (error) {
    console.log('Error getting orders without products');
    throw error;
  }
};

const getAllOrders = async () => {
  try {
    const { rows } = await client.query(`
    SELECT orders.*, username,
    jsonb_agg(jsonb_build_object(
      'id', products.id,
      'name', products.name,
      'price', products.price,
      'quantity', orderproducts.quantity,
      'image', products.image
    )) AS products
    FROM orders
    JOIN orderproducts ON orderproducts."orderId" = orders.id
    JOIN products ON orderproducts."productId" = products.id
    JOIN users ON users.id = orders."userId"
    GROUP BY users.id, orders.id, orderproducts.quantity;
`);
    console.log('GET ALL ORDERS:', rows);

    return rows;
  } catch (error) {
    console.log('Error getting all orders');
    throw error;
  }
};

const getOpenOrderByUserId = async id => {
  try {
    const { rows } = await client.query(`
    SELECT orders.*, username,
    jsonb_agg(jsonb_build_object(
      'id', products.id,
      'name', products.name,
      'price', products.price,
      'quantity', orderproducts.quantity,
      'image', products.image
    )) AS products
    FROM orders
    JOIN users ON users.id = orders."userId"
    JOIN orderproducts ON orderproducts."orderId" = orders.id
    JOIN products ON orderproducts."productId" = products.id
    WHERE users.id=${id} AND "isOpen" = true
    GROUP BY users.id, orders.id, orderproducts.quantity;
`);
    if (rows.length === 0) return false;

    const result = makeProductArray(rows);
    result.products.sort((a, b) => a.id - b.id);
    return result;
  } catch (error) {
    console.log('Error getting order by ID');
    throw error;
  }
};

const getOrderById = async id => {
  try {
    const { rows } = await client.query(`
    SELECT orders.*, username,
    jsonb_agg(jsonb_build_object(
      'id', products.id,
      'name', products.name,
      'price', products.price,
      'quantity', orderproducts.quantity
    )) AS products
    FROM orders
    JOIN users ON users.id = orders."userId"
    JOIN orderproducts ON orderproducts."orderId" = orders.id
    JOIN products ON orderproducts."productId" = products.id
    WHERE orders.id=${id}
    GROUP BY users.id, orders.id, orderproducts.quantity;
`);

    const result = makeProductArray(rows);
    return result;
  } catch (error) {
    console.log('Error getting order by ID');
    throw error;
  }
};

const updateOrder = async (id, fields = {}) => {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  try {
    if (setString.length > 0) {
      await client.query(
        `
        UPDATE orders
        SET ${setString}
        WHERE id=${id}
        RETURNING *;
      `,
        Object.values(fields)
      );
    }

    return await getOrderById(id);
  } catch (error) {
    console.log('Error updating order');
    throw error;
  }
};

const deleteOrder = async orderId => {
  try {
    const deletedOrder = await getOrderById(orderId);

    await client.query(`
      DELETE from orderproducts
      WHERE "orderId"=${deletedOrder.id};
    `);

    await client.query(`
      DELETE from orders
      WHERE id=${orderId}
    `);

    return deletedOrder;
  } catch (error) {
    console.log('Error deleting order');
    throw error;
  }
};

const getOrderHistoryById = async id => {
  try {
    const { rows } = await client.query(`
    SELECT orders.*, username,
    jsonb_agg(jsonb_build_object(
      'id', products.id,
      'name', products.name,
      'price', products.price,
      'image', products.image,
      'quantity', orderproducts.quantity
    )) AS products
    FROM orders
    JOIN users ON users.id = orders."userId"
    JOIN orderproducts ON orderproducts."orderId" = orders.id
    JOIN products ON orderproducts."productId" = products.id
    WHERE users.id=${id} AND "isOpen" = false
    GROUP BY users.id, orders.id, orderproducts.quantity;
`);

    const result = makeProductArray(rows);
    return result;
  } catch (error) {
    console.log('Error getting order by ID');
    throw error;
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOpenOrderByUserId,
  getOrderById,
  getOrdersWithoutProducts,
  updateOrder,
  deleteOrder,
  getOrderHistoryById,
};