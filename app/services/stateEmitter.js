function stateEmitter() {
    var state = {};
    var events = [];
    this.on = function(name, fn) {
        events[name] = events[name] || [];
        events[name].push(fn);
    };
    this.get = function(name) {
        return state[name];
    };
    this.off = function(name, fn) {
        if (events[name]) {
            if (fn) {
                events[name] = events[name].filter(f => fn == f);
            } else {
                delete events[name];
            }
        }
    };
    this.emit = function(name, data) {
        state[name] = data;
        if (events[name]) {
            for (let fn of events[name]) {
                fn(data);
            }
        }
    };
};
stateEmitter.$inject = [];
export default stateEmitter;
