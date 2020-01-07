function parse(text) {
    var re = /\n(-+\n:: .*\n-+)\n/;
    var re_begin = /^(-+\n:: .*\n-+)/;
    var re_end = /(-+\n:: .*\n-+)$/;
    var re_extract = /-+\n:: (.*)\n-+/;
    var parts = text.split(re);
    // sanity checks to remove empty splits that are no empyt lines
    if (text.match(re_begin) && parts[0] === '') {
        parts.shift();
    }
    if (text.match(re_end) && parts[parts.length-1] === '') {
        parts.pop();
    }
    return parts.map(text => {
        let lines = text.split(/\n/);
        return {
            header: () => {
                const m = text.match(re_extract);
                if (m) {
                    return m[1];
                }
            },
            lines
        };
    });
}
function getSections(text, numChars) {
    var line = 0;
    var result = [];
    var parts = parse(text);
    for (let part of parts) {
        var count = part.lines.map(line => {
            return line.length === 0 ? 1 : Math.ceil(line.length / numChars);
        }).reduce((a,b) => a + b, 0);
        const label = part.header();
        if (label) {
            result.push({label, line});
        }
        line += count;
    }
    return result;
}
import $ from 'jquery';
function notesController(
    $scope, $state, $timeout, auth, storage, notifications, stateEmitter, charSize
) {
    this.notes = [];
    var numChars;

    stateEmitter.emit('note', $state.params.id || 0);
    // -----------------------------------------------------------------------------------
    stateEmitter.on('width', (width) => {
        numChars = Math.floor(width / charSize.width);
        const note = this.selected;
        if (note) {
            note.sections = getSections(note.content, numChars);
        }
    });
    // -----------------------------------------------------------------------------------
    $scope.$on('change', () => {
        if ($state.params.id) {
            this.selected = this.notes[$state.params.id];
            if (this.selected) {
                stateEmitter.emit('note', this.selected.index);
            }
        }
    });
    // -----------------------------------------------------------------------------------
    $scope.$on('scrollTo', (line) => {
        $scope.$broadcast('scrollTo', line);
    });
    // -----------------------------------------------------------------------------------
    var init = (notes) => {
        this.notes = notes;
        if (numChars) {
            Object.keys(notes).forEach((key, i) => {
                const {content} = notes[key];
                notes[key].index = i;
                notes[key].sections = getSections(content, numChars);
            });
        } else {
            Object.keys(notes).forEach((key, i) => {
                const {content} = notes[key];
                notes[key].index = i;
            });
        }
        if ($state.params.id > 0 && $state.params.id < notes.length) {
            this.selected = notes[$state.params.id];
            this.jump = this.selected;
        } else {
            this.selected = notes[0];
            $state.go('notes.note', {id: 0});
        }
        if ($state.params.section) {
            $timeout(() => {
                stateEmitter.emit('scrollTo', +$state.params.section);
            }, 0);
        }
    };
    // -----------------------------------------------------------------------------------
    auth.authenticated().then((authenticated) => {
        if (authenticated) {
            storage.get_notes().then((notes) => {
                $timeout(() => init(notes), 0);
            }).catch((error) => {
                notifications.showError({message: error});
            });
        } else {
            $state.go('index');
        }
    });

    // -----------------------------------------------------------------------------------
    var index = 1;
    this.newNote = () => {
        this.selected.edit = false;
        var note = {
            name: 'new Note ' + index++,
            content: '',
            index: this.notes.length,
            edit: true,
            newNote: true,
            unsaved: true
        };
        this.notes.push(note);
        this.selected = note;
        $state.go('notes.note', {id: note.index});
    };
    // -----------------------------------------------------------------------------------
    this.edit = (note) => {
        note.newName = note.name;
        note.edit = true;
    };

    // -----------------------------------------------------------------------------------
    this.inputKeyUp = ($event, index) => {
        var note = this.notes[index];
        if ($event.which == 13) {
            note.name = note.newName;
            note.unsaved = true;
            note.edit = false;
        } else if ($event.which == 27) {
            note.edit = false;
        }
    };

    // -----------------------------------------------------------------------------------
    var removeNote = (note) => {
        for (let i in this.notes) {
            if (this.notes[i] === note) {
                this.notes.splice(i, 1);
                break;
            }
        }
    };

    // -----------------------------------------------------------------------------------
    this.deleteNote = (note) => {
        if (confirm('Are you sure you want to delete this note?')) {
            if (note.newNote) {
                removeNote(note);
                this.notes.splice(index, 1);
            } else {
                storage.remove_note(note.id).then((success) => {
                    removeNote(note);
                });
            }
        }
    };

    // -----------------------------------------------------------------------------------
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
    // -----------------------------------------------------------------------------------
    this.position = (e) => {
        $scope.position = e;
    };
    // -----------------------------------------------------------------------------------
    this.change = ($event, index) => {
        var key = $event.key.toUpperCase();
        if ((!$event.ctrlKey && key != 'CONTROL' && !key.match(/ARROW|PAGE|END|HOME/)) ||
            ($event.ctrlKey && ['X', 'V'].includes(key))) {
            const note = this.notes[index];
            const {content} = note;
            note.sections = getSections(content, numChars);
            note.unsaved = true;
        }
    };
}
notesController.$inject = [
    '$scope', '$state', '$timeout', 'auth', 'storage',
    'notifications', 'stateEmitter', 'charSize'
];
export default notesController;
