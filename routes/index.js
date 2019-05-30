const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard')
);

router.get('/edit_profile',ensureAuthenticated, (req, res) => {
	res.send('Helo World');
})

router.get('/index', (req,res)=>{
  res.render('index');
});

module.exports = router;
