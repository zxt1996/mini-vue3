import { effect, reactive} from '../reactivity/index';

// describe(name, fn) 是一个将多个相关的测试组合在一起的块
describe('effect test', () => {
    it('effect', () => {
        let count = reactive({num: 11});
        let result = 0;
        effect(() => {
            result = count.num + 1;
        })

        expect(result).toBe(12);
        count.num++;
        expect(result).toBe(12);
    })
})