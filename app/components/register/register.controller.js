function registerController(auth) {
    this.register = ($event) => {
        $event.preventDefault();
        auth.register(this.username, this.email, this.password).then((key) => {
            if (typeof key == 'string') {
                auth.activate(key).then((activated) => {
                    if (activated) {
                        this.error = "Email fail, account auto activated.";
                        auth.login(this.username, this.password);
                    } else {
                        this.error = "Email fail. We try to auto activate your account, " +
                            "but fail.";
                    }
                    this.registered = true;
                });
            } else {
                this.registered = true;
            }
        });
    };
}
registerController.$inject = ['auth'];
export default registerController;
