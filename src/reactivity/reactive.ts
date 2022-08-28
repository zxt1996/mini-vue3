import { createReactiveObject, mutableHandlers, readonlyHandlers } from './baseHandlers';

export function reactive<T extends object>(target: T) {
    return createReactiveObject<T>(target, mutableHandlers);
}

// 一个没有 set 操作的 reactive
export function readonly<T extends object>(target: T) {
    return createReactiveObject<T>(target, readonlyHandlers);
}