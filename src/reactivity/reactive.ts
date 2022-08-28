import { createReactiveObject, mutableHandlers, readonlyHandlers } from './baseHandlers';

export enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export interface Target {
    [ReactiveFlags.IS_REACTIVE]?: boolean,
    [ReactiveFlags.IS_READONLY]?: boolean
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

// 一个没有 set 操作的 reactive
export function readonly<T extends object>(target: T) {
    return createReactiveObject<T>(target, readonlyHandlers);
}