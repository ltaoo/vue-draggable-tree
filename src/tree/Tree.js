import Vue from 'vue';

import TreeNode from './TreeNode';
import iViewTemplate from './iviewTemplate';

import { TARGET_POSITION_TYPE } from './constants';
import {
    noop,
    formatSourceNodes,
    getDraggingNodesKey,
    calcDropPosition,
    computeMoveNeededParams,
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
        this.draggingNodesKeys = [];

        return {
            dragOverNodeKey: '',
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
            this.draggingNodesKeys = getDraggingNodesKey(treeNode);
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
            const { rckey } = treeNode;
            const targetPosition = this.dropPosition;

            this.dragOverNodeKey = '';
            this.dropNodeKey = rckey;
            // if drop node to its children node
            if (this.draggingNodesKeys.includes(rckey)) {
                console.error('Can not drop to dragNode(include it\'s children node)');
                return;
            }

            const res = {
                event: e,
                node: treeNode,
                draggingNode: this.draggingNode,
            };
            const isDropToGap = targetPosition !== TARGET_POSITION_TYPE.CONTENT;
            if (isDropToGap) {
                res.dropToGap = true;
            }
            if (this.onDrop) {
                this.onDrop(res);
                return;
            }

            const targetNodeKey = rckey;
            const draggingNodeKey = this.draggingNode.rckey;
            const sourceNodes = [...this.data];

            const {
                targetSourceNode,
                targetSourceNodeIndex,
                targetSourceNodes,
                originSourceNode,
                originSourceNodeIndex,
                originSourceNodes,
            } = computeMoveNeededParams(
                sourceNodes,
                draggingNodeKey,
                targetNodeKey,
                targetPosition,
            );
            // insert to content
            if (targetPosition === TARGET_POSITION_TYPE.CONTENT) {
                if (this.beforeInner) {
                    this.beforeInner(
                        'inner',
                        targetSourceNode.children,
                        originSourceNode,
                    );
                    return;
                }
                targetSourceNode.children = targetSourceNode.children || [];
                targetSourceNode.children.push(originSourceNode);
                originSourceNodes.splice(
                    originSourceNodeIndex,
                    1,
                );
            }
            // move to top
            if (targetPosition === TARGET_POSITION_TYPE.TOP) {
                if (this.beforeInsert) {
                    this.beforeInsert(
                        'insert',
                        targetSourceNodes,
                        targetSourceNodeIndex,
                        originSourceNode,
                    );
                    return;
                }
                originSourceNodes.splice(originSourceNodeIndex, 1);
                targetSourceNodes.splice(
                    targetSourceNodeIndex + 1,
                    0,
                    originSourceNode,
                );
            }
            // move to bottom
            if (targetPosition === TARGET_POSITION_TYPE.BOTTOM) {
                originSourceNodes.splice(originSourceNodeIndex, 1);
                // place to target node top
                targetSourceNodes.splice(
                    targetSourceNodeIndex,
                    0,
                    originSourceNode,
                );
            }
            this.$emit('input', sourceNodes);
            if (this.afterInsert) {
                this.afterInsert();
            }
        },
        dragEnd(e, targetNode) {
            this.dragOverNodeKey = '';
            this.$emit('dragEnd', this.data, targetNode, e);
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
