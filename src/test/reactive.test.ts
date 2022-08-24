import { reactive} from '../reactivity/index';

describe('reactive', () => {
    // 跳过运行这个测试
    it.skip('reactive test', () => {
        let original = {num: 1};
        let count = reactive(original);
        expect(original).not.toBe(count);
        expect(count.num).toEqual(1);
    })
})