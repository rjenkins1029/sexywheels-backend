const client = require('./client');

const createProduct = async ({ name, description, carId, price, image }) => {
  try {
    const {
      rows: [product],
    } = await client.query(
      `
      INSERT INTO products (name, description, "carId", price, image)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
        `,
      [name, description, carId, price, image]
    );
    return product;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getAllProducts = async () => {
  try {
    const { rows: products } = await client.query(`
      SELECT *
      FROM products;
        `);
    return products;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const getProductById = async id => {
  try {
    const { rows: products } = await client.query(
      `
      SELECT products.*, cars.name AS carname
      FROM products
      JOIN cars ON products."carId" = cars.id
      WHERE products.id = $1;
        `,
      [id]
    );
    return products[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/*const getProductByName = async name => {
  try {
    const { rows: products } = await client.query(
      `
      SELECT *
      FROM products
      WHERE name = $1;
     `,
     [name]
    );
    return products[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};*/

const getAllProductsByCarId = async id => {
  try {
    const { rows: products } = await client.query(
      `
      SELECT products.*, cars.name AS carname
      FROM products
      JOIN cars ON products."carId" = cars.id
      WHERE "carId"=$1;
        `,
      [id]
    );

    return products;
  } catch (error) {
    console.log('error getting products by car id');
    throw error;
  }
};

const getProductsByPrice = async price => {
  try {
    const { rows: products } = await client.query(
      `
      SELECT *
      FROM products
      WHERE price = $1
        `,
      [price]
    );
    return products;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const updateProduct = async (id, { ...fields }) => {
  const setString = Object.keys(fields)
    .map((key, index) => key != id && `"${key}"=$${index + 1}`)
    .join(', ');
  try {
    const { rows: products } = await client.query(
      `
      UPDATE products
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
        `,
      Object.values(fields)
    );
    return products[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const deleteProduct = async id => {
  try {
    await client.query(
      `
    DELETE FROM orderproducts
    WHERE "productId" = $1;
    `,
      [id]
    );

    const { rows: products } = await client.query(
      `
      DELETE FROM products
      WHERE products.id = $1
      RETURNING *;
        `,
      [id]
    );
    return products[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  // getProductByName,
  // getAllProductsById,
  //getProductByName,
  getAllProductsByCarId,

  getProductsByPrice,
};