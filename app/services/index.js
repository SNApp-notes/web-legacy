import angular from 'angular';
import rpc from './rpc';
import auth from './auth';

var module = angular.module('services', [])
    .provider('rpc', rpc)
    .service('auth', auth);

export default module;
