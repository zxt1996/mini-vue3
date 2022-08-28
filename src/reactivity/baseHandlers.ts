import { track, trigger } from './effect';
import { reactive, ReactiveFlags, readonly } from './reactive';
import { isObject, extend } from '../shared';

export function createGetter<T extends object>(isReadonly = false, isShallow = false) {
    return function get(target: T, key: string | symbol) {
        // isReactive 和 isReadonly 都是根据传入的参数 `isReadonly` 来决定是否返回 true | false
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }

        let res = Reflect.get(target, key);

        if (isShallow) {
            return res;
        }

        // 当触发get操作的得到的res，我们追加一个判断，如果发现 res 不是reactive或者readonly，并且res是对象，那么递归调用reactive()或者readonly()
        // 实现嵌套对象的 reactive
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }

        // 判断是否 readonly
        if (!isReadonly) {
            // 依赖收集
            track(target, key as string);
        }

        return res;
    }
}

export function createSetter<T extends object>() {
    return function set(target: T, key: string | symbol, value: any) {
        let success: boolean;
        success = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key as string);
        return success;
    }
}

// 此处调用一次createSetter和getter，为了不在每次使用mutableHandlers的时候重复调用
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

export const mutableHandlers: ProxyHandler<object> = {
    get,
    set
}

export const readonlyHandlers: ProxyHandler<object> = {
    get: readonlyGet,
    set (target, key, value) {
        console.warn(`${target} do not set ${String(key)} value ${value}, because it is readonly`);
        return true;
    }
}

export function createReactiveObject<T extends object>(target: T, handlers: ProxyHandler<T>) {
    return new Proxy(target, handlers);
}

export const shallowReadonlyHandlers: ProxyHandler<object> = extend({}, {
    get: shallowReadonlyGet
});