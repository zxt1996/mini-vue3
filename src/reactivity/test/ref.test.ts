import {ref, isRef, unref, proxyRefs} from '../ref'
import {effect} from '../effect'
import { computed } from '../computed'
import { reactive } from  '../reactive';

describe('ref',()=>{
  it('should hold a value', () => {
    const a = ref(1)
    expect(a.value).toBe(1)
    a.value = 2
    expect(a.value).toBe(2)
  })

  it('should be reactive', () => {
    const a = ref(1)
    let dummy
    let calls = 0
    effect(() => {
      calls++
      dummy = a.value
    })
    expect(calls).toBe(1)
    expect(dummy).toBe(1)
    a.value = 2
    expect(calls).toBe(2)
    expect(dummy).toBe(2)
    // same value should not trigger
    a.value = 2
    expect(calls).toBe(2)
  })

  it('should make nested properties reactive', () => {
    const a = ref({
      count: 1,
    })
    let dummy
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1)
    a.value.count = 2
    expect(dummy).toBe(2)
  })

  test('isRef', () => {
    expect(isRef(ref(1))).toBe(true)

    expect(isRef(0)).toBe(false)
    expect(isRef(1)).toBe(false)
    // an object that looks like a ref isn't necessarily a ref
    expect(isRef({ value: 0 })).toBe(false)
  })
  test('unref', () => {
    expect(unref(1)).toBe(1)
    expect(unref(ref(1))).toBe(1)
  })
  test('proxyRefs', ()=>{
    const user = {
      age: ref(10),
      name: 'jojo'
    }
    const original = {
      k: 'v'
    }
    const r1 = reactive(original)
    const p1 = proxyRefs(r1)
    const proxyUser = proxyRefs(user)

    expect(p1).toBe(r1)
    expect(user.age.value).toBe(10)
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('jojo')

    proxyUser.age = 20
    expect(proxyUser.age).toBe(20)
    expect(user.age.value).toBe(20)

    proxyUser.age = ref(10)
    proxyUser.name = 'superman'
    expect(proxyUser.age).toBe(10)
    expect(proxyUser.name).toBe('superman')
    expect(user.age.value).toBe(10)
  })
  test('should support setter', ()=>{
    const count = ref(1)
    const plusOne = computed({
      get: () => count.value + 1,
      set: val => {
        count.value = val - 1
      }
    })
    plusOne.value = 1
    expect(count.value).toBe(0)
  })
})