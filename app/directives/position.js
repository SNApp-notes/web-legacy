import $ from 'jquery';
import position from 'imports-loader?define=>false!jquery-position-event';
position(window, $);

function positionDirective() {
    return {
        restrict: 'A',
        scope: {
            position: '&'
        },
        link: function($scope, $element) {
            $element.on('position', (e) => {
                const phase = $scope.$$phase;
                if (!['$apply', '$digest'].includes(phase)) {
                    $scope.$apply(() => {
                        $scope.position({$event: e});
                    });
                } else {
                    $scope.position({$event: e});
                }
            }).trigger('position');
        }
    };
}
positionDirective.$inject = [];
export default positionDirective;
