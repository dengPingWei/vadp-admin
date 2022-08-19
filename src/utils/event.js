/**
 * Created by huangzhangshu on 2017/8/28
 */
const events = {};

function on(name, self, callback) {
    if (has(name)) return;
    var tuple = [self, callback];
    var callbacks = events[name];
    if (Array.isArray(callbacks)) {
        callbacks.push(tuple);
    }
    else {
        events[name] = [tuple];
    }
}

function remove(name, self) {
    var callbacks = events[name];
    if (Array.isArray(callbacks)) {
        events[name] = callbacks.filter((tuple) => {
            return tuple[0] != self;
        })
    }
}

function emit(name, data) {
    var callbacks = events[name];
    if (Array.isArray(callbacks)) {
        callbacks.map((tuple) => {
            var self = tuple[0];
            var callback = tuple[1];
            callback.call(self, data);
        })
    }
}

function has(name) {
    var callbacks = events[name];
    if (callbacks) {
        if (Array.isArray(callbacks)) {
            if (callbacks.length > 0) {
                return true;
            } else {
                return false;
            }
        }
    } else {
        return false;
    }
}

events.on = on;
events.remove = remove;
events.emit = emit;
events.has = has;

export default events;
