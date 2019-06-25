export function noop() {}
/**
 * type NodeLevel = string; // like 0、0-0、0-1、0-0-0
 * interface SourceNode {
 *  key: string;
 *  title: string;
 *  children: Array<SourceNode>;
 * }
 * interface FormattedSourceNode {
 *  id: number;
 *  key: string;
 *  level: NodeLevel;
 *  children?: Array<FormattedSourceNode>;
 * }
 */
/**
 * add some key to sourceNode
 * @param {Array<SourceNode>} data
 * @param {string} [level='0'] - level at tree
 * @return {Array<FormattedSourceNode>}
 */
export const formatSourceNodes = (
    sourceNodes,
    level = '0',
) => sourceNodes.map((sourceNode, i) => {
    const formattedSourceNode = {
        index: i,
        key: sourceNode.key,
        title: sourceNode.title,
        level,
        source: sourceNode,
    };
    if (sourceNode.children && sourceNode.children.length) {
        const newLevel = `${level}-0`;
        formattedSourceNode.children = formatSourceNodes(sourceNode.children, newLevel);
    }
    return formattedSourceNode;
});

/**
 * @param {Array<VueComponent>} treeNodes
 * @param {function} callback
 */
export function traverseTreeNodes(treeNodes = [], callback) {
    /**
     * @param {Array<VueComponent>} subTreeNodes
     * @param {number} level
     * @param {Array<>} parentsChildrenPos
     * @param {number} parentPos
     */
    function traverse(subTreeNodes, level, parentsChildrenPos, parentPos) {
        let newSubTreeNodes = subTreeNodes;
        if (subTreeNodes && subTreeNodes.length) {
            newSubTreeNodes = subTreeNodes.filter(Boolean);
        }

        newSubTreeNodes.forEach((treeNode, index) => {
            if (!treeNode.isTreeNode) {
                return;
            }
            const { pos } = treeNode;
            // Note: side effect
            parentsChildrenPos.push(pos);

            const childrenPos = [];
            if (treeNode.$children) {
                traverse(treeNode.$children, pos, childrenPos, pos);
            }
            callback(
                treeNode,
                index,
                pos,
                treeNode.rckey || pos,
                childrenPos,
                parentPos,
            );
        });
    }
    traverse(treeNodes, 0, []);
}

/**
 *
 * @param {*} smallArray
 * @param {*} bigArray
 */
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

/**
 * 遍历 data，节点对应的对象
 * @param {} data
 * @param {} key
 * @param {Function} callback
 */
export const sourceLoop = (data, key, callback) => {
    data.forEach((item, index, arr) => {
        if (item.key === key) {
            return callback(item, index, arr);
        }
        if (item.children) {
            return sourceLoop(item.children, key, callback);
        }
        return false;
    });
};
