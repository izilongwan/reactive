function defineProperties(tar) {
  if (!tar || typeof tar !== 'object') {
    return;
  }

  if (({}).toString.call(tar) === '[object Array]') {
    handleArray(tar);
  }

  for (const key in tar) {
    createDefineProperty(tar, key, tar[key]);
  }
}

function createDefineProperty(tar, key, value) {
  if (tar.hasOwnProperty(key)) {
    defineProperties(value);

    const handler = {
      get() {
        console.log('[GET]', key);
        return value;
      },
      set(newValue) {
        if (value !== newValue) {
          console.log('[SET]', key, newValue);
          defineProperties(newValue);
          value = newValue;
        }
      }
    }

    Object.defineProperty(tar, key, handler);
  }
}

function handleArray(array) {
  const originProto = Array.prototype,
        newProto    = Object.create(originProto),
        methods = ['push', 'pop', 'unshift', 'shift', 'sort', 'splice', 'reverse'];

  methods.forEach(method => {
    newProto[method] = function() {
      // do something
      let args    = [].slice.call(arguments),
          newArgs = [];

      switch (method) {
        case 'push':
        case 'unshift':
          newArgs = args;
          break;

        case 'splice':
          newArgs = args.slice(2);
          break;

        default:
      }
      newArgs.forEach(val => defineProperties(val));

      return originProto[method].apply(this, args);
    }

    array.__proto__ = newProto;
  })
}

const data = {
  name: 'Lee',
  age: 18,
  hobbys: [1, 2, 3],
  inherit: {
    money: 999
  }
};

defineProperties(data);
data.age = { num: 18 };
data.hobbys.push(0);
data.hobbys = [];
