import Vue from 'vue';
import TreeNode from './TreeNode';
import {
    loop,
    traverseTreeNodes,
    isInclude,
    getOffset,
} from '../utils';

import './style.css';

export default Vue.component('Tree', {
    props: {
        // 要渲染的树
        data: {
            type: Array,
        },
        // 暴露的所有事件
        props: {
            type: Object,
        },
        template: {},
    },
    data() {
        return {
            dragNodesKeys: '',
            dragOverNodeKey: '',
            dropNodeKey: '',
            dropPosition: '',
        };
    },
    methods: {
        /**
         * 渲染单个节点
         * @param {VNode} child
         * @param {*} index
         * @param {*} level
         */
        renderTreeNode(child, index) {
            // 这里的值都是在 loop 时挂载到 VNode 上的
            const {
                vChildren,
                rckey,
                level,
                title,
                source,
            } = child.data;
            //
            const pos = `${level}-${index}`;
            const key = rckey;

            // hover 时的 border
            const dragOverGapTop = this.dragOverNodeKey === key && this.dropPosition === -1;
            const dragOverGapBottom = this.dragOverNodeKey === key && this.dropPosition === 1;
            const dragOver = this.dragOverNodeKey === key && this.dropPosition === 0;

            return (<TreeNode
                root={this}
                title={title}
                rckey={key}
                pos={pos}
                props={child.data}
                vChildren={vChildren}
                eventKey={key}
                dragOver={dragOver}
                dragOverGapTop={dragOverGapTop}
                dragOverGapBottom={dragOverGapBottom}
                source={source}
                template={this.template}
            />);
        },
        /**
         * 获得当前正在拖拽的节点 key 集合（节点与其子节点
         * @param {VueComponent} treeNode
         */
        getDragNodesKeys(treeNode) {
            const dragNodesKeys = [];
            // 拿到位置信息
            const treeNodePosArr = treeNode.pos.split('-');
            /**
             * item: child
             */
            traverseTreeNodes(treeNode.$children, (item, index, pos, key) => {
                const childPosArr = pos.split('-');
                // 如果
                if (
                    (treeNode.pos === pos ||
                    treeNodePosArr.length < childPosArr.length) &&
                    isInclude(treeNodePosArr, childPosArr)
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
         * 开始拖动
         * @param {*} e
         * @param {*} treeNode
         */
        onDragStart(e, treeNode) {
            this.dragNode = treeNode;
            // 保存当前正在拖动的节点 key || pos
            this.dragNodesKeys = this.getDragNodesKeys(treeNode);
            // 再暴露出开始拖动的参数
            this.props.onDragStart({
                event: e,
                node: treeNode,
            });
        },
        /**
         * 拖动的元素“进入”某个节点时触发
         * @param {Event} e
         * @param {VueComponent} treeNode 实际进入的节点，所以是一直在变化的
         */
        onDragEnter(e, treeNode) {
            // 获取到要放置的节点位置
            const dropPosition = this.calcDropPosition(e, treeNode);
            console.log(dropPosition);
            // 如果正在拖动的节点和鼠标所在的是同一个节点，就直接退出
            if (
                this.dragNode.eventKey === treeNode.eventKey &&
                dropPosition === 0
            ) {
                this.dragOverNodeKey = '';
                this.dropPosition = null;
                return;
            }

            this.dragOverNodeKey = treeNode.eventKey;
            this.dropPosition = dropPosition;
        },
        onDragOver(e, treeNode) {
            this.props.onDragOver({ event: e, node: treeNode });
        },
        onDragLeave(e, treeNode) {
            this.props.onDragLeave({ event: e, node: treeNode });
        },
        /**
         * 拖动后放下
         * @param {Event} e
         * @param {VueComponent} treeNode 放下时鼠标所在的节点
         */
        onDrop(e, treeNode) {
            const eventKey = treeNode.eventKey;

            this.dragOverNodeKey = '';
            this.dropNodeKey = eventKey;
            // 如果是将一个节点放到它的子节点中
            if (this.dragNodesKeys.indexOf(eventKey) > -1) {
                console.error('Can not drop to dragNode(include it\'s children node)');
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
        /**
         * onDragEnter 时调用，计算
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
    },
    render(h) {
        // 得到的 children 是 VNode
        const vChildren = loop(this.data, h, TreeNode);
        /**
         * 1、一定是先渲染最顶层的节点
         * 2、如果节点还有子节点，交给子节点自己处理
         */
        return (<ul
            class="tree"
            role="tree-node"
            unselectable="on"
        >
            {vChildren.map((child, i) => this.renderTreeNode(child, i))}
        </ul>);
    },
});
