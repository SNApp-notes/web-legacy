function scrollTo() {
    return {
        restrict: 'A',
        scope: {
            scrollTo: '=',
            parent: '@'
        },
        link: function($scope, $elm) {
            if ($scope.scrollTo) {
                var $parent = $elm.closest($scope.parent);
                var {top} = $elm.offset();
                $parent.scrollTop(top + $parent.scrollTop());
            }
        }
    };
}
scrollTo.$inject = [];
export default scrollTo;
