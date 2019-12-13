import angular from 'angular';
import usernameExists from './usernameExists';
import passwordMatch from './passwordMatch';
import scrollTo from './scrollTo';
import autofocus from './autofocus';
import resize from './resize';
import position from './position';

var module = angular.module('directives', [])
    .directive('usernameExists', usernameExists)
    .directive('passwordMatch', passwordMatch)
    .directive('scrollTo', scrollTo)
    .directive('autofocus', autofocus)
    .directive('position', position)
    .directive('resize', resize);

export default module;
