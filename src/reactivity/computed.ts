import { isFunction } from '../shared';
import { ReactiveEffect } from './effect';

type ComputedGetter<T> = (...args: any[]) => T
type ComputedSetter<T> = (v: T) => void
interface WritableComputedOptions<T> {
    get: ComputedGetter<T>;
    set: ComputedSetter<T>;
}

export class ComputedRefImpl<T> {
    private _value!: T;
    public _dirty = true; // 避免已经不是第一次执行 get 操作时再次调用 compute
    private _effect: ReactiveEffect; // 依赖收集

    constructor (
        getter: ComputedGetter<T>,
        private setter: ComputedSetter<T>
    ) {
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
            }
        })
    }

    get value() {
        if (this._dirty) {
            this._dirty = false;
            this._value = this._effect.run();
        }

        return this._value;
    }

    set value(newValue: T) {
        this.setter(newValue);
    }
}

export function computed<T>(option: WritableComputedOptions<T>): any
export function computed<T>(getter: ComputedGetter<T>): ComputedRefImpl<T>
export function computed<T>(getterOrOption: ComputedGetter<T> | WritableComputedOptions<T>) {
    let getter: ComputedGetter<T>
    let setter: ComputedSetter<T>

    if (isFunction(getterOrOption)) {
        getter = getterOrOption;
        setter = () => console.error('错误, 因为是getter只读, 不能赋值')
    } else {
        getter = getterOrOption.get;
        setter = getterOrOption.set;
    }

    return new ComputedRefImpl(getter, setter);
}