// 为什么要有ref呢，reactive不行吗？
// 因为reactive用的是proxy，而proxy只能针对对象去监听数据变化，基本数据类型并不能用proxy
// 所以我们想到了class里面的取值函数getter和存值函数getter，他们都能在数据变化的时候对数据加以操作。
// 1. 接受一个内部值并返回一个响应式且可变的 ref 对象。ref 对象仅有一个 .value property，指向该内部值。
// 2. 如果将对象分配为 ref 值，则它将被 reactive 函数处理为深层的响应式对象。

import { hasChanged, isObject } from '../shared';
import { Dep, triggerEffect, trackEffect, isTracking } from './effect';
import { isReactive, reactive } from './reactive';

class RefImpl<T> {
    private _value: T;
    public dep?: Dep = undefined;
    private rawValue: T;
    public __v_isRef = true // 标识是ref对象

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

// 检查值是否为一个 ref 对象。
export function isRef(ref: any) {
    // 有可能为undefined，所以加上!!让undefined转为boolean类型
    return !!(ref && ref.__v_isRef)
  }
  // 如果参数是一个 ref，则返回内部值，否则返回参数本身。这是 val = isRef(val) ? val.value : val 的语法糖函数。
  export function unref(ref: any) {
    return isRef(ref) ? ref.value : ref
  }
  // 通常用在vue3 template里面ref取值，在template里面不需要.value就可以拿到ref的值
  export function proxyRefs<T extends object>(obj: T){
    return isReactive(obj) ? obj : new Proxy<any>(obj, {
      get(target, key){
        // unref已经处理了是否ref的情况所以我们不需要自己if处理，如果是，返回.value，如果不是，直接返回值
        return unref(Reflect.get(target, key)) 
      },
      set(target, key, value){
        console.log(target, key)
        // 因为value为普通值类型的情况特殊，要把value赋值给ref的.value
        if (isRef(target[key]) && !isRef(value)) {
          target[key].value = value
          return true
        } else {
          return Reflect.set(target, key, value)
        }
      }
    })
  }