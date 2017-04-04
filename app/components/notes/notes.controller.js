function notesController($state, auth, storage, notifications) {
    this.notes = [];

    auth.authenticated().then((authenticated) => {
        if (authenticated) {
            storage.get_notes(auth.token, auth.username).then((notes) => {
                this.notes = notes;
                this.selected = 0;
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
                storage.remove_note(auth.token, note.id).then((success) => {
                    this.notes.splice(index, 1);
                });
            }
        }
    };

    this.keydown = ($event, index) => {
        if ($event.ctrlKey) {
            var key = $event.key.toUpperCase();
            if (key == 'S') {
                $event.preventDefault();
                var note = this.notes[index];
                if (note.newNote) {
                    storage.create_note(auth.token, note).then((id) => {
                        note.newNote = false;
                        note.id = id;
                        note.unsaved = false;
                    });
                } else {
                    storage.save_note(auth.token, note).then(()=> {
                        note.unsaved = false;
                    });
                }
            } else if (key == 'V') {
                note.unsaved = false;
            }
        }
    };
    this.change = ($event, index) => {
        if (!$event.ctrlKey && $event.key.toUpperCase() != 'CONTROL') {
            this.notes[index].unsaved = true;
        }
    };
}
notesController.$inject = ['$state', 'auth', 'storage', 'notifications'];
export default notesController;
