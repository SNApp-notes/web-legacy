function activateController($state, auth) {
    auth.activate($state.params.key).then((token) => {
        if (token) {
            this.success = true;
            auth.auth($state.params.username, token);
        }
    }).catch((error) => {
        this.error = error;
    });
}
activateController.$inject = ['$state', 'auth'];
export default activateController;
