// 为什么要有ref呢，reactive不行吗？
// 因为reactive用的是proxy，而proxy只能针对对象去监听数据变化，基本数据类型并不能用proxy
// 所以我们想到了class里面的取值函数getter和存值函数getter，他们都能在数据变化的时候对数据加以操作。
// 1. 接受一个内部值并返回一个响应式且可变的 ref 对象。ref 对象仅有一个 .value property，指向该内部值。
// 2. 如果将对象分配为 ref 值，则它将被 reactive 函数处理为深层的响应式对象。

import { hasChanged, isObject } from '../shared';
import { Dep, triggerEffect, trackEffect, isTracking } from './effect';
import { reactive } from './reactive';

class RefImpl<T> {
    private _value: T;
    public dep?: Dep = undefined;
    private rawValue: T;

    constructor(value: any) {
        this._value = convert(value);
        this.rawValue = value;
        this.dep = new Set();
    }

    get value() {
        trackRefValue(this);
        return this._value;
    }

    set value(newValue: any) {

        // 对比旧的值和新的值，如果相等就没必要触发依赖和赋值了
        if (hasChanged(newValue, this.rawValue)) {
            // 先赋值再触发依赖
            this._value = convert(newValue);
            this.rawValue = newValue;
            triggerEffect(this.dep as Dep);
        }
    }
}

function trackRefValue(ref: RefImpl<any>) {
    isTracking() && trackEffect(ref.dep as Dep);
}

// 判断 value 是否对象，是： reactive，否：基本数据类型，直接返回
function convert(value: any) {
    return isObject(value) ? reactive(value) : value;
}

export function ref<T>(value: T) {
    return new RefImpl(value);
}