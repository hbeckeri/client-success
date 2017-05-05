# Client Success
A 3rd party node.js library that implements the [ClientSuccess](https://www.clientsuccess.com/) API.

[Documentation](http://docs.clientsuccessapi.apiary.io/#reference)

## Instalation
```bash
npm i client-success
```

## Usage

This library uses [axios](https://github.com/mzabriskie/axios) to send HTTP request. All methods will expose the underlying `config` parameter for `axios`

```javascript
let clientSuccess = require('client-success').clientSuccess(username, password);

clientSuccess.clients.list()
  .then(response => console.log(response))
  .catch(err => console.log(err));
```
## Methods

### Clients
