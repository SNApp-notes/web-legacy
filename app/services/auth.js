function service(rpc) {
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
    var set = (username, token) => {
        localStorage.setItem(token_key, token);
        localStorage.setItem(name_key, username);
        this.username = username;
        this.token = token;
    }
    this.auth = (username, token) => {
        set(username, token);
    };
    this.authenticated = () => {
        return rpc.then((service) => {
            return service.valid_token(this.username, this.token).then(function(valid) {
                if (!valid) {
                    clear();
                }
                return valid;
            });
        });
    };
    this.register = (username, email, password) => {
        return rpc.then((service) => {
            return service.register(username, email, password);
        });
    };
    this.login = (username, password) => {
        return rpc.then((service) => {
            return service.login(username, password).then((token) => {
                if (token) {
                    set(username, token);
                }
                return token;
            });
        });
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
            });
        });
    };
}
service.$inject = ['rpc'];
export default service;
