/**
 * effect 函数用于注册副作用函数
 */

// 当前正在执行的 effect，即被注册的副作用函数
let activeEffect: ReactiveEffect;

class ReactiveEffect {
    private _fn: Function

    constructor (fn: Function) {
        this._fn = fn;
    }

    run () {
        // 为什么要在这里把 this 赋值给 activeEffect 呢？因为这里是 fn 执行之前，就是 track 依赖收集执行之前，又是 effect 开始执行之后，
        // this 能捕捉到这个依赖，将这个依赖赋值给 activeEffect 是刚刚好的时机
        activeEffect = this;
        this._fn();
    }
}


type EffectKey = string;
type IDep = ReactiveEffect;
// 存储副作用函数的桶
const targetMap = new Map<Record<EffectKey, any>, Map<EffectKey, Set<IDep>>>();

// 添加依赖
export function track (target: Record<EffectKey, any>, key: EffectKey) {
    // 寻找 dep 依赖的执行顺序
    // target -> key -> dep
    let depsMap = targetMap.get(target);

    // 初始化没有 depsMap 时
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, (depsMap = new Map()));
    }

    // deps 是一个 set 对象，存放着这个 key 相应的所有依赖
    let deps = depsMap.get(key);

    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }

    // 将 activeEffect 实例对象 add 给 deps
    deps.add(activeEffect);
}

// 找出 target 的 key 对应的所有依赖，并依次执行
export function trigger (target: Record<EffectKey, any>, key: EffectKey) {
    const depsMap = targetMap.get(target);
    const deps = depsMap?.get(key);
    if (deps) {
        for (let dep of deps) {
            dep.run();
        }
    }
}

// effect 会立即触发这个函数，同时响应式追踪其依赖
export function effect (fn: Function, option = {}) {
    let _reactiveFunc = new ReactiveEffect(fn);
    _reactiveFunc.run();
}