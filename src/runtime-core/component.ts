import { isFunction, isObject } from '../shared';

export function createComponentInstance (vnode: any) {
    const type = vnode.type;
    const instance = {
        vnode,
        type
    };

    return instance;
}

// 初始化组件的状态
function setupStatefulComponent (instance: any) {
    const Component = instance.type;
    const { setup } = Component;

    if (setup) {
        // 处理 setup 的返回值，如果返回的是对象，那么把对象里面的值注入到 template 上下文中
        // 如果是一个函数，直接 render

        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }

    finishComponentSetup(instance);
}

// 处理组件的 setup 的返回值
function handleSetupResult (instance: any, setupResult: any) {

    if (isFunction(setupResult)) {
        // TODO
    } else if (isObject(setupResult)) {
        // 把 setup 返回的对象挂载到 setupState 上
        instance.setupState = setupResult;
    }
}

// 结束组件的安装
function finishComponentSetup (instance: any) {
    const Component = instance.type;
    if (instance) {
        instance.render = Component.render;
    }
}

export function setupComponent (instance: any) {
    setupStatefulComponent(instance);
}