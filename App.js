const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const crypto = require('crypto');
const fs = require('fs');
const port = 5001;
const app = express();
app.use(express.json());

app.listen(port);
console.log('App is running on port: ' + port);

function sendRequest() {
	axios
		.post('http://44.202.179.158:8080/start', {
			banner: process.env.BANNER,
			ip: '34.237.220.67:5001',
		})
		.then((res) => {
			console.log(res);
		})
		.catch((error) => {
			console.log(error);
		});
}
sendRequest();
app.post('/decrypt', (req, res) => {
	const base64String = req.body.message;
	const binaryData = Buffer.from(base64String, 'base64');
	const privateKey = fs.readFileSync('./private_key.pem', 'utf8');
	try {
		const decryptedDataBuffer = crypto.privateDecrypt(
			{
				key: privateKey,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
			},
			binaryData
		);
		const binaryBuffer = Buffer.from(decryptedDataBuffer);
		const decryptedString = binaryBuffer.toString('utf8');
		res.status(200).send({
			response: decryptedString,
		});
	} catch (error) {
		console.error(error);
	}
});

app.post('/encrypt', (req, res) => {
	const plainData = req.body.message;
	const plainDataBuffer = Buffer.from(plainData, 'utf-8');
	const publicKey = fs.readFileSync('./public_key.pem', 'utf8');
	const encryptedData = crypto.publicEncrypt(
		{
			key: publicKey,
			padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		},
		plainDataBuffer
	);
	const buffer = Buffer.from(encryptedData, 'utf8');
	const response = buffer.toString('base64');
	res.status(200).json({
		response,
	});
});
