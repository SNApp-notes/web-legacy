import angular from 'angular';
import 'jquery';
import 'ng-notifications-bar/dist/ngNotificationsBar.min.css';
import ngNotificationsBar from 'ng-notifications-bar';
import components from './components/index';
import services from './services/index';
import './app.css';

var module = angular.module('app', [
    ngNotificationsBar.name,
    components.name,
    services.name
]);

module.config(['rpcProvider', 'notificationsConfigProvider',
               (rpcProvider, notificationsConfigProvider) => {
                   rpcProvider.setup('http://localhost/projects/jcubic/notes/rpc.php');
                   notificationsConfigProvider.setAcceptHTML(false);
                   notificationsConfigProvider.setAutoHide(true);
               }]);
