const client = require('./client');

const getAllCars = async () => {
  try {
    const { rows } = await client.query(`
      SELECT *
      FROM cars;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
};

const getCarByName = async name => {
  try {
    const {
      rows: [car],
    } = await client.query(
      `
      SELECT *
      FROM cars
      WHERE name=$1;
      `,
      [name]
    );

    return car;
  } catch (error) {
    console.log('error getting products by car name');
    throw error;
  }
};

const getCarById = async id => {
  try {
    const {
      rows: [car],
    } = await client.query(
      `
      SELECT *
      FROM cars
      WHERE id=$1
    `,
      [id]
    );

    return car;
  } catch (error) {
    console.log('error getting car by id');
    throw error;
  }
};
const getCarByPrice = async price => {
  try {
    const {
      rows: [car],
    } = await client.query(
      `
      SELECT *
      FROM cars
      WHERE price=$1
    `,
      [price]
    );

    return car;
  } catch (error) {
    console.log('error getting car by price');
    throw error;
  }
};

const createCar = async ({ name }) => {
  try {
    const {
      rows: [car],
    } = await client.query(
      `
    INSERT INTO cars (name)
    VALUES ($1)
    RETURNING *;
    `,
      [name]
    );

    return car;
  } catch (error) {
    console.log('error creating car');
    throw error;
  }
};


const updateCar = async ({ id, ...fields }) => {
  try {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(', ');

    if (setString.length > 0) {
      const {
        rows: [car],
      } = await client.query(
        `
      UPDATE cars
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `,
        Object.values(fields)
      );

      return car;
    }
  } catch (error) {
    console.log('error updating car');
    throw error;
  }
};

const deleteCar = async id => {
  try {
    const {
      rows: [car],
    } = await client.query(
      `
      DELETE FROM cars
      WHERE id=$1
      RETURNING *;
      `,
      [id]
    );

    return car;
  } catch (error) {
    console.log('error deleting car');
    throw error;
  }
};

module.exports = {
  getAllCars,
  getCarByName,
  getCarById,
  getCarByPrice,
  createCar,
  updateCar,
  deleteCar,
};