//klud.js
//https://bitbucket.org/zserge/klud.js/
//modified to include a minimal reporter
(function(G) {
    "use strict";

    // deep-equal function
    function deepEq(a, b) {
        if (typeof a !== typeof b) {
            return false;
        }
        if (a instanceof Function) {
            return a.toString() === b.toString();
        }
        if (a === b || a.valueOf() === b.valueOf()) {
            return true;
        }
        if (!(a instanceof Object)) {
            return false;
        }
        var ka = Object.keys(a);
        if (ka.length != Object.keys(b).length) {
            return false;
        }
        for (var i in b) {
            if (!b.hasOwnProperty(i)) {
                continue;
            }
            if (ka.indexOf(i) === -1) {
                return false;
            }
            if (!deepEq(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }

    // simple spy (function collecting its calls)
    function spy(f, o) {
        var s = function() {
            var result;
            s.called = s.called || [];
            s.thrown = s.thrown || [];
            if (f) {
                try {
                    result = f.apply(o || f.this, arguments);
                    s.thrown.push(undefined);
                } catch (e) {
                    s.thrown.push(e);
                }
            }
            s.called.push(arguments);
            return result;
        };
        return s;
    }

    var pendingTests = [];
    var runNextTest = function() {
        if (pendingTests.length > 0) {
            pendingTests[0](runNextTest);
        } else {
            testHandler('finalize');
        }
    };

    var env = G;
    var testHandler = function(evt, test, msg) {
        console.log(({
            begin:  "[==] Started:  " + test,
            end:    "     Finished: " + test + "\n",
            pass:   " [ ] Passed:   " + msg,
            fail:   " [!] Failed:   " + msg,
            except: " [#] Error:    "    + msg,
        })[evt]);
    };

    G.test = function(name, f, async) {
        if (typeof name == 'function') {
            testHandler = name;
            env = f || G;
            return;
        }
        var testfn = function(next) {
            var prev = {
                ok: env.ok,
                spy: env.spy,
                eq: env.eq
            };

            var handler = testHandler;

            var restore = function() {
                env.ok = prev.ok;
                env.spy = prev.spy;
                env.eq = prev.eq;
                handler('end', name);
                pendingTests.shift();
                if (next) next();
            };

            env.eq = deepEq;
            env.spy = spy;
            env.ok = function(cond, msg) {
                cond = !!cond;
                if (cond) {
                    handler('pass', name, msg);
                } else {
                    handler('fail', name, msg);
                }
            };

            handler('begin', name);
            try {
                f(restore);
            } catch (e) {
                handler('except', name, e);
            }
            if (!async) {
                handler('end', name);
                env.ok = prev.ok;
                env.spy = prev.spy;
                env.eq = prev.eq;
            }
        };
        if (!async) {
            testfn();
        } else {
            pendingTests.push(testfn);
            if (pendingTests.length == 1) {
                runNextTest();
            }
        }
    };
})((function() {return this;}.call())); // use whatever global object

