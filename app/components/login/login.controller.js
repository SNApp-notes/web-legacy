function loginController(auth, $state) {
    this.login = ($event) => {
        $event.preventDefault();
        auth.login(this.username, this.password).then((token) => {
            if (token) {
                $state.go('notes');
            }
        }).catch((error) => {
            this.error = error;
        });
    };
    auth.authenticated().then((authenticated) => {
        if (authenticated) {
            $state.go('notes');
        }
    });
}
loginController.$inject = ['auth', '$state'];
export default loginController;
