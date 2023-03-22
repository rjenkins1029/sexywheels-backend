const express = require('express')
const cartsRouter = express.Router()
const { getActiveCarts,
    getCartsByUser,
    getCart,
    updateCart,
    createCart,
    deleteCart,
    getActiveCartByUser,
    getCartWithCars,
    deleteCartItem } = require('../db/carts')
const { checkAuthorization } = require("./utils");

// addCarToCart,
// getCarsInCart,
// ,

cartsRouter.get('/', checkAuthorization, async (req, res, next) => {
    try {
        const { id: userId } = req.user;

        const cartItems = await getCartByUser(userId);
        let subtotal = 0;
        for (let item of cartItems) {
            subtotal += item.price;
        }
        const cart = {
            cartItems,
            subtotal
        }

        res.send(cart);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})
const { requireUser } = require("./utils")

cartsRouter.get('/', checkAuthorization, async (req, res, next) => {
    try {
        const { id: userId } = req.user;

        const cartItems = await getCartsByUser(userId);
        let subtotal = 0;
        for (let item of cartItems) {
            subtotal += Number(item.price);
        }
        const cart = {
            cartItems,
            subtotal
        }

        res.send(cart);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})



cartsRouter.get('/:cartId',checkAuthorization, async (req, res, next) => {
    const { cartId } = req.params
    try {
        const cart = await getCartWithCars(cartId)
        if (cart) {
            if (req.user.id == cart.userId || req.user.id == 1) {
                res.send(cart)
            } else {
                next({
                    error: "UnauthorizedUser",
                    message: `Not authorized to view this cart`
                })
            }
        } else {
            res.status(404)
            next({
                error: "CartDoesNotExist",
                message: `There is no cart id:${cartId}`
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message })
    }
})

cartsRouter.get('/active/:userId', checkAuthorization, async (req, res, next) => {
    const { userId } = req.params

    try {
        if (req.user.id == userId || req.user.id == 1) {
            const userCart = await getActiveCartByUser(userId)
            res.send(userCart)
        } else {
            next({
                name: "UnauthorizedUser",
                message: `Not authorized.`
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message })
    }
})

//  ORDER HISTORY ROUTE THAT GETS ALL INACTIVE CARTS
cartsRouter.get('/inactive/:userId', checkAuthorization, async (req, res, next) => {
    const { userId } = req.params




    try {
        const user = await getUserByUserId(userId)
        if (user) {
            if (req.user.id == userId || req.user.id == 1) {
                const userCarts = await getCartsByUser(userId)
                const inactiveCarts = userCarts.filter((elem) => elem.active === null)
                res.send(inactiveCarts)
            } else {
                next({
                    name: "UnauthorizedUser",
                    message: `Not authorized.`
                })
            }
        } else {
            next({
                name: "InvalidUserId",
                message: `No user with ID ${userId} exists`
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message })
    }
})
// ** END **

cartsRouter.post("", checkAuthorization, async (req, res, next) => {
    const userCarts = await getCartsByUser(req.user.id)
    const activeCart = userCarts.find((elem) => elem.active === true)
    if (activeCart) {
        next({
            name: "ExistingUserCart",
            message: `This user already has an active cart.`
        })
    } else {
        const newCart = await createCart(req.user.id)
    }
})


cartsRouter.patch('/:cartId', checkAuthorization, async (req, res, next) => {
    const { cartId } = req.params
    const fields = req.body
    if (JSON.stringify(fields) !== JSON.stringify({ active: null })) {
        next({
            name: "WrongBody",
            message: "the body of the request must contain active"
        })
    }
    try {
        const existingCart = await getCart(cartId)
        if (req.user.id == existingCart.userId || req.user.id == 1) {
            const newCart = await updateCart({ cartId, ...fields })
            res.send(newCart);
        } else {
            next({
                name: "UnauthorizedUser",
                message: `You are not authorized to update this cart`
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message })
    }
})

cartsRouter.delete('/:cartId', checkAuthorization, async (req, res, next) => {
    const { cartId } = req.params
    try {
        const existingCart = await getCart(cartId)
        console.log(existingCart);
        if (existingCart) {
            if (req.user.id == 1) {
                const trashCart = await deleteCart(cartId)
                res.send(trashCart)
            } else {
                next({
                    name: "UnauthorizedUser",
                    message: `Not authorized.`
                })
            }
        } else {
            res.status(404)
            next({
                name: "NoCart",
                message: `No cart with that ID exists`
            })
        }

    } catch ({ error, name, message }) {
        next({ error, name, message })
    }
})

cartsRouter.delete('/:cartItemId', checkAuthorization, async (req, res, next) => {
    try {
        const { cartItemId } = req.params;
        const cartItem = await getCartItemById(cartItemId);

        if (cartItem.id) {
            const deletedCartItem = await deleteCartItem(cartItemId);
    
            res.send(deletedCartItem);
        } else {
            res.status(404);
            next({
                error: '404',
                name: 'CartItemNotFoundError',
                message: 'Cart item not found'
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    }
})
cartsRouter.patch('cars/:carId', checkAuthorization, async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { carId } = req.params;
        const car = await getCarById(carId);

        if (car.isAvailable) {
            const cartItem = await addCarToCart({ userId, carId });
    
            res.send(cartItem);
        } else {
            res.status(404);
            next({
                error: '404',
                name: 'CarNotAvailableError',
                message: 'Car not available'
            })
        }
    } catch ({ error, name, message }) {
        next({ error, name, message });
    }
})

module.exports = cartsRouter