const client = require('./client');

const { createUser, getAllUsers, updateUser } = require('./users');
const { createCar, updateCar, getAllCars } = require('./cars');
//const { createCart, addCarToCart, getCarsInCart, getCart, deleteCartItem, deleteCart, updateCart } = require('./carts');
const {
  createProduct,
  updateProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  getProductsByPrice,
} = require('./products.js');
const { createOrder, getOrdersWithoutProducts } = require('./orders');
const { addProductToOrder } = require('./order_products');

const dropTables = async () => {
  try {
    console.log('Dropping tables...');

    await client.query(`
    DROP TABLE IF EXISTS orderproducts;
    DROP TABLE IF EXISTS products;     
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS carts;
    DROP TABLE IF EXISTS cars;        
    DROP TABLE IF EXISTS guests;
    DROP TABLE IF EXISTS users;
       
    `);
  } catch (error) {
    console.log('Error dropping tables');
    throw error;
  }
};

const buildTables = async () => {
  try {
    console.log('Building tables...');

    await client.query(`
    
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL,
          password VARCHAR(255) NOT NULL,
          "isAdmin" BOOLEAN DEFAULT false,
          "firstName" VARCHAR(50) NOT NULL,
          "lastName" VARCHAR(50) NOT NULL,
          email VARCHAR(100) NOT NULL,
          "profilePicture" VARCHAR(255),
          UNIQUE(username, email)
        );
        CREATE TABLE guests (
          id SERIAL PRIMARY KEY,
          "isAdmin" BOOLEAN DEFAULT false
        );
        CREATE TABLE cars (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) UNIQUE NOT NULL
        );
        CREATE TABLE carts(
          id SERIAL PRIMARY KEY,
          "userId" INTEGER REFERENCES users(id),
          active BOOLEAN DEFAULT true,
          UNIQUE ("userId", active)
        );
        CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          image VARCHAR(255),
          name VARCHAR(100) UNIQUE NOT NULL,
          description TEXT NOT NULL,
          "carId" INTEGER REFERENCES cars(id),
          price DECIMAL NOT NULL
        );
        CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          "userId" INTEGER REFERENCES users(id),
          "guestId" INTEGER REFERENCES guests(id),
          "isOpen" BOOLEAN DEFAULT true
        );
        CREATE TABLE orderproducts (
          id SERIAL PRIMARY KEY,
          "orderId" INTEGER REFERENCES orders(id),
          "productId" INTEGER REFERENCES products(id),
          quantity INTEGER NOT NULL,
          CONSTRAINT UC_OrderProducts UNIQUE ("orderId", "productId")
        );
    `);
  } catch (error) {
    console.log('Error building tables');
    throw error;
  }
};

const createInitialUsers = async () => {
  console.log('Creating users...');

  try {
    const usersToCreate = [
      {
        username: 'Richard',
        password: 'password',
        isAdmin: true,
        firstName: 'Richard',
        lastName: 'Jenkins',
        email: 'richardj@gmail.com',
        profilePicture: 'https://imgur.com/V4RclNb.jpg',
      },
      {
        username: 'Cecilia',
        password: 'password',
        isAdmin: true,
        firstName: 'Cecilia',
        lastName: 'Jenkins',
        email: 'ceciliaj@gmail.com',
        profilePicture: 'https://imgur.com/V4RclNb.jpg',
      },
      {
        username: 'Hang',
        password: 'password',
        isAdmin: true,
        firstName: 'Hang',
        lastName: 'Yang',
        email: 'hangy@gmail.com',
        profilePicture: 'https://imgur.com/V4RclNb.jpg',
      },
      {
        username: 'Michael',
        password: 'password',
        isAdmin: true,
        firstName: 'Michael',
        lastName: 'Pascuzzi',
        email: 'michaelp@gmail.com',
        profilePicture: 'https://imgur.com/V4RclNb.jpg',
      },
      {
        username: 'Elijah',
        password: 'password',
        isAdmin: true,
        firstName: 'Elijah',
        lastName: 'Hensel',
        email: 'elijahh@gmail.com',
        profilePicture: 'https://imgur.com/V4RclNb.jpg',
      },
      {
        username: 'Murphy',
        password: 'password',
        isAdmin: false,
        firstName: 'Murphy',
        lastName: 'Smurphy',
        email: 'murphs@gmail.com',
        profilePicture: 'https://imgur.com/V4RclNb.jpg',
      },
      {
        username: 'Stannie',
        password: 'password',
        isAdmin: false,
        firstName: 'Stannie',
        lastName: 'Jodan',
        email: 'stanniej@gmail.com',
        profilePicture: 'https://imgur.com/V4RclNb.jpg',
      },
    ];

    const users = [];

    for (const user of usersToCreate) {
      users.push(await createUser(user));
    }

    console.log('Users created:');
    // console.log(users);
    console.log('Finished creating users!');
  } catch (error) {
    console.log('Error creating initial users');
    throw error;
  }
};

const createInitialCars = async () => {
  console.log('Creating initial cars...');
  try {
    const carsToCreate = [
      { name: 'Street Power' },
      { name: 'HW Rescue' },
      { name: 'Night Burnerz' },
      { name: 'Graffiti Rides' },
      { name: 'HW City Works' },
      { name: 'Street Pest' },
      { name: 'Future Fleet' },
      { name: 'Batman' },
    ];

    const cars = [];

    for (const car of carsToCreate) {
      cars.push(await createCar(car));
    }
    console.log('Cars created:');
    // console.log(cars);
    console.log('Finished creating cars!');
  } catch (error) {
    console.log('Error creating initial cars');
    throw error;
  }
};

const createInitialProducts = async () => {
  console.log('Creating initial products...');

  try {
    const productsToCreate = [
      {
        name: 'Street Power Model Car',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        carId: 1,
        price: 30.00,
        image: 'https://hotwheels.fandom.com/wiki/List_of_2013_Hot_Wheels?file=2013_X1662_Cadillac_Sixteen.jpg',
      },
      {
        name: 'HW Rescue Model Truck',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        carId: 2,
        price: 70.00,
        image: 'https://hotwheels.fandom.com/wiki/HW_Rescue_Series_(2013)?file=5_Alarm-2013_011_Rescue.jpg',
      },
      {
        name: 'Night Burnerz Model Car',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        CarId: 3,
        price: 60.00,
        image: 'https://hotwheels.fandom.com/wiki/List_of_2013_Hot_Wheels?file=IMG04104-20121120-1352.jpg',
      },
      {
        name: 'Graffiti Rides Model Truck',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        carId: 4,
        price: 50.15,
        image: 'https://hotwheels.fandom.com/wiki/List_of_2013_Hot_Wheels?file=2013_yellow_Olds_442_W-30_raised.jpg',
      },
      {
        name: 'HW City Works Model Truck',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        carId: 5,
        price: 45.12,
        image: 'https://hotwheels.fandom.com/wiki/List_of_2013_Hot_Wheels?file=Repo_Duty-2013_050_HW_City.NM.jpg',
      },
      {
        name: 'Street Pest Model Car',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        carId: 6,
        price: 40.05,
        image: 'https://hotwheels.fandom.com/wiki/List_of_2013_Hot_Wheels?file=Arachnorod_1_side.jpg',
      },
      {
        name: 'Future Fleet Model Car',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        carId: 8,
        price: 50.38,
        image: 'https://hotwheels.fandom.com/wiki/List_of_2013_Hot_Wheels?file=Max_Steel_Motorcycle-2013_59_%2528New_Models%2529.jpg',
      },
      {
        name: 'Batman Model Car',
        description: `Metal Construction Vehicles includes dumper, bulldozers, forklift, roller, excavator and mixer. truck in one box,random delivery.
        Engineering truck toys are made of Non-toxin Free Materials,ABS plastic and alloy material. Designed for little kids' hands, small enough for little hand to hold or put in a pocket and go,and removable joints bring more fun to the children. 
        Ability to carry and transport sand.A creative way to encourage hand-eye coordination and fine motor development. r and can run fast on street`,
        carId: 7,
        price: 49.99,
        image: 'https://hotwheels.fandom.com/wiki/List_of_2013_Hot_Wheels?file=Batman_Arkham_Asylum_Batmobile.jpg',
      },
    ];

    const products = [];

    for (const product of productsToCreate) {
      products.push(await createProduct(product));
    }
    console.log('Products created:');
    console.log(products);
    console.log('Finished creating products!');
  } catch (error) {
    console.log('Error creating initial products');
    throw error;
  }
};

const createInitialOrders = async () => {
  console.log('Creating initial orders...');
  try {
    const ordersToCreate = [
      { userId: 1, isOpen: true },
      { userId: 2, isOpen: true },
      { userId: 3, isOpen: true },
      { userId: 4, isOpen: true },
    ];

    const orders = [];

    for (const order of ordersToCreate) {
      const userId = order.userId;
      const isOpen = order.isOpen;
      orders.push(await createOrder(userId, isOpen));
    }
    console.log('Orders created:');
  
  //  console.log(orders);
    console.log('Finished creating orders!');
  } catch (error) {
    console.log('Error creating initial orders');
    throw error;
  }
};

const createInitialOrderProducts = async () => {
  console.log('Creating intial order products...');

  try {
    const [order1, order2, order3, order4] = await getOrdersWithoutProducts();
    const [product1, product2, product3, product4, product5, product6] =
      await getAllProducts();

    const orderProductsToCreate = [
      {
        userId: 1,
        orderId: order1.id,
        productId: product1.id,
        quantity: 1,
      },
      {
        userId: 1,
        orderId: order1.id,
        productId: product2.id,
        quantity: 2,
      },
      {
        userId: 1,
        orderId: order1.id,
        productId: product3.id,
        quantity: 4,
      },
      {
        userId: 2,
        orderId: order2.id,
        productId: product4.id,
        quantity: 1,
      },
      {
        userId: 2,
        orderId: order2.id,
        productId: product1.id,
        quantity: 2,
      },
      {
        userId: 3,
        orderId: order3.id,
        productId: product5.id,
        quantity: 10,
      },
      {
        userId: 4,
        orderId: order4.id,
        productId: product6.id,
        quantity: 5,
      },
    ];

    const orderProducts = [];

    for (const orderProduct of orderProductsToCreate) {
      orderProducts.push(await addProductToOrder(orderProduct));
    }

    console.log('Order products created:');
  
  //  console.log(orderProducts);
    console.log('Finished creating order products');
  } catch (error) {
    console.log('Error creating order products');
    throw error;
  }
};


const rebuildDB = async () => {
  try {
    await dropTables();
    await buildTables();
    await createInitialUsers();
    await createInitialCars();
    await createInitialProducts();
    await createInitialOrders();
    await createInitialOrderProducts();
  } catch (error) {
    console.log('Error during rebuildDB');
    throw error;
  }
};

const testDB = async () => {
  try {
    console.log('Testing database...');

    console.log('Calling getAllUsers');
    const users = await getAllUsers();

    console.log('Calling updateUsers on users[0]');
    const updateUserResult = await updateUser(users[0].id, {
      username: 'David Smith',
      password: 'NewPassword',
      isAdmin: false,
      firstName: 'David',
      lastName: 'Smith',
      email: 'thisismyemail@gmail.com',
    });

    console.log('Calling getAllCars');
    const cars = await getAllCars();

    console.log('Calling updateCar on cars[0]');
    const updateCarResult = await updateCar(cars[0].id, {
      name: 'Brand New Model Car',
    });

    console.log('Calling getAllProducts');
    const products = await getAllProducts();
    console.log('Result: ', products);

    console.log('Calling getProductById on products with the id of 3');
    const getProductByIdResult = await getProductById(3);
    console.log('Result: ', getProductByIdResult);

    console.log('Calling getProductByPrice with the price of $10');
    const getProductsByPriceResult = await getProductsByPrice(10);
    console.log('Result: ', getProductsByPriceResult);

    console.log('Calling updateProduct on products[0]');
    const updateProductResult = await updateProduct(products[0].id, {
      name: 'Brand New Product',
      description: 'That New Model Car',
      carId: 1,
      price: 100,
    });
    console.log('Result: ', updateProductResult);

    console.log('Calling deleteProduct on products[0]');
    const deleteProductResult = await deleteProduct(products[0].id);
    console.log('Result: ', deleteProductResult);

    console.log('Database tested!');
  } catch (err) {
    console.log('Error testing database!');
    throw err;
  }
};

module.exports = { rebuildDB, testDB, dropTables, buildTables };