/**
 * 生成 VNode 组成的数组
 * @param {*} data
 */
export const loop = (data, h, component, level = '0') =>
     data.map((item, i) => {
        if (item.children && item.children.length) {
            const newLevel = `${level}-0`;
            return h(component, {
                // 这里的键都挂载在 VNode.data 上
                index: i,
                rckey: item.key,
                title: item.key,
                vChildren: loop(item.children, h, component, newLevel),
                level,
            }, []);
        }
        return h(component, {
            index: i,
            rckey: item.key,
            title: item.key,
            level,
        }, []);
    });

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

/**
 * 获取位置信息
 * @param {*} ele
 */
export function getOffset(ele) {
    if (!ele.getClientRects().length) {
        return { top: 0, left: 0 };
    }

    const rect = ele.getBoundingClientRect();
    if (rect.width || rect.height) {
        const doc = ele.ownerDocument;
        const win = doc.defaultView;
        const docElem = doc.documentElement;

        return {
            top: (rect.top + win.pageYOffset) - docElem.clientTop,
            left: (rect.left + win.pageXOffset) - docElem.clientLeft,
        };
    }

    return rect;
}
