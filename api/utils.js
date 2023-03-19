
const express = require('express');

const jwt = require('jsonwebtoken');

const { getUserById } = require('../db/users');
const { JWT_SECRET, JWT_SECRET_ADMIN } = process.env;

const checkAuthorization = async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) {
        res.status(401);
        next({
            error: '401',
            name: 'UnauthorizedError',
            message: 'You must be logged in to perform this action.'
        });
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(token, JWT_SECRET);

            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch ({ error, name, message }) {
            next({ error, name, message });
        }
    } else {
        res.status(401);
        next({
            error: '401',
            name: 'UnauthorizedError',
            message: 'You must be logged in to perform this action.'
        });
    }
}

const checkAdmin = async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if (!auth) {
        res.status(401);
        next({
            error: '401',
            name: 'UnauthorizedError',
            message: 'You must be an admin to perform this action.'
        });
    } else if (auth.startsWith(prefix)) {
        const adminToken = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(adminToken, JWT_SECRET_ADMIN);

            if (id) {
                next();
            } else {
                res.status(401);
                next({
                    error: '401',
                    name: 'UnauthorizedAdminError',
                    message: 'You must be an admin to perform this action.'
                });
            }
        } catch ({ error, name, message }) {
            next({ error, name, message });
        }
    } else {
        res.status(401);
        next({
            error: '401',
            name: 'UnauthorizedError',
            message: 'You must be logged in to perform this action.'
        });
    }
}

module.exports = {
    checkAuthorization,
    checkAdmin
}