function scrollTo() {
    return {
        restrict: 'A',
        scope: {
            scrollTo: '=',
            parent: '@'
        },
        link: function($scope, $elm) {
            if ($scope.scrollTo) {
                var {top} = $elm.offset();
                $elm.closest($scope.parent).scrollTop(top);
            }
        }
    };
}
scrollTo.$inject = [];
export default scrollTo;
