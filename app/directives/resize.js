import $ from 'jquery';
import resize from 'imports-loader?define=>false!jquery.resize';
resize($);

function resizeDirective() {
    return {
        restrict: 'A',
        scope: {
            resize: '&'
        },
        link: function($scope, $element) {
            $element.on('resize', () => {
                const phase = $scope.$$phase;
                if (!['$apply', '$digest'].includes(phase)) {
                    $scope.$apply($scope.resize);
                } else {
                    $scope.resize();
                }
            });
            $scope.$on('$destroy', function() {
                $element.off('resize');
            });
        }
    };
}

resizeDirective.$inject = [];
export default resizeDirective;
