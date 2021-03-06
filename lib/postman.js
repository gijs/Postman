(function() {
  var cache, createCache, deliver, dropByDate, dropByFunction, dropMessages, isArray, isDate, isFunction, postie, receive, retract;
  cache = {};
  postie;
  isArray = function(obj) {
    return obj.constructor === Array;
  };
  isFunction = function(obj) {
    return obj.constructor === Function;
  };
  isDate = function(obj) {
    return obj.constructor === Date;
  };
  createCache = function(name) {
    return cache[name] = {
      subs: [],
      history: []
    };
  };
  deliver = function(name, args) {
    var fn, _i, _len, _ref;
    if (!cache[name]) {
      createCache(name);
    }
    if (!args) {
      args = [];
    }
    if (!isArray(args)) {
      args = [args];
    }
    args = {
      created: new Date(),
      lastPublished: new Date(),
      args: args
    };
    cache[name].history.push(args);
    _ref = cache[name].subs;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fn = _ref[_i];
      fn.apply(this, args.args);
    }
    return postie;
  };
  receive = function(name, fn, ignoreHistory) {
    var arg, _i, _len, _ref;
    if (!cache[name]) {
      createCache(name);
    }
    cache[name].subs.push(fn);
    if (!ignoreHistory) {
      _ref = cache[name].history;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        fn.apply(this, arg.args);
        arg.lastPublished = new Date();
      }
    }
    return postie;
  };
  retract = function(name, fn) {
    var index, subs;
    if (!cache[name]) {
      createCache(name);
    }
    if (!fn) {
      cache[name].subs = [];
    } else {
      subs = cache[name].subs;
      index = subs.indexOf(fn);
      if (index > -1) {
        subs.splice(0, index).concat(subs.splice(index, subs.length));
      }
    }
    return postie;
  };
  dropMessages = function(name, criteria) {
    if (!cache[name]) {
      createCache(name);
    }
    if (criteria) {
      if (isFunction(criteria)) {
        cache[name].history = dropByFunction(criteria, cache[name].history);
      }
      if (isDate(criteria)) {
        cache[name].history = dropByDate(criteria, cache[name].history);
      }
    } else {
      cache[name].history = [];
    }
    return postie.deliver('dropMessage.' + name);
  };
  dropByFunction = function(fn, msgs) {
    return msgs.reduce(fn);
  };
  dropByDate = function(date, msgs) {
    return msgs.reduce(function(x) {
      return x.created < date;
    });
  };
  postie = {
    deliver: deliver,
    receive: receive,
    dropMessages: dropMessages,
    retract: retract
  };
  this.postman = postie;
}).call(this);
