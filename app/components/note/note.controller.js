function notesController($scope, $state) {
    this.id = $state.params.id;
    $scope.$emit('change');
}
notesController.$inject = ['$scope', '$state'];
export default notesController;
