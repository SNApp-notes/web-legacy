import $ from 'jquery';

function charSize() {
    var $node = $('<div class="tmp">&nbsp;</div>');
    $node.appendTo('body');
    var {width, height} = $node[0].getBoundingClientRect();
    this.$get = () => {
        return { width, height };
    };
}

export default charSize;
