export const extend = Object.assign;

// 判断是否 object 或 array
export const isObject = (value: unknown) => {
    return value !== null && typeof value === 'object';
}

export const hasChanged = (newValue: any, value: any) => {
    return !Object.is(newValue, value);
}

export const isFunction = (value: unknown): value is Function => {
    return typeof value === 'function';
}