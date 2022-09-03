import { effect, stop} from '../effect';
import { reactive } from '../reactive';

// describe(name, fn) 是一个将多个相关的测试组合在一起的块
describe('effect test', () => {
    it('effect', () => {

        // 创建 proxy 代理
        let count = reactive({num: 11});
        let result = 0;

        // 立即执行 effect 并跟踪依赖
        effect(() => {
            // count.num 触发 get 存储依赖
            result = count.num + 1;
        })

        expect(result).toBe(12);

        // 这里会先触发proxy的get操作再触发proxy的set操作，触发依赖trigger 更新result
        count.num++;
        expect(result).toBe(13);
    })

    // 实现 effect 返回 runner 函数，这个 runner 函数就是 effect 的回调函数
    it('should return runner when effect was called', () => {
        let foo = 1;
        let runner = effect(() => {
            foo++;
            return 'foo'; 
        })

        expect(foo).toBe(2);
        let returnValue = runner();
        expect(foo).toBe(3);
        expect(returnValue).toBe('foo');
    })

    // 实现 effect 的 scheduler 功能
    // 1. effect 首次执行的时候不执行 scheduler，直接执行回调函数
    // 2. 之后每次触发 trigger 函数的时候都会执行 scheduler 函数，不执行 effect 回调函数
    // 3. 当调用 run 的时候才会触发 runner，即调用 effect 的回调函数
    it('scheduler', () => {
        let dummy;
        let run: any;

        const scheduler = jest.fn(() => {
            run = runner;
        })

        const obj = reactive({ foo: 1 });
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        );

        expect(scheduler).not.toHaveBeenCalled();
        expect(dummy).toBe(1);
        // should be called on first trigger set 操作的时候，即 trigger 被调用的时候
        obj.foo++;
        expect(scheduler).toHaveBeenCalledTimes(1);
        // should not run yet
        expect(dummy).toBe(1);
        run();
        expect(dummy).toBe(2);
    })

    // 通过 stop 可以停止监听依赖
    // 通过删除 deps 依赖，那么 trigger 被调用的时候就不会被循环调用这个依赖了
    it('stop', () => {
        let dummy;
        const obj = reactive({ prop: 1 });
        const runner = effect(() => {
            dummy = obj.prop;
        })
        obj.prop = 2;
        expect(dummy).toBe(2);
        stop(runner);

        // 单单只是检查set操作是不行的，还必须检查代码通过get操作之后，是否还能执行依赖
        // obj.prop = 3
        // 很明显如果换成obj.prop++，expect(dummy).toBe(2)就飘红了
        // 这是因为obj.prop还有一个get操作，经过get操作之后，经过track函数之后原来被删除的effect又被add到deps上面去了
        // 所以我们这里必须添加shouldtrack变量来表示应不应该被track 详细见effect.ts的track函数，控制shouldTrack开关在ReactiveEffect的run方法
        obj.prop++;
        expect(dummy).toBe(2);

        runner();
        expect(dummy).toBe(3);
    })

    // 1. 当stop对一个runner执行的时候，runner对应的依赖的onStop就会被执行，相当于事件触发
    it('onStop', () => {
        const obj = reactive({ foo: 1 });
        const onStop = jest.fn();
        let dummy;
        const runner = effect(
            () => {
                dummy = obj.foo;
            },
            {
                onStop
            }
        );
        stop(runner);
        expect(onStop).toBeCalledTimes(1);
    })
})