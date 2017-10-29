import Vue from 'vue';

import TreeNode from '@/components/TreeNode';
import {
    loop,
    traverseTreeNodes,
    isInclude,
    getOffset,
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
    data() {
        return {
            dragNodesKeys: '',
        };
    },
    methods: {
        /**
         * 渲染单个节点，更确切的说法应该是处理节点，视情况添加 children
         * @param {VNode} child
         * @param {*} index
         * @param {*} level
         */
        renderTreeNode(child, index) {
            // 这里的值都是在 loop 时挂载的
            const {
                vChildren,
                rckey,
                level,
            } = child.data;

            const pos = `${level}-${index}`;
            const key = rckey || pos;

            return (<TreeNode
                rckey={key}
                title={key}
                pos={pos}
                props={child.data}
                vChildren={vChildren}
                root={this}
                eventKey={key}
            />);
        },
        /**
         * 获得
         * @param {*} treeNode
         */
        getDragNodesKeys(treeNode) {
            console.log('getDragNodesKeys', treeNode);
            const dragNodesKeys = [];
            // 拿到位置信息
            const treeNodePosArr = treeNode.pos.split('-');
            traverseTreeNodes(treeNode.vChildren, (item, index, pos, key) => {
                const childPosArr = pos.split('-');
                if (
                    (treeNode.pos === pos ||
                    treeNodePosArr.length < childPosArr.length) &&
                    isInclude(treeNodePosArr, childPosArr)
                ) {
                    dragNodesKeys.push(key);
                }
            });
            dragNodesKeys.push(treeNode.eventKey || treeNode.pos);
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
            console.log(this.dropNodeKey);
            // 再暴露出开始拖动的参数
            this.props.onDragStart({
                event: e,
                node: treeNode,
            });
        },
        onDragEnter(e, treeNode) {
            if (e.target.className === 'c-title') {
                e.target.style.background = 'purple';
            }
            // 获取到要放置的节点位置
            const dropPosition = this.calcDropPosition(e, treeNode);
            if (
                this.dragNode.eventKey === treeNode.eventKey &&
                dropPosition === 0
            ) {
                this.dragOverNodeKey = '';
                this.dropPosition = null;
            }
            this.dragOverNodeKey = treeNode.eventKey;
            this.dropPosition = dropPosition;

            if (!this.delayedDragEnterLogic) {
                this.delayedDragEnterLogic = {};
            }
            Object.keys(this.delayedDragEnterLogic).forEach((key) => {
                clearTimeout(this.delayedDragEnterLogic[key]);
            });
            this.delayedDragEnterLogic[treeNode.pos] = setTimeout(() => {
                // const expandedKeys = this.getExpandedKeys(treeNode, true);
                // if (expandedKeys) {
                //     this.setState({ expandedKeys });
                // }
                this.props.onDragEnter({
                    event: e,
                    node: treeNode,
                    // expandedKeys: (expandedKeys && [...expandedKeys])
                        // || [...this.state.expandedKeys],
                });
            }, 400);
        },
        onDragOver(e, treeNode) {
            this.props.onDragOver({ event: e, node: treeNode });
        },
        onDragLeave(e, treeNode) {
            this.props.onDragLeave({ event: e, node: treeNode });
        },
        /**
         * 拖动后放下
         * @param {*} e
         * @param {*} treeNode
         */
        onDrop(e, treeNode) {
            console.log('on drop in tree', treeNode);
            if (!treeNode) {
                return;
            }
            const eventKey = treeNode.eventKey;

            this.dragOverNodeKey = '';
            this.dropNodeKey = eventKey;

            if (this.dragNodesKeys.indexOf(eventKey) > -1) {
                // warning(false, 'Can not drop to dragNode(include it\'s children node)');
                return;
            }

            const posArr = treeNode.pos.split('-');
            const res = {
                event: e,
                node: treeNode,
                dragNode: this.dragNode,
                dragNodesKeys: [...this.dragNodesKeys],
                dropPosition: this.dropPosition + Number(posArr[posArr.length - 1]),
            };
            if (this.dropPosition !== 0) {
                res.dropToGap = true;
            }
            this.props.onDrop(res);
        },
        onDragEnd(e, treeNode) {
            this.dragOverNodeKey = '';
            this.props.onDragEnd({ event: e, node: treeNode });
        },
        calcDropPosition(e, treeNode) {
            console.log(treeNode);
            const selectHandle = treeNode.$refs.selectHandle;
            const offsetTop = getOffset(selectHandle).top;
            const offsetHeight = selectHandle.offsetHeight;
            const pageY = e.pageY;
            const gapHeight = 2; // TODO: remove hard code
            if (pageY > (offsetTop + offsetHeight) - gapHeight) {
                return 1;
            }
            if (pageY < offsetTop + gapHeight) {
                return -1;
            }
            return 0;
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
