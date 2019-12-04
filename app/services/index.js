import angular from 'angular';
import rpc from './rpc';
import auth from './auth';
import storage from './storage';
import stateEmitter from './stateEmitter';

var module = angular.module('services', [])
    .provider('rpc', rpc)
    .service('auth', auth)
    .service('storage', storage)
    .service('stateEmitter', stateEmitter);

export default module;
