function noteController($scope, $state, $element, stateEmitter) {
    this.id = $state.params.id;
    $scope.$emit('change');
    var tmp = $element.find('.tmp');
    var rect = tmp[0].getBoundingClientRect();
    var area = $element.find('textarea');
    stateEmitter.on('scrollTo', (line) => {
        area.scrollTop(rect.height * line);
    });
}

noteController.$inject = ['$scope', '$state', '$element', 'stateEmitter'];
export default noteController;
