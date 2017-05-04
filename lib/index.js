let axios = require('axios');
let _ = require('lodash');

let api = axios.create({
	baseURL: 'https://api.clientsuccess.com/v1'
});

let rejectedCalls = [];
let token = '';

function clientSuccess(username, password) {
	let methods = {
		auth: () => api.post(`/auth?username=${username}&password=${password}`),
		clients: {
			list: () => api.get('/clients'),
			create: (body) => api.post('/clients', body),
			read: (clientId) => api.get(`/clients/${clientId}`),
			update: (clientId, body) => api.put(`/clients/${clientId}`, body),
			delete: (clientId) => api.delete(`/clients/${clientId}`)
		},
		contacts: {
			list: (clientId) => api.get(`/clients/${clientId}/contacts`),
			create: (clientId, body) => api.post(`/clients/${clientId}/contacts`, body),
			read: (clientId, contactId) => api.get(`/clients/${clientId}/contacts/${contactId}`),
			delete: (clientId, contactId) => api.delete(`/clients/${clientId}/contacts/${contactId}`)
		},
		contactCustomFields: () => api.get(`/contact-custom-fields`),
		interactions: {
			list: (clientId) => api.get(`/clients/${clientId}/interactions`),
			create: (clientId, body) => api.post(`/clients/${clientId}/interactions`, body),
			update: (clientId, interactionId, body) => api.put(`/clients/${clientId}/interactions/${interactionId}`, body),
			delete: (clientId, interactionId) => api.delete(`/clients/${clientId}/interactions/${interactionId}`)
		}
	};

	function handleRefresh(originalResponse) {
		return new Promise((resolve, reject) => {
			if (originalResponse.status === 401 || _.get(originalResponse, 'data.error', '').includes('invalid_token')) {
				rejectedCalls.push({ config: originalResponse.config, resolve, reject });

				return methods.auth(username, password)
					.then(r => {
						token = r.data.access_token;

						rejectedCalls.forEach(call => {
							delete call.config.transformRequest;
							delete call.config.transformResponse;

							call.config.headers.Authorization = token;
							axios(call.config).then(call.resolve).catch(call.reject);
						});

						rejectedCalls = [];
					})
					.catch(err => {
						rejectedCalls = [];
						return reject(originalResponse);
					});
			}

			return resolve(originalResponse);
		});
	}

	api.interceptors.request.use(config => {
		config.headers = Object.assign({}, config.headers, { Authorization: token });
		return config;
	});

	api.interceptors.response.use(res => handleRefresh(res), err => handleRefresh(err.response));

	return methods;
}


exports.clientSuccess = clientSuccess;
