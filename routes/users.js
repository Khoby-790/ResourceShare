const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');
const AuthController = require('../controller/AuthController');
const {catchErrors} = require('../config/errorHandlers');
// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', AuthController.registerAction);

// Login
router.post('/login', AuthController.loginAction, AuthController.redirectLogin);

// Logout
router.get('/logout', AuthController.logout);

//reset page
router.get('/reset_account', forwardAuthenticated, AuthController.resetPage);
router.post('/reset_account', catchErrors(AuthController.forgot));
router.get('/reset_account/:token',  catchErrors(AuthController.resetAccount));
router.post('/reset_account/:token',  AuthController.confirmPasswords,AuthController.resetAccountAction);

module.exports = router;
