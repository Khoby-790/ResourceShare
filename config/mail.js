const ejs = require('ejs');
const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');



const transport = nodemailer.createTransport({
	host:'smtp.gmail.com',
	port:'587',
	auth:{
		user:'domeybenjamin1@gmail.com',
		pass:'ornqftprqyxfxasb',
	}
});

const generateHtml = (filename, options = {}) =>{
	const html = ejs.renderFile(`${__dirname}/../views/${filename}.ejs`,options);
	return html;
};

exports.send = async (options) => {
	let html = await generateHtml(options.filename,options);
	let text = htmlToText.fromString(html);

	const mailOptions = {
		from: 'Resource Share <noreply@resource_share.com>',
		to:options.user.email,
		subject:options.subject,
		html,
		text
	};
	return transport.sendMail(mailOptions);
};



