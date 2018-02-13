function storageService(rpc, auth) {
    this.create_note = (note) => {
        return rpc.then((service) => {
            return service.create_note(auth.token, auth.username, note);
        });
    };
    this.save_note = (note) => {
        return rpc.then((service) => {
            return service.save_note(auth.token, auth.username, note);
        });
    };
    this.get_notes = () => {
        return rpc.then((service) => {
            return service.get_notes(auth.token, auth.username);
        });
    };
    this.remove_note = (note_id) => {
        return rpc.then((service) => {
            return service.remove_note(auth.token, auth.username, note_id);
        });
    };
}
storageService.$inject = ['rpc', 'auth'];
export default storageService;
