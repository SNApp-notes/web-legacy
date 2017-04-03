function storageService(rpc, auth) {
    this.create_note = (token, note) => {
        return rpc.then((service) => {
            return service.create_note(token, auth.username, note);
        });
    };
    this.save_note = (token, note) => {
        return rpc.then((service) => {
            return service.save_note(token, auth.username, note);
        });
    };
    this.get_notes = (token) => {
        return rpc.then((service) => {
            return service.get_notes(token, auth.username);
        });
    };
    this.remove_note = (token, note_id) => {
        return rpc.then((service) => {
            return service.remove_note(token, auth.username, note_id);
        });
    };
}
storageService.$inject = ['rpc', 'auth'];
export default storageService;
