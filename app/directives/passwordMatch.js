export default function() {
   return {
      require: 'ngModel',
      scope: {
        passwordMatch: '='
      },
      link: function(scope, element, attrs, model) {
        scope.$watch(function() {
            var combined;
            if (scope.passwordMatch || model.$viewValue) {
               combined = scope.passwordMatch + '_' + model.$viewValue;
            }
            return combined;
        }, function(value) {
            if (value) {
                model.$parsers.unshift(function(viewValue) {
                    var origin = scope.passwordMatch;
                    if (origin !== viewValue) {
                        model.$setValidity('passwordMatch', false);
                        return undefined;
                    } else {
                        model.$setValidity('passwordMatch', true);
                        return viewValue;
                    }
                });
            }
        });
     }
   };
};
