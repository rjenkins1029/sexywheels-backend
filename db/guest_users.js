const client = require('./client');

const createGuest = async isAdmin => {
  try {
    const {
      rows: [guest],
    } = await client.query(
      `
      INSERT INTO guests ("isAdmin")
      VALUES ($1)
      RETURNING id;
    `,
      [isAdmin]
    );
    console.log('GUEST', guest);
    return guest;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getAllGuests = async () => {
  try {
    const guests = await client.query(`
      SELECT *
      FROM guests;
    `);

    if (guests) return guests;
    else return false;
  } catch (error) {
    console.log('Error getting all guests');
    throw error;
  }
};

const getGuestById = async guestId => {
  try {
    const guest = await client.query(`
      SELECT *
      FROM guests
      WHERE id=${guestId};
    `);

    return guest;
  } catch (error) {
    console.log('Error getting guest by Id');
    throw error;
  }
};

const deleteGuest = async (guestId, orderId) => {
  try {
    const guestToDelete = await getGuestById(guestId);
    if (guestToDelete) {
      await client.query(`
      DELETE FROM orderproducts
      WHERE "orderId"=${orderId};
      `);

      await client.query(`
      DELETE FROM orders
      WHERE "guestId"=${guestId};
      `);

      await client.query(`
      DELETE FROM guests
      WHERE id = ${guestId};
      `);

      return guestToDelete;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = {
  createGuest,
  getAllGuests,
  getGuestById,
  deleteGuest,
};