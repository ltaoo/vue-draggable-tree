import Vue from 'vue';

import TreeNode from './TreeNode';
import iViewTemplate from './iviewTemplate';

import {
    noop,
    formatSourceNodes,
    findSourceNodeByKey,
    getDraggingNodesKey,
    calcDropPosition,
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
        renderTreeNode(formattedSourceNode) {
            const {
                key,
                title,
                pos,
                children,
            } = formattedSourceNode;
            // the position of node

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
                    template: this.template,
                    draggable: this.draggable,
                    expanded,
                },
            });
        },
        /**
         * @param {Event} e
         * @param {VueComponent} treeNode - dragging node
         */
        handleStartDrag(e, treeNode) {
            this.draggingNode = treeNode;
            this.dragNodesKeys = getDraggingNodesKey(treeNode);
            this.onDragStart({
                event: e,
                node: treeNode,
            });
        },
        handleNodeEntered(e, treeNode) {
            // get the position to be place
            const dropPosition = calcDropPosition(e, treeNode);
            // if dragging node is the entered node
            if (
                this.draggingNode.rckey === treeNode.rckey
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
            const { rckey, pos } = treeNode;

            this.dragOverNodeKey = '';
            this.dropNodeKey = rckey;
            // if drop node to its child
            if (this.dragNodesKeys.includes(rckey)) {
                console.error('Can not drop to dragNode(include it\'s children node)');
                return;
            }

            const posArr = pos.split('-');
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

            // target node key
            const droppedNodeKey = rckey;
            // dragging node key
            const draggingNodeKey = this.draggingNode.rckey;
            const dropPos = pos.split('-');
            const dropPosition =
                res.dropPosition - Number(dropPos[dropPos.length - 1]);
            // start change source node
            const sourceNodes = [...this.data];
            let draggingSourceNode;
            let hasSomeLevelNodesWithDraggingNode;
            let draggingNodeIndexAtSomeLevelNodes;
            // first we find the dragging sourceNode
            findSourceNodeByKey(sourceNodes, draggingNodeKey, (sourceNode, index, arr) => {
                hasSomeLevelNodesWithDraggingNode = arr;
                draggingNodeIndexAtSomeLevelNodes = index;
                draggingSourceNode = sourceNode;
            });
            if (res.dropToGap) {
                // if place to middle of two node
                let hasSomeLevelNodesWithDrappedNode;
                let droppedNodeIndexAtSomeLevelNodes;
                // second we find target sourceNode
                // if (this.beforeInsert) {
                //     findSourceNodeByKey(sourceNodes, droppedNodeKey, (item, index, arr) => {
                //         ar = arr;
                //         i = index;
                //     });
                //     this.beforeInsert('insert', ar, i, dragObj);
                //     return;
                // }
                // remove source node from same level nodes
                hasSomeLevelNodesWithDraggingNode.splice(draggingNodeIndexAtSomeLevelNodes, 1);
                findSourceNodeByKey(sourceNodes, droppedNodeKey, (item, index, arr) => {
                    hasSomeLevelNodesWithDrappedNode = arr;
                    droppedNodeIndexAtSomeLevelNodes = index;
                });
                // if place to target node bottom
                if (dropPosition === 1) {
                    hasSomeLevelNodesWithDrappedNode.splice(
                        droppedNodeIndexAtSomeLevelNodes + 1,
                        0,
                        draggingSourceNode,
                    );
                } else {
                    // place to target node top
                    hasSomeLevelNodesWithDrappedNode.splice(
                        droppedNodeIndexAtSomeLevelNodes,
                        0,
                        draggingSourceNode,
                    );
                }
            } else {
                // place to target content, mean become child of target node
                findSourceNodeByKey(sourceNodes, droppedNodeKey, (droppedSourceNode) => {
                    /* eslint-disable no-param-reassign */
                    droppedSourceNode.children = droppedSourceNode.children || [];
                    if (this.beforeInsert) {
                        this.beforeInner('inner', droppedSourceNode.children, draggingSourceNode);
                        return;
                    }
                    droppedSourceNode.children.push(draggingSourceNode);
                    hasSomeLevelNodesWithDraggingNode.splice(draggingNodeIndexAtSomeLevelNodes, 1);
                });
            }
            this.$emit('input', sourceNodes);
            if (this.afterInsert) {
                this.afterInsert();
            }
        },
        dragEnd(e, treeNode) {
            this.dragOverNodeKey = '';
            this.$emit('dragEnd', this.data, treeNode, e);
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
                {formattedSourceNodes.map(this.renderTreeNode)}
            </ul>
        );
    },
});
