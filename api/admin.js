const express = require("express");
const adminRouter = express.Router();
const {
    getAllUsers,
    getAllOrders,
    getUserById,
    getUserByEmail,
    updateUser,
    createAdmin,
    createUser,
    createInactiveUser,
    getOrderById,
    getOrdersByUser,
    createCar,
    updateCar,
    deleteCar,
    getCategoryById,
    getCarById,
    addCarToCategory,
    createCategory,
    updateStatus,
    getAllInactiveUsers,
    deleteInactiveUser,
    deleteCarFromCategory,
    deleteCategory
} = require('../db');
const { checkAdmin } = require("./utils");

adminRouter.get('/users/:userId', checkAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user.id) {
            res.status(404);
            next({
                error: '404',
                name: 'UserNotFoundError',
                message: 'User not found'
            })
        } else {
            res.send(user);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})

// GET /api/admin/users/inactive
adminRouter.get('/users/inactive', checkAdmin, async (req, res, next) => {
    try {
        const inactiveUsers = await getAllInactiveUsers();

        res.send(inactiveUsers);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.get('/users', checkAdmin, async (req, res, next) => {
    try {
        const users = await getAllUsers();

        res.send(users);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.patch('/users/:userId', checkAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { ...fields } = req.body;

        const user = await getUserById(userId);

        if (!user.id) {
            res.status(404);
            next({
                error: '404',
                name: 'UserNotFoundError',
                message: 'User not found'
            })
        }

        if (req.body.email) {
            const userByEmail = await getUserByEmail(req.body.email);

            if (userByEmail.id && userByEmail.id !== userId) {
                res.status(403);
                next({
                    error: '403',
                    name: 'EmailInUseError',
                    message: 'That email is already in use'
                })
            } else {
                const updatedUser = await updateUser({ userId, ...fields });
    
                if (!updatedUser.id) {
                    res.status(400);
                    next({
                        error: '400',
                        name: 'UserUpdateError',
                        message: 'Unable to update user info'
                    })
                } else {
                    res.send(updatedUser);
                }
            }
        } else {
            const updatedUser = await updateUser({ userId, ...fields });

            if (!updatedUser.id) {
                res.status(400);
                next({
                    error: '400',
                    name: 'UserUpdateError',
                    message: 'Unable to update user info'
                })
            } else {
                res.send(updatedUser);
            }
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.patch('/users/promote/:userId', checkAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user.id) {
            res.status(404);
            next({
                error: '404',
                name: 'UserNotFoundError',
                message: 'User not found'
            })
        } else {
           
            const newAdmin = createAdmin(userId);
            res.send(newAdmin);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.patch('/users/reset/:userId', checkAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user.id) {
            res.status(404);
            next({
                error: '404',
                name: 'UserNotFoundError',
                message: 'User not found'
            })
        } else {
            
            const targetUser = createUser(userId);
            res.send(targetUser);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.post('/users/reactivate/:userId', checkAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user.id) {
            res.status(404);
            next({
                error: '404',
                name: 'UserNotFoundError',
                message: 'User not found'
            })
        } else {
            const reactivatedUser = deleteInactiveUser(userId);
            res.send(reactivated);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.delete('/users/:userId', checkAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user.id) {
            res.status(404);
            next({
                error: '404',
                name: 'UserNotFoundError',
                message: 'User not found'
            })
        } else {
            const deletedUser = createInactiveUser(userId);
            res.send(deletedUser);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.get('/orders/:userId', checkAdmin, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await getUserById(userId);

        if (!user.id) {
            res.status(404);
            next({
                error: '404',
                name: 'UserNotFoundError',
                message: 'User not found'
            })
        } else {
            const orders = await getOrdersByUser();
            res.send(orders);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.get('/orders/:orderId', checkAdmin, async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const order = await getOrderById(orderId);

        if (!order.id) {
            res.status(404);
            next({
                error: '404',
                name: 'OrderNotFoundError',
                message: 'Order not found'
            })
        } else {
            res.send(order);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.get('/orders', checkAdmin, async (req, res, next) => {
    try {
        const orders = await getAllOrders();
        res.send(orders);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.patch('/orders/status/:orderId', checkAdmin, async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await getOrderById(orderId);

        if (!order.id) {
            res.status(404);
            next({
                error: '404',
                name: 'OrderNotFoundError',
                message: 'Order not found'
            })
        } else {
            const updatedOrder = await updateStatus({ id: orderId, status })
            res.send(updatedOrder);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.get('/puppies', checkAdmin, async (req, res, next) => {
    try {
        const puppies = await getAllPupppies();
        res.send(puppies);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})

adminRouter.post('/puppies/categories', checkAdmin, async (req, res, next) => {
    try {
        const { name } = req.body;

        if (typeof name !== "string") {
            res.status(400)
            next({
                error: '400',
                name: 'InvalidNameError',
                message: 'That is not a valid category name'
            })
        } else {
            const category = createCategory(name);
    
            if (!category.id) {
                res.status(400);
                next({
                    error: '400',
                    name: 'DuplicateCategoryError',
                    message: 'There is already a category with that name'
                })
            }
            
            res.send(category);
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    }
})


adminRouter.post('/puppies/tagged_puppies', checkAdmin, async (req, res, next) => {
    try {
        const { categoryId, carId } = req.body;
        const category = await getCategoryById(categoryId)
        
        if (!category.id) {
            res.status(404);
            next({
                error: '404',
                name: 'CategoryNotFoundError',
                message: 'Category not found'
            })
        }

        const car = await getCarById(carId);

        if (!car.id) {
            res.status(404);
            next({
                error: '404',
                name: 'carNotFoundError',
                message: 'car not found'
            })
        }

        const taggedcar = addCarToCategory(categoryId, carId);
        res.send(taggedcar)
    } catch ({ error, name, message }) {
        next({ error, name, message });
    }
})

adminRouter.post('/puppies', checkAdmin, async (req, res, next) => {
    try {
        const {
            name,
            description,
            image1,
            image2,
            isAvailable,
            price
        } = req.body;
        const car = createCar({
            name,
            description,
            image1,
            image2,
            isAvailable,
            price
        });

        if (!car.id) {
            res.status(400);
            next({
                error: '400',
                name: 'carCreationError',
                message: 'Unable to create car'
            })
        }
        
        res.send(car);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    }
})


adminRouter.patch('/puppies/:carId', checkAdmin, async (req, res, next) => {
    try {
        const { carId } = req.params;
        const { ...fields } = req.body;

        const car = await getcarById(carId);

        if (!car.id) {
            res.status(404);
            next({
                error: '404',
                name: 'carNotFoundError',
                message: 'car not found'
            })
        } else {
            const updatedcar = await updateCar({ carId, ...fields });

            if (!updatedcar.id) {
                res.status(400);
                next({
                    error: '400',
                    name: 'carUpdateError',
                    message: 'Unable to update car info'
                })
            } else {
                res.send(updatedcar);
            }
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.delete('puppies/categories/:categoryId', checkAdmin, async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        const deletedCategory = await deleteCategory(categoryId);
        res.send(deletedCategory)

    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.delete('puppies/tagged_puppies/:carId/:categoryId', checkAdmin, async (req, res, next) => {
    try {
        const { carId, categoryId } = req.params;

        const deletedcar = await deleteCarFromCategory(carId, categoryId);
        res.send(deletedcar)

    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


adminRouter.delete('puppies/:carId', checkAdmin, async (req, res, next) => {
    try {
        const { carId } = req.params;
        const car = await getcarById(carId);

        if (!car.id) {
            res.status(404);
            next({
                error: '404',
                name: 'carNotFoundError',
                message: 'car not found'
            })
        } else {
            const deletedcar = await deleteCar(carId);
            res.send(deletedcar)
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})

module.exports = adminRouter;