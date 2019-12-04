function autofocus() {
    return {
        restrict: 'A',
        scope: {
            autofocus: '='
        },
        link: function($scope, $elm) {
            if ($scope.autofocus) {
                $elm.focus();
            }
        }
    };
}
autofocus.$inject = [];
export default autofocus;
