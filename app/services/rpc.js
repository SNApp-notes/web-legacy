import $ from 'jquery';

export default function() {
    var id = 1;
    function request(method, params) {
        return JSON.stringify({id: id++, method: method, params: params || []});
    }
    var uri;
    this.setup = function(user_uri) {
        uri = user_uri;
    };
    this.$get = ['$http', '$q', function($http, $q) {
        function rpc(method, params) {
            return $http({
                method: 'POST',
                url: uri,
                data: request(method, params)
            }).then(response => response.data);
        }
        var defer = $q.defer();
        return rpc('system.describe').then(data => {
            var service = {};
            data.result.procs.forEach(spec => {
                service[spec.name] = function(...args) {
                    if (args.length == spec.params.length) {
                        return rpc(spec.name, args).then(data => {
                            if (data.error) {
                                throw data.error;
                            } else {
                                return data.result;
                            }
                        });
                    } else {
                            return $q.reject('Invalid arity expected ' +
                                             spec.params.length +
                                             ' got ' +
                                             args.length);
                    }
                };
            });
            return service;
        });
    }];
};
