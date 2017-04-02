import angular from 'angular';
import usernameExists from './usernameExists';
import passwordMatch from './passwordMatch';

var module = angular.module('directives', [])
    .directive('usernameExists', usernameExists)
    .directive('passwordMatch', passwordMatch)

export default module;
