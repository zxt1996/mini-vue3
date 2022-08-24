import { effect, reactive} from '../reactivity/index';

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
})