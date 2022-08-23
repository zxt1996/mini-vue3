import { sum } from './add';

it('jest case', () => {
    expect(sum(0.2, 0.1)).toBeCloseTo(0.3)
})