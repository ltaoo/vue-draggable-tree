/* eslint disable */
export function generateData(x = 3, y = 2, z = 1, gData = []) {
    // x：每一级下的节点总数。y：每级节点里有y个节点、存在子节点。z：树的level层级数（0表示一级）
    function loop(_level, _preKey, _tns) {
        const preKey = _preKey || '0';
        const tns = _tns || gData;

        const children = [];
        for (let i = 0; i < x; i++) {
            const key = `${preKey}-${i}`;
            tns.push({ title: `${key}-label`, key: `${key}-key` });
            if (i < y) {
                children.push(key);
            }
        }
        if (_level < 0) {
            return tns;
        }
        const __level = _level - 1;
        children.forEach((key, index) => {
            tns[index].children = [];
            return loop(__level, key, tns[index].children);
        });
    }
    loop(z);
    return gData;
}
export function calcTotal(x = 3, y = 2, z = 1) {
    /* eslint no-param-reassign:0 */
    const rec = n => n >= 0 ? x * Math.pow(y, n--) + rec(n) : 0;
    return rec(z + 1);
}
console.log('总节点数（单个tree）：', calcTotal());
// 性能测试：总节点数超过 2000（z要小）明显感觉慢。z 变大时，递归多，会卡死。

export const gData = generateData();
