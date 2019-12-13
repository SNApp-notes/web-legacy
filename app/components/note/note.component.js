import template from './note.template.html';
import controller from './note.controller';
import './note.css';

export default {
    require: {
        parent: '^^notes'
    },
    template,
    controller,
    controllerAs: 'ctrl'
};
