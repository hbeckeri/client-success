let axios = require('axios');

let api = axios.create({
	baseURL: 'https://api.clientsuccess.com/v1'
});

let rejectedCalls = [];
let token = '';

function clientSuccess(username, password) {
	let methods = {
		auth: () => api.post(`/auth?username=${username}&password=${password}`),
		clients: {
			list: (params) => api.get('/clients', params),
			create: (params) => api.post('/clients', params),
			read: (clientId, params) => api.get(`/clients/${clientId}`, params),
			update: (clientId, params) => api.put(`/clients/${clientId}`, params),
			delete: (clientId, params) => api.delete(`/clients/${clientId}`, params)
		},
		contacts: {
			list: (clientId, params) => api.get(`/clients/${clientId}/contacts`, params),
			create: (clientId, params) => api.post(`/clients/${clientId}/contacts`, params),
			read: (clientId, contactId, params) => api.get(`/clients/${clientId}/contacts/${contactId}`, params),
			delete: (clientId, contactId, params) => api.delete(`/clients/${clientId}/contacts/${contactId}`, params)
		},
		contactCustomFields: (params) => api.get(`/contact-custom-fields`, params),
		interactions: {
			list: (clientId, params) => api.get(`/clients/${clientId}/interactions`, params),
			create: (clientId, params) => api.post(`/clients/${clientId}/interactions`, params),
			update: (clientId, interactionId, params) => api.put(`/clients/${clientId}/interactions/${interactionId}`, params),
			delete: (clientId, interactionId, params) => api.delete(`/clients/${clientId}/interactions/${interactionId}`, params)
		},
		todos: {
			list: (clientId, params) => api.get(`/clients/${clientId}/to-dos`, params),
			create: (clientId, params) => api.post(`/clients/${clientId}/to-dos`, params),
			read: (clientId, todoId, params) => api.get(`/clients/${clientId}/to-dos/${todoId}`, params),
			update: (clientId, todoId, params) => api.put(`/clients/${clientId}/to-dos/${todoId}`, params),
			delete: (clientId, todoId, params) => api.delete(`/clients/${clientId}/to-dos/${todoId}`, params)
		},
		pulses: {
			list: (clientId, params) => api.get(`/clients/${clientId}/pulses`, params),
			create: (clientId, params) => api.post(`/clients/${clientId}/pulses`, params)
		},
		employees: (params) => api.get(`/employees`, params),
		products: {
			list: (params) => api.get(`/products`, params),
			create: (params) => api.post(`/products`, params),
			read: (productId, params) => api.get(`/products/${productId}`, params),
			update: (productId, params) => api.put(`/products/${productId}`, params),
			delete: (productId, params) => api.delete(`/products/${productId}`, params)
		},
		clientTypes: (params) => api.get(`/client-segments`, params),
		clientStatuses: (params) => api.get(`/client-statuses`, params),
		subscriptions: (params) => api.get(`/subscriptions`, params)
	};

	function handleRefresh(originalResponse) {
		return new Promise((resolve, reject) => {
			if (originalResponse.status === 401 || (originalResponse.data.error && originalResponse.data.error.includes('invalidToken'))) {
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
