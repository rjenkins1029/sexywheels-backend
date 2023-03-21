const express = require("express");
const categoriesRouter = express.Router();
const { getAllCategories, getCarsByCategory } = require('../db/category');
const { getAllProducts } = require('../db/products')


categoriesRouter.get('/categories', async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.send(categories);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})



categoriesRouter.get('/tagged_cars/:categoryId', async (req, res, next) => {
    try {
        const params = req.params;
        const categoryId = Number(params.categoryId);
        const taggedCars = await getCarsByCategory({ categoryId });

        res.send(taggedCars);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


categoriesRouter.get('/:carId', async (req, res, next) => {
    try {
        const { carId } = req.params;
        const car = await getCarById(carId);

        if (!car) {
            res.status(404);
            next({
                error: '404',
                name: 'CarNotFoundError',
                message: 'Car not found'
            })
        }

        res.send(car);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})


categoriesRouter.get('/', async (req, res, next) => {
    try {
        const cars = await getAllProducts();
        res.send(cars);
    } catch ({ error, name, message }) {
        next({ error, name, message });
    } 
})

module.exports = categoriesRouter;