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
    level = 1,
    parentPos,
) => sourceNodes.map((sourceNode, i) => {
    const { key, title, ...restProps } = sourceNode;
    const formattedSourceNode = {
        ...restProps,
        key,
        title,
        pos: parentPos === undefined ? String(i) : `${parentPos}-${i}`,
    };
    if (sourceNode.children && sourceNode.children.length) {
        const nextLevel = level + 1;
        formattedSourceNode.children = formatSourceNodes(
            sourceNode.children,
            nextLevel,
            formattedSourceNode.pos,
        );
    }
    return formattedSourceNode;
});

/**
 * collect node key and its children keys
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
 * get key and children's key of dragging node
 * @param {VueComponent} treeNode - dragging node
 * @return {Array<>}
 */
export function getDraggingNodesKey(treeNode) {
    const dragNodesKeys = [];
    // 拿到位置信息
    const treeNodePosArr = treeNode.pos.split('-');
    traverseTreeNodes(treeNode.$children, (item, index, pos, key) => {
        const childPosArr = pos.split('-');
        if (
            (
                treeNode.pos === pos ||
                treeNodePosArr.length < childPosArr.length
            )
            && isInclude(treeNodePosArr, childPosArr)
        ) {
            // 正在拖拽的节点的“子孙节点”
            dragNodesKeys.push(key);
        }
    });
    // 再将正在拖拽的节点 key 放进来
    dragNodesKeys.push(treeNode.rckey);
    return dragNodesKeys;
}

/**
 * get node position info
 * @param {Element} ele
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
 * @param {Event} e
 * @param {VueComponent} treeNode 鼠标移动过程中进入的节点
 * @return {Number}
 */
export function calcDropPosition(e, treeNode) {
    const { selectHandle } = treeNode.$refs;
    const offsetTop = getOffset(selectHandle).top;
    const offsetHeight = selectHandle.offsetHeight;
    const pageY = e.pageY;
    // TODO: remove hard code
    const gapHeight = 2;
    // 如果是靠近下边缘，就返回 1
    if (pageY > (offsetTop + offsetHeight) - gapHeight) {
        return 1;
    }
    // 如果是靠近上边缘，就返回 -1
    if (pageY < offsetTop + gapHeight) {
        return -1;
    }
    // 否则就返回 0，表示在节点内部
    return 0;
}

/**
 * @param {Array<SourceNode>} data
 * @param {string} key
 * @param {function} callback
 */
export const findSourceNodeByKey = (sourceNodes, key, callback) => {
    sourceNodes.forEach((sourceNode, index, arr) => {
        if (sourceNode.key === key) {
            return callback(sourceNode, index, arr);
        }
        if (sourceNode.children) {
            return findSourceNodeByKey(sourceNode.children, key, callback);
        }
        return false;
    });
};

export function getUpdateInfo() {
    return {
        // insertToTop、insertToBottom、insertToContent
        type: 'insertToTop',
    };
}
