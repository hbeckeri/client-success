require('dotenv').config();

let cs = require('./lib').clientSuccess(process.env.USERNAME, process.env.PASSWORD);

cs.clients.list()
	.then(response => console.log('res', response.data))
	.catch(err => console.log('err', err));
