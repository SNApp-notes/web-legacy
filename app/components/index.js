import angular from 'angular';
import main_component from './main/main.component';

var module = angular.module('components', []);
module.component('main', main_component);

export default module;
