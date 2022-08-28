export const extend = Object.assign;

// 判断是否 object 或 array
export const isObject = (value: unknown) => {
    return value !== null && typeof value === 'object';
}