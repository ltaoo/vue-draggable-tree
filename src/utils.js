/**
 * 生成 VNode 组成的数组
 * @param {*} data
 */
export const loop = (data, h, component) => {
    console.log(data);
    return data.map((item, i) => {
        if (item.children && item.children.length) {
            return h(component, {
                // 这里的键都挂载在 VNode.data 上
                index: i,
                rckey: item.key,
                title: item.key,
                vChildren: loop(item.children, h, component),
            }, []);
        }
        return h(component, {
            props: {
                index: i,
                rckey: item.key,
                title: item.key,
            },
        }, []);
    });
};

export function traverseTreeNodes(treeNodes = [], callback) {
    const traverse = (subTreeNodes, level, parentsChildrenPos, parentPos) => {
        let newSubTreeNodes = subTreeNodes;
        if (subTreeNodes && subTreeNodes.length) {
            newSubTreeNodes = subTreeNodes.filter(item => !!item);
        }
        newSubTreeNodes.forEach((item, index) => {
            const pos = `${level}-${index}`;
            parentsChildrenPos.push(pos); // Note: side effect

            const childrenPos = [];
            if (item.props.children && item.type && item.type.isTreeNode) {
                traverse(item.props.children, pos, childrenPos, pos);
            }
            callback(
                item,
                index,
                pos,
                item.key || pos,
                childrenPos,
                parentPos,
            );
        });
    };
    // call traverse
    traverse(treeNodes, 0, []);
}
export function isInclude(smallArray, bigArray) {
    return smallArray.every((item, index) => item === bigArray[index]);
}
