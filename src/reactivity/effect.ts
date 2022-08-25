import { extend } from '../shared/index';

export type EffectScheduler = (...args: any[]) => any

// 当前正在执行的 effect，即被注册的副作用函数
let activeEffect: ReactiveEffect;

let shouldTrack = false;

class ReactiveEffect {
    public deps: Set<ReactiveEffect>[] = [];
    public active = true; // 该 effect 是否激活
    public onStop?: () => void;

    constructor (public fn: Function, public scheduler?: EffectScheduler) {}

    run () {
        if (!this.active) {
            return this.fn();
        }

        // 为什么要在这里把 this 赋值给 activeEffect 呢？因为这里是 fn 执行之前，就是 track 依赖收集执行之前，又是 effect 开始执行之后，
        // this 能捕捉到这个依赖，将这个依赖赋值给 activeEffect 是刚刚好的时机
        activeEffect = this;
        shouldTrack = true;  // 把开关打开可以收集依赖

        // 执行fn的时候，fn里面会执行get操作，之后就会执行track收集依赖，因为shouldTrack是true，所以依赖收集完成
        let returnValue = this.fn();

        // 之后把shouldTrack关闭，这样就没办法在track函数里面收集依赖了
        shouldTrack = false;

        return returnValue;
    }

    stop () {
        // 追加active 标识是为了性能优化，避免每次循环重复调用stop同一个依赖的时候
        if (this.active) {
            cleanupEffect(this);
            this.onStop?.();
            this.active = false;
        }
    }
}

// 清除特定依赖
function cleanupEffect(effect: ReactiveEffect) {
    // 对 effect 解构，解出 deps, 减少对象在词法环境寻找属性的次数
    const { deps } = effect;
    if (deps.length !== 0) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}


type EffectKey = string;
type IDep = ReactiveEffect;
// 存储副作用函数的桶
const targetMap = new Map<Record<EffectKey, any>, Map<EffectKey, Set<IDep>>>();


export function isTracking () {
    return activeEffect !== undefined && shouldTrack;
}

// 添加依赖
export function track (target: Record<EffectKey, any>, key: EffectKey) {
    // 应不应该收集依赖，从而避免删了依赖又重新添加新的依赖
    if (!isTracking()) return;

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

    // 避免不必要的 add 操作
    if (deps?.has(activeEffect)) return;

    if (!deps) {
        deps = new Set();
        depsMap.set(key, deps);
    }

    // 将 activeEffect 实例对象 add 给 deps
    deps.add(activeEffect);

    // activeEffect的deps 接收 Set<ReactiveEffect>类型的deps
    // 供删除依赖的时候使用(停止监听依赖)
    activeEffect.deps.push(deps);
}

// 找出 target 的 key 对应的所有依赖，并依次执行
export function trigger (target: Record<EffectKey, any>, key: EffectKey) {
    const depsMap = targetMap.get(target);
    const deps = depsMap?.get(key);
    if (deps) {
        for (let dep of deps) {
            dep.scheduler ? dep.scheduler() : dep.run();
        }
    }
}

export interface EffectOption {
    scheduler?: EffectScheduler
    onStop?: () => void
}

// 里面存有一个匿名函数
export interface EffectRunner<T = any> {
    (): T
    effect: ReactiveEffect
}

// effect 会立即触发这个函数，同时响应式追踪其依赖
export function effect<T = any> (
    fn: () => T, 
    option?: EffectOption
): EffectRunner {
    let _effect = new ReactiveEffect(fn);
    
    if (option) {
        extend(_effect, option);
    }

    _effect.run();
    // 注意这里的this指向，return 出去的run方法，方法体里需要用到this，且this必须指向ReactiveEffect的实例对象
    // 不用bind重新绑定this，this会指向undefined
    let runner = _effect.run.bind(_effect) as EffectRunner;
    // 这里的effect挂载在了函数runner上，作为属性，这是利用了js中函数可以挂在属性的特性
    // 之后呢，实现stop的时候runner就能拿到ReactiveEffect实例对象了
    runner.effect = _effect;
    return runner;
}

// 删除依赖
export function stop(runner: EffectRunner) {
    runner.effect.stop()
}