function notesController() {
    this.tabs = [];
    var index = 1;
    this.newTab = () => {
        this.tabs.push({
            name: 'new Note ' + index++,
            content: ''
        });
        this.selected = this.tabs.length - 1;
    };
}
notesController.$inject = [];
export default notesController;
