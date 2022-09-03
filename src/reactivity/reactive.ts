import { createReactiveObject, mutableHandlers, readonlyHandlers, shallowReadonlyHandlers, shallowReactiveHandlers } from './baseHandlers';

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
    IS_SHALLOW = '__v_isShallow',
    RAW = '__v_raw'
}

export interface Target {
    [ReactiveFlags.IS_REACTIVE]?: boolean,
    [ReactiveFlags.IS_READONLY]?: boolean,
    [ReactiveFlags.IS_SHALLOW]?: boolean,
    [ReactiveFlags.RAW]?: any
}

export function isReactive (value: unknown) {
    // target没有__v_isReactive这个属性，为什么还要写target['__v_isReactive']呢？因为这样就会触发proxy的get操作，
    // 通过判断createGetter传入的参数isReadonly是否为true，否则isReactive为true
    // 优化点：用enum管理状态，增强代码可读性
    return !!(value as Target)[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly (value: unknown) {
    return !!(value as Target)[ReactiveFlags.IS_READONLY];
}

export function reactive<T extends object>(target: T) {
    return createReactiveObject<T>(target, mutableHandlers);
}

// 一个没有 set 操作的 reactive(会深层 readonly)
export function readonly<T extends object>(target: T) {
    return createReactiveObject<T>(target, readonlyHandlers);
}

// 浅层 readonly，创建一个 proxy，使其自身的 property 只读，但不执行嵌套对象的深度只读转换（暴露原始值）
export function shallowReadonly<T extends object>(target: T) {
    return createReactiveObject<T>(target, shallowReadonlyHandlers);
}

export function shallowReactive<T extends object>(target: T) {
    return createReactiveObject<T>(target, shallowReactiveHandlers);
}

export function isProxy (value: unknown) {
    return isReactive(value) || isReadonly(value);
}

// 检查对象是否开启 shallow mode
export function isShallow (value: unknown) {
    return !!(value as Target)[ReactiveFlags.IS_SHALLOW];
}

// 返回 reactive 或 readonly 代理的原始对象
export function toRaw<T>(observed: T): T {
    // observed 存在，触发 get 操作，在 createGetter 直接 return target
    const raw = observed && (observed as Target)[ReactiveFlags.RAW];
    return raw ? toRaw(raw) : observed;
}