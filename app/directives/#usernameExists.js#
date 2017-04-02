function usernameExists(rpc, $timeout) {
    return {
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope, elm, attr, model) {
            rpc.then((service) => {
                model.$validators.usernameExists = function() {
                    return service.username_taken(model.$viewValue).then((taken) => {
                        model.$setValidity('usernameExists', !taken);
                    });
                };
            });
        }
    };
}
usernameExists.$inject = ['rpc', '$timeout'];
export default usernameExists;
