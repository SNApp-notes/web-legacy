function noteController($rootScope, $scope, $state, $element, stateEmitter, charSize) {
    this.id = $state.params.id;
    $scope.$emit('change');
    var area = $element.find('textarea');

    this.onResize = () => {
        stateEmitter.emit('width', $element.find('.wrapper').innerWidth());
    };
    this.onResize();

    stateEmitter.on('scrollTo', (line) => {
        area.scrollTop(charSize.height * line);
    });
}

noteController.$inject = [
    '$rootScope', '$scope', '$state', '$element', 'stateEmitter', 'charSize'
];
export default noteController;
