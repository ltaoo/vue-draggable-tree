import Vue from 'vue';

import TreeNode from '@/components/TreeNode';
import {
    loop,
    traverseTreeNodes,
    isInclude,
} from '@/utils';

Vue.component('Tree', {
    props: {
        data: {
            type: Array,
        },
        props: {
            type: Object,
        },
    },
    methods: {
        /**
         * 渲染单个节点，更确切的说法应该是处理节点，视情况添加 children
         * @param {VNode} child
         * @param {*} index
         * @param {*} level
         */
        renderTreeNode(child, index, level = 0) {
            console.log('at renderTreeNode function', child);
            const pos = `${level}-${index}`;
            const key = child.rckey || pos;
            // 这里的值都是在 loop 时挂载的
            const {
                vChildren,
            } = child.data;

            return (<TreeNode
                rckey={key}
                title={key}
                pos={pos}
                props={child.data}
                vChildren={vChildren}
                root={this}
            />);
        },
        /**
         * 获得
         * @param {*} treeNode
         */
        getDragNodesKeys(treeNode) {
            console.log('getDragNodesKeys', treeNode);
            const dragNodesKeys = [];
            const treeNodePosArr = treeNode.props.pos.split('-');
            traverseTreeNodes(treeNode.props.children, (item, index, pos, key) => {
                const childPosArr = pos.split('-');
                if (
                    (treeNode.props.pos === pos ||
                    treeNodePosArr.length < childPosArr.length) &&
                    isInclude(treeNodePosArr, childPosArr)
                ) {
                    dragNodesKeys.push(key);
                }
            });
            dragNodesKeys.push(treeNode.props.eventKey || treeNode.props.pos);
            return dragNodesKeys;
        },
        /**
         * 开始拖动
         * @param {*} e
         * @param {*} treeNode
         */
        onDragStart(e, treeNode) {
            console.log('tree component drag start');
            this.dragNode = treeNode;
            this.dropNodeKey = this.getDragNodesKeys(treeNode);
            // 再暴露出开始拖动的参数
            this.props.onDragStart({
                event: e,
                node: treeNode,
            });
        },
        onDragEnter(e, treeNode) {
            const dropPosition = this.calcDropPosition(e, treeNode);
            if (
                this.dragNode.props.eventKey === treeNode.props.eventKey &&
                dropPosition === 0
            ) {
                this.setState({
                    dragOverNodeKey: '',
                    dropPosition: null,
                });
                return;
            }
            this.setState({
                dragOverNodeKey: treeNode.props.eventKey,
                dropPosition,
            });

            if (!this.delayedDragEnterLogic) {
                this.delayedDragEnterLogic = {};
            }
            Object.keys(this.delayedDragEnterLogic).forEach((key) => {
                clearTimeout(this.delayedDragEnterLogic[key]);
            });
            this.delayedDragEnterLogic[treeNode.props.pos] = setTimeout(() => {
                const expandedKeys = this.getExpandedKeys(treeNode, true);
                if (expandedKeys) {
                    this.setState({ expandedKeys });
                }
                this.props.onDragEnter({
                    event: e,
                    node: treeNode,
                    expandedKeys: (expandedKeys && [...expandedKeys])
                        || [...this.state.expandedKeys],
                });
            }, 400);
        },
        onDragOver(e, treeNode) {
            this.props.onDragOver({ event: e, node: treeNode });
        },
        onDragLeave(e, treeNode) {
            this.props.onDragLeave({ event: e, node: treeNode });
        },
        onDrop(e, treeNode) {
            const { state } = this;
            const eventKey = treeNode.props.eventKey;
            this.setState({
                dragOverNodeKey: '',
                dropNodeKey: eventKey,
            });
            if (state.dragNodesKeys.indexOf(eventKey) > -1) {
                // warning(false, 'Can not drop to dragNode(include it\'s children node)');
                return;
            }

            const posArr = treeNode.props.pos.split('-');
            const res = {
                event: e,
                node: treeNode,
                dragNode: this.dragNode,
                dragNodesKeys: [...state.dragNodesKeys],
                dropPosition: state.dropPosition + Number(posArr[posArr.length - 1]),
            };
            if (state.dropPosition !== 0) {
                res.dropToGap = true;
            }
            this.props.onDrop(res);
        },
        onDragEnd(e, treeNode) {
            this.setState({
                dragOverNodeKey: '',
            });
            this.props.onDragEnd({ event: e, node: treeNode });
        },
    },
    render(h) {
        // 得到的 children 是 VNode
        const vChildren = loop(this.data, h, TreeNode);
        /**
         * 1、一定是先渲染最顶层的节点
         * 2、如果节点还有子节点，交给子节点自己处理
         */
        return (<ul
            role="tree-node"
            unselectable="on"
        >
            {vChildren.map((child, i) => this.renderTreeNode(child, i))}
        </ul>);
    },
});
