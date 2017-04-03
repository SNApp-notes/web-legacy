import angular from 'angular';
import rpc from './rpc';
import auth from './auth';
import storage from './storage';

var module = angular.module('services', [])
    .provider('rpc', rpc)
    .service('auth', auth)
    .service('storage', storage);

export default module;
