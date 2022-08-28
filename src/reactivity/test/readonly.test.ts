import { readonly } from '../reactive';

describe('readonly', () => {
    it('readonly not set', () => {
        let original = {
            foo: {
                fuck: {
                    name: 'what'
                }
            }
        };

        let warper = readonly(original);
        expect(warper).not.toBe(original);
        expect(warper.foo.fuck.name).toBe('what');
    });

    it('warning when it be call set operation', () => {
        let original = {
            username: 'jojo'
        };

        const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
        
        let readonlyObj = readonly(original);
        readonlyObj.username = 'other name';

        expect(warn).toBeCalledWith(`${readonlyObj} do not set username value ${'other name'}, because it is readonly`);

        warn.mockRestore();
    })
})