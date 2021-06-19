const hash = new WeakMap(),
      raw = new WeakMap();

const stacks = [];

const weakmap = new WeakMap();

function isObject(data) {
  return data && typeof data === 'object';
}

function reactive(data) {
  if (!isObject(data)) {
    return data;
  }

  let ret = hash.get(data);

  if (ret) {
    return ret;
  }

  ret = raw.get(data);

  if (ret) {
    return data;
  }

  return createReactive(data);
}

function createReactive(data) {
  const handlers = {
    get(tar, key, receiver) {
      // console.log(`[GET] ${key}`);
      const res =  Reflect.get(tar, key, receiver);

      trace(tar, key);

      return reactive(res);
    },

    set(tar, key, value, receiver) {
      const oldValue = Reflect.get(tar, key, receiver);
      const res = Reflect.set(tar, key, value, receiver);

      if (!tar.hasOwnProperty(key)) {
        console.log(`[ADD] ${key} ${value}`);
        trigger(tar, key);
      }

      else if (oldValue !== value) {
        console.log(`[UPDATE] ${key} ${value}`);
        trigger(tar, key);
      }

      return res;
    },

    deleteProperty (tar, key) {
      console.log(`[DELETE] ${key} ${value}`);
      return Reflect.defineProperty(tar, key);
    }
  }

  ret = new Proxy(data, handlers);

  hash.set(data, ret);
  raw.set(ret, data);

  return ret;
}

function effect(fn) {
  return createReactiveEffect(fn)();
}

function createReactiveEffect(fn) {
  const effect = function() {
    return run(effect, fn);
  }

  return effect;
}

function run(effect, fn) {
  try {
    stacks.push(effect);
    fn();
  }

  catch (error) {
    console.log(error);
  }

  finally {
    stacks.pop();
  }
}

function trace(tar, key) {
  const effect = stacks[stacks.length - 1];

  if (!effect) {
    return;
  }

  let tarMap = weakmap.get(tar);

  if (!tarMap) {
    weakmap.set(tar, (tarMap = new Map()));
  }

  let keySet = tarMap.get(key);

  if (!keySet) {
    tarMap.set(key, (keySet = new Set()));
  }

  !keySet.has(effect) && keySet.add(effect);
}

function trigger(tar, key) {
  const tarMap = weakmap.get(tar);

  if (!tarMap) {
    return;
  }

  const keySet = tarMap.get(key);

  if (!keySet) {
    return;
  }

  keySet.forEach(effect => effect());
}

const data = {
  name: 'Lee',
  age: 18,
  hobbys: [1, 2, 3],
  inherit: {
    money: 999
  }
};

const proxy = reactive(data);

effect(() => {
  console.log('🚀 ~ file: vue3.js ~ line 149', proxy.age)
})

effect(() => {
  console.log('🚀 ~ file: vue3.js ~ line 153', proxy.hobbys[4]);
})

proxy.age = 10;
proxy.hobbys[4] = 0;
// proxy.hobbys.push(10);
// proxy.hobbys = 10;
// proxy.inherit.money = 10;
