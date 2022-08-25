export function setDataWithoutRepeat(context: any, data: Record<string, any>) {
  let parentNode = context?.data;
  let changed = false;

  let internalSetData = (parent: any, data: Record<string, any>) => {
    let o = {} as typeof data;
    for (let key in data) {
      // 新增的属性
      if (!parent.hasOwnProperty(key)) {
        let dataKeyValueType = Object.prototype.toString.call(data[key]);
        if (dataKeyValueType === '[object Object]') {
          parent[key] = {};
        } else if (dataKeyValueType === '[object Array]') {
          parent[key] = [];
        }
      }

      if (typeof data[key] === 'object') {
        o[key] = internalSetData(parent[key], data[key]);
      } else {
        if (parent[key] != data[key]) {
          o[key] = data[key];
          changed = true;
        }
      }
    }

    return o;
  }

  let diff = internalSetData(parentNode, data);
  if (!changed) {
    return null;
  }

  return diff;
}