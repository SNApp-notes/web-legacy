import angular from 'angular';
import main_component from './main/main.component';
import login_component from './login/login.component';

var module = angular.module('components', [])
    .component('main', main_component)
    .component('login', login_component);

export default module;
