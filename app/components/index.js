import angular from 'angular';
import main_component from './main/main.component';
import login_component from './login/login.component';
import register_component from './register/register.component';
import notes_component from './notes/notes.component';

var module = angular.module('components', [])
    .component('main', main_component)
    .component('login', login_component)
    .component('register', register_component)
    .component('notes', notes_component)

export default module;
