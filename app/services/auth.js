function service($q, rpc) {
    var token_key = 'notes_token';
    var name_key = 'notes_username';
    this.token = localStorage.getItem(token_key);
    this.username = localStorage.getItem(name_key);
    var clear = () => {
        localStorage.removeItem(token_key);
        localStorage.removeItem(name_key);
        delete this.token;
        delete this.username;
    };
    this.auth = (username, token) => {
        localStorage.setItem(token_key, token);
        localStorage.setItem(name_key, username);
        this.username = username;
        this.token = token;
    };
    this.authenticated = () => {
        if (!this.auth_promise) {
            this.auth_promise = rpc.then((service) => {
                return service.valid_token(this.username, this.token).then(function(valid) {
                    if (!valid) {
                        clear();
                    }
                    return valid;
                });
            });
        }
        return this.auth_promise;
    };
    this.register = (username, email, password) => {
        return rpc.then((service) => {
            return service.register(username, email, password);
        });
    };
    this.login = (username, password) => {
        this.auth_promise = rpc.then((service) => {
            return service.login(username, password).then((token) => {
                if (token) {
                    this.auth(username, token);
                }
                return token;
            });
        });
        return this.auth_promise;
    };
    this.activate = (key) => {
        return rpc.then((service) => {
            return service.activate(key);
        });
    };
    this.logout = (username, password) => {
        return rpc.then((service) => {
            return service.logout(this.token, this.username).then(() => {
                clear();
                delete this.auth_promise;
            });
        });
    };
}
service.$inject = ['$q', 'rpc'];
export default service;
