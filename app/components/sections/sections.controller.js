function sectionsController($scope, $state, stateEmitter) {
    this.id = stateEmitter.get('note');
    stateEmitter.on('note', (note) => {
        this.id = note;
    });
    this.scrollToEvent = ($event, line) => {
        stateEmitter.emit('scrollTo', line);
    };
}

sectionsController.$inject = ['$scope', '$state', 'stateEmitter'];
export default sectionsController;
