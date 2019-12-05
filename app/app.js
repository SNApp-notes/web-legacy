import angular from 'angular';
import 'ng-notifications-bar/dist/ngNotificationsBar.min.css';
import ngNotificationsBar from 'ng-notifications-bar';
import components from './components/';
import services from './services/';
import directives from './directives/';
import uiRouter from '@uirouter/angularjs';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import config from './config';

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
    '$sceProvider',
    'rpcProvider',
    'notificationsConfigProvider',
    ($stateProvider,
     $urlRouterProvider,
     $sceProvider,
     rpcProvider,
     notificationsConfigProvider) => {
        rpcProvider.setup(config.rpc);
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
            name: 'activate',
            url: '/activate/:username/:key',
            template: '<activate></activate>'
        }).state({
            name: 'notes',
            url: '/notes/',
            template: '<notes></notes>'
        }).state({
            name: 'notes.note',
            url: ':id',
            template: '<note></note>'
        }).state({
            name: 'notes.note.section',
            url: '/:section',
            params: {
                section: {squash: true, value: null}
            }
        });
        $urlRouterProvider.otherwise('/');
        $sceProvider.enabled(false);
    }]).run(['$rootScope', '$state', '$transitions', 'auth', 'stateEmitter', (
        $rootScope, $state, $transitions, auth, stateEmitter) => {
            $rootScope.auth = auth;
            $rootScope.logout = () => {
                auth.logout().then(() => {
                    $state.go('index');
                });
            };
            $transitions.onSuccess({entering: 'notes.note.section'}, function(transition) {
                if (transition.$to().name === "notes.note.section") {
                    stateEmitter.emit('scrollTo', +$state.params.section);
                }
            });
            $rootScope.year = new Date().getFullYear();
        }]);
