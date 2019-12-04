function noteController($scope, $state) {
    this.id = $state.params.id;
}

noteController.$inject = ['$scope', '$state'];
export default noteController;
