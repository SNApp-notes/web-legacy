import template from './sections.template.html';
import controller from './sections.controller';
import './sections.css';

export default {
    require: {
        parent: '^notes'
    },
    template,
    controller,
    controllerAs: 'ctrl'
};
