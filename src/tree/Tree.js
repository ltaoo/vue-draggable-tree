import Vue from 'vue';

import TreeNode from './TreeNode';
import iViewTemplate from './iviewTemplate';

import {
    noop,
    formatSourceNodes,
    traverseTreeNodes,
    isInclude,
    getOffset,
    sourceLoop,
} from './utils';

import './style.css';

export default Vue.component('Tree', {
    props: {
        value: {
            type: Array,
        },
        autoExpandParent: {
            type: Boolean,
            default: true,
        },
        // IE > 8
        draggable: {
            type: Boolean,
            default: false,
        },
        onDragEnd: {
            type: Function,
            default: noop,
        },
        onDragEnter: {
            type: Function,
            default: noop,
        },
        onDragLeave: {
            type: Function,
            default: noop,
        },
        onDragOver: {
            type: Function,
            default: noop,
        },
        onDragStart: {
            type: Function,
            default: noop,
        },
        onDrop: {
            type: Function,
        },
        onExpand: {
            type: Function,
            default: noop,
        },
        // custom children content
        template: {
            type: Function,
            default: iViewTemplate,
        },
        beforeInner: {
            type: Function,
        },
        beforeInsert: {
            type: Function,
        },
        afterInsert: {
            type: Function,
        },
    },
    data() {
        this.dropNodeKey = '';
        this.dragNodesKeys = '';

        return {
            dragOverNodeKey: '',
            // 拖动时的位置
            dropPosition: '',
            expandedKeys: [],
        };
    },
    computed: {
        data() {
            return this.value;
        },
    },
    methods: {
        /**
         * every tree node is rendered by this method
         * @param {FormattedSourceNode} formattedSourceNode
         * @param {number} index - map index
         * @return {VNode}
         */
        renderTreeNode(formattedSourceNode, index) {
            const {
                key,
                title,
                level,
                source,
                children,
            } = formattedSourceNode;
            // the position of node
            const pos = `${level}-${index}`;

            // the flag show node status(at node top or bottom) when drag
            const dragOverGapTop = this.dragOverNodeKey === key && this.dropPosition === -1;
            const dragOverGapBottom = this.dragOverNodeKey === key && this.dropPosition === 1;
            const dragOver = this.dragOverNodeKey === key && this.dropPosition === 0;

            // is expend
            const expanded = this.expandedKeys.indexOf(key) !== -1;

            return this.$createElement(TreeNode, {
                props: {
                    rckey: key,
                    title,
                    // pass tree root instance to child
                    root: this,
                    pos,
                    children,
                    eventKey: key,
                    dragOver,
                    dragOverGapTop,
                    dragOverGapBottom,
                    source,
                    template: this.template,
                    draggable: this.draggable,
                    expanded,
                },
            });
        },
        /**
         * @TODO move to utils
         * get key and children's key of dragging node
         * @param {VueComponent} treeNode - dragging node
         * @return {Array<>}
         */
        getDraggingNodesKey(treeNode) {
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
            dragNodesKeys.push(treeNode.eventKey || treeNode.pos);
            return dragNodesKeys;
        },
        /**
         * @param {Event} e
         * @param {VueComponent} treeNode - dragging node
         */
        handleStartDrag(e, treeNode) {
            this.draggingNode = treeNode;
            this.dragNodesKeys = this.getDraggingNodesKey(treeNode);
            // 再暴露出开始拖动的参数
            this.onDragStart({
                event: e,
                node: treeNode,
            });
        },
        handleNodeEntered(e, treeNode) {
            // get the position to be place
            const dropPosition = this.calcDropPosition(e, treeNode);
            // if dragging node is the entered node
            if (
                this.draggingNode.eventKey === treeNode.eventKey
                && dropPosition === 0
            ) {
                this.dragOverNodeKey = '';
                this.dropPosition = null;
                return;
            }

            this.dragOverNodeKey = treeNode.eventKey;
            this.dropPosition = dropPosition;
        },
        handleNodeCrossed(e, treeNode) {
            this.onDragOver({ event: e, node: treeNode });
        },
        handleNodeLeaved(e, treeNode) {
            this.onDragLeave({ event: e, node: treeNode });
        },
        /**
         * drop tree node
         * @param {Event} e
         * @param {VueComponent} treeNode - dropped node
         */
        handleNodeDropped(e, treeNode) {
            const { eventKey } = treeNode;

            this.dragOverNodeKey = '';
            this.dropNodeKey = eventKey;
            // if drop node to its child
            if (this.dragNodesKeys.includes(eventKey)) {
                console.error('Can not drop to dragNode(include it\'s children node)');
                return;
            }

            const posArr = treeNode.pos.split('-');
            const res = {
                event: e,
                node: treeNode,
                dragNode: this.draggingNode,
                dragNodesKeys: [...this.dragNodesKeys],
                dropPosition: this.dropPosition + Number(posArr[posArr.length - 1]),
            };
            if (this.dropPosition !== 0) {
                res.dropToGap = true;
            }
            if (this.onDrop) {
                this.onDrop(res);
                return;
            }

            // 目标节点
            const dropKey = res.node.eventKey;
            // 正在拖拽的节点
            const dragKey = res.draggingNode.eventKey;
            const dropPos = res.node.pos.split('-');
            const dropPosition =
                res.dropPosition - Number(dropPos[dropPos.length - 1]);
            // 浅拷贝
            const data = [...this.data];
            let dragObj;
            let hasDragObjArr;
            let deleteIndex;
            sourceLoop(data, dragKey, (item, index, arr) => {
                // 保存正在拖拽的节点所在 children
                hasDragObjArr = arr;
                deleteIndex = index;
                // 移除拖动的节点
                // hasDragObjArr.splice(index, 1);
                dragObj = item;
            });
            // 然后处理应该放到哪里
            if (res.dropToGap) {
                // 如果是在两个节点之间
                let ar;
                let i;
                if (this.beforeInsert) {
                    // 寻找放置的那个节点对应的数组，保存为 ar
                    sourceLoop(data, dropKey, (item, index, arr) => {
                        ar = arr;
                        i = index;
                    });
                    this.beforeInsert('insert', ar, i, dragObj);
                    return;
                }
                hasDragObjArr.splice(deleteIndex, 1);
                // 移除后重新计算
                sourceLoop(data, dropKey, (item, index, arr) => {
                    ar = arr;
                    i = index;
                });
                // 如果是放到下边缘
                if (dropPosition === 1) {
                    ar.splice(i + 1, 0, dragObj);
                } else {
                    ar.splice(i, 0, dragObj);
                }
            } else {
                // 成为子节点
                sourceLoop(data, dropKey, (item) => {
                    /* eslint-disable */
                    item.children = item.children || [];
                    if (this.beforeInsert) {
                        this.beforeInner('inner', item.children, dragObj);
                        return;
                    }
                    // where to insert 示例添加到尾部，可以是随意位置
                    item.children.push(dragObj);
                    hasDragObjArr.splice(deleteIndex, 1);
                });
            }
            // this.data = data;
            this.$emit('input', data);
            // 完成插入之后
            if (this.afterInsert) {
                this.afterInsert();
            }
        },
        dragEnd(e, treeNode) {
            this.dragOverNodeKey = '';
            this.$emit('dragEnd', this.data, treeNode, e);
        },
        /**
         * @TODO move to utils
         * @param {Event} e
         * @param {VueComponent} treeNode 鼠标移动过程中进入的节点
         * @return {Number}
         */
        calcDropPosition(e, treeNode) {
            const selectHandle = treeNode.$refs.selectHandle;
            const offsetTop = getOffset(selectHandle).top;
            const offsetHeight = selectHandle.offsetHeight;
            const pageY = e.pageY;
            // 敏感度
            const gapHeight = 2; // TODO: remove hard code
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
        },
        /**
         *
         * @param {VueComponent} treeNode 切换展开状态的节点
         */
        expand(treeNode) {
            const expanded = !treeNode.expanded;
            const expandedKeys = [...this.expandedKeys];
            const eventKey = treeNode.eventKey;
            const index = expandedKeys.indexOf(eventKey);
            // 如果点击的节点要展开，但是不在表示已经展开的 expandKeys 数组中
            if (expanded && index === -1) {
                // 就加入该数组，在重新渲染的时候，就会展开了
                expandedKeys.push(eventKey);
            } else if (!expanded && index > -1) {
                expandedKeys.splice(index, 1);
            }
            this.expandedKeys = expandedKeys;
            this.onExpand(expandedKeys, { node: treeNode, expanded });
        },
    },
    render() {
        const formattedSourceNodes = formatSourceNodes(this.data);
        /**
         * 1、first render root node
         * 2、if node has children, render by itself
         */
        return (
            <ul
                class="ant-tree tree"
                role="tree-node"
                unselectable="on"
            >
                {formattedSourceNodes.map((formattedSourceNode, i) => {
                    return this.renderTreeNode(formattedSourceNode, i);
                })}
            </ul>
        );
    },
});
