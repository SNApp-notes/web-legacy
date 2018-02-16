function notesController($scope, $state, auth, storage, notifications) {
    this.notes = [];
    $scope.$on('change', () => {
        this.selected = $state.params.id;
    });
    auth.authenticated().then((authenticated) => {
        if (authenticated) {
            storage.get_notes().then((notes) => {
                this.notes = notes;
                if ($state.params.id > 0 && $state.params.id < notes.length) {
                    this.selected = $state.params.id;
                } else {
                    this.selected = 0;
                    $state.go('notes.note', {id: 0});
                }
            }).catch((error) => {
                notifications.showError({message: error});
            });
        } else {
            $state.go('index');
        }
    });

    var index = 1;
    this.newNote = () => {
        this.notes.push({
            name: 'new Note ' + index++,
            content: '',
            newNote: true,
            unsaved: true
        });
        this.selected = this.notes.length - 1;
    };
    this.edit = (index) => {
        var note = this.notes[index];
        note.newName = note.name;
        note.edit = true;
    };

    this.input_keyup = ($event, index) => {
        var note = this.notes[index];
        if ($event.which == 13) {
            note.name = note.newName;
            note.unsaved = true;
            note.edit = false;
        } else if ($event.which == 27) {
            note.edit = false;
        }
    };

    this.deleteNote = (index) => {
        if (confirm('Are you sure you want to delete this note?')) {
            var note = this.notes[index];
            if (note.newNote) {
                this.notes.splice(index, 1);
            } else {
                storage.remove_note(note.id).then((success) => {
                    this.notes.splice(index, 1);
                });
            }
        }
    };

    this.keydown = ($event, index) => {
        if ($event.ctrlKey) {
            var key = $event.key.toUpperCase();
            var note = this.notes[index];
            if (key == 'S') {
                $event.preventDefault();
                if (note.newNote) {
                    storage.create_note(note).then((id) => {
                        note.newNote = false;
                        note.id = id;
                        note.unsaved = false;
                    });
                } else {
                    storage.save_note(note).then(()=> {
                        note.unsaved = false;
                    });
                }
            } else if (key == 'V') {
                note.unsaved = true;
            }
        }
    };
    this.change = ($event, index) => {
        var key = $event.key.toUpperCase();
        if (!$event.ctrlKey && key != 'CONTROL' && !key.match(/ARROW|PAGE/)) {
            this.notes[index].unsaved = true;
        }
    };
}
notesController.$inject = ['$scope', '$state', 'auth', 'storage', 'notifications'];
export default notesController;
