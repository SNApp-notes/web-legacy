import angular from 'angular';
import usernameExists from './usernameExists';
import passwordMatch from './passwordMatch';
import scrollTo from './scrollTo';
import autofocus from './autofocus';
import resize from './resize';
import position from './position';
import enter from './enter';


var module = angular.module('directives', [])
    .directive('usernameExists', usernameExists)
    .directive('passwordMatch', passwordMatch)
    .directive('scrollTo', scrollTo)
    .directive('autofocus', autofocus)
    .directive('resize', resize)
    .directive('position', position)
    .directive('enter', enter);

export default module;
