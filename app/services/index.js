import angular from 'angular';
import rpc from './rpc';

var module = angular.module('services', []);

module.provider('rpc', rpc);

export default module;
