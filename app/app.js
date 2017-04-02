import angular from 'angular';
import 'jquery';
import 'ng-notifications-bar/dist/ngNotificationsBar.min.css';
import ngNotificationsBar from 'ng-notifications-bar';
import components from './components/';
import services from './services/';
import directives from './directives/';
import uiRouter from 'angular-ui-router';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

var module = angular.module('app', [
    uiRouter,
    ngNotificationsBar.name,
    components.name,
    services.name,
    directives.name
]);

module.config([
    '$stateProvider',
    '$urlRouterProvider',
    'rpcProvider',
    'notificationsConfigProvider',
    ($stateProvider, $urlRouterProvider, rpcProvider, notificationsConfigProvider) => {
        rpcProvider.setup('http://localhost/projects/jcubic/notes/rpc.php');
        notificationsConfigProvider.setAcceptHTML(false);
        notificationsConfigProvider.setAutoHide(true);
        $stateProvider.state({
            name: 'login',
            url: '/login',
            template: '<login></login>'
        }).state({
            name: 'register',
            url: '/register',
            template: '<register></register>'
        }).state({
            name: 'index',
            url: '/',
            template: '<main></main>'
        }).state({
            name: 'notes',
            url: '/notes/:tab?',
            template: '<notes></notes>'
        });
        $urlRouterProvider.otherwise('/');
    }]).run(['$rootScope', 'auth', ($rootScope, auth) => {
        $rootScope.auth = auth;
    }]);
