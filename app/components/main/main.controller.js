import svg from './notes.svg';

function mainController($state, auth) {
    this.svg = svg;
    auth.authenticated().then((authenticated) => {
        if (authenticated) {
            $state.go('notes');
        }
    });
}
mainController.$inject = ['$state', 'auth'];

export default mainController;
