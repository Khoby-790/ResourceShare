const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Load User model
const User = require('../models/User');
const crypto = require('crypto')
// const mail = require('../config/mail')


exports.registerAction = (req, res, next) =>{
	const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
};

exports.loginAction = passport.authenticate('local', {
    failureRedirect: '/users/login',
    failureFlash: true
});

exports.redirectLogin = (req, res) => {
	let path = req.session.returnTo;
	delete req.session.returnTo;
	res.redirect(path || '/dashboard');

};

exports.logout = (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
};

exports.resetPage = (req,res) => {
	res.render('reset_account');
};

exports.forgot = async (req, res) => {
	let user = await User.findOne({email:req.body.email});
	if(!user){
		req.flash('success_msg','A password reset has been sent successfully');
		return res.redirect('/users/login');
	}
	//set token
	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();
	let resetURL = `http://${req.headers.host}/users/reset_account/${user.resetPasswordToken}`;
	//send mail

	req.flash('success_msg',`A password reset link has been mailed to ${req.body.email}, ${resetURL}`);
	res.redirect('/users/login');
};

exports.resetAccount = async (req, res) => {
	let user = await User.findOne({
		resetPasswordToken:req.params.token,
		resetPasswordExpires: { $gt: Date.now()}
	});
	if(!user){
		req.flash('error_msg','Password reset token is invalid or has expired');
		res.redirect('/users/login');
	}

	res.render('reset_password');
};

exports.confirmPasswords = (req, res, next) => {
	req.checkBody('password','Password field is empty').notEmpty();
	req.checkBody('password1','Confirm Password field is empty').notEmpty();
	req.checkBody('password1','Oops your passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();
	if(errors){
		req.flash('error_msg',errors.map(err => err.msg));
		res.redirect('back');
		return;
	}

	next();
};


exports.resetAccountAction = (req, res) => {
	User.findOne({
		resetPasswordToken:req.params.token,
		resetPasswordExpires:{$gt:Date.now()}
	})
	.then(user => {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		user.password = req.body.password
	  	bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.password, salt, (err, hash) => {
            if (err) throw err;
            user.password = hash;
            user
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'Your password has been reset successfully'
                );
                return res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });

	})
	.catch(err => {
		req.flash('error_msg','Password token is invalid or has expired');
		req.redirect('users/login');
	});

};