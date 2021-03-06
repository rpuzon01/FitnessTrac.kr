const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;
const { createUser, getUser, getUserByUsername } = require('../db/users');
const { getPublicRoutinesByUser } = require('../db/routines');
const { getAllRoutinesByUser } = require('../db/routines')
const { requireUser } = require('./utils');

router.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (password.length < 8) {
            next({message: 'Password Too Short!'});
            return;
        }

        const dupeUser = await getUserByUsername(username);
        if (dupeUser) {
            next({message: 'A user by that username already exists'});
            return;
        }

        const user = await createUser({username, password});
        res.send({user});
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if(!username || !password) {
        next({
            name: "MissingFieldError",
            message: "You must provide a username and a password"
        })
        return;
    }

    try {
        const user = await getUser({username, password});

        if(!user) {
            next({
                name: "IncorrectCredentialsError",
                message: "Incorrect username or password"
            });
            return;
        }

        const token = jwt.sign(user, JWT_SECRET);
        res.send({token});
    } catch (error) {
        next(error);
    }
});

router.get('/me', requireUser, async (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const user = jwt.verify(token, JWT_SECRET);
            res.send({...user});
        } else {
            return next({message: 'You must be logged in to perform this action'});
        }
    } catch (error) {
        next(error);
    }
});

router.get('/:username/routines', async (req, res, next) => {
    const { username } = req.params;
    let _username = (req.user) ? req.user.username : null;
    try {
        if (_username === username) {
            const routines = await getAllRoutinesByUser({username});
            res.send(routines);
        } else {
            const routines = await getPublicRoutinesByUser({ username })
            res.send(routines);
        }
    } catch (error) {
        next(error);
    }
});


module.exports = router;
