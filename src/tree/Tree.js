import Vue from 'vue';
import TreeNode from './TreeNode';
// import DefaultTemplate from './defaultTemplate';
import iViewTemplate from './iviewTemplate';

import {
    loop,
    traverseTreeNodes,
    isInclude,
    getOffset,
} from './utils';

import './style.css';

function foo() {}

export default Vue.component('Tree', {
    props: {
        // 要渲染的数据
        data: {
            type: Array,
        },
        // 是否自动展开节点
        autoExpandParent: {
            type: Boolean,
            default: true,
        },
        // 是否可拖拽(IE > 8)
        draggable: {
            type: Boolean,
            default: false,
        },
        // 拖动结束事件
        onDragEnd: {
            type: Function,
            default: foo,
        },
        onDragEnter: {
            type: Function,
            default: foo,
        },
        onDragLeave: {
            type: Function,
            default: foo,
        },
        onDragOver: {
            type: Function,
            default: foo,
        },
        onDragStart: {
            type: Function,
            default: foo,
        },
        onDrop: {
            type: Function,
            default: foo,
        },
        onExpand: {
            type: Function,
            default: foo,
        },
        // 自定义子组件
        template: {
            type: Function,
            default: iViewTemplate,
        },
    },
    data() {
        this.dropNodeKey = '';
        this.dragNodesKeys = '';

        return {
            dragOverNodeKey: '',
            // 拖动时的位置
            dropPosition: '',
            // 展开的节点
            expandedKeys: [],
        };
    },
    methods: {
        /**
         * 渲染单个子节点
         * @param {VNode} child 要渲染的节点
         * @param {Number} index 遍历时的 index
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
            // 给每个节点一个唯一值，同时也是表示位置
            const pos = `${level}-${index}`;
            const key = rckey;

            // 根据这三个状态，来显示拖动时的交互
            const dragOverGapTop = this.dragOverNodeKey === key && this.dropPosition === -1;
            const dragOverGapBottom = this.dragOverNodeKey === key && this.dropPosition === 1;
            const dragOver = this.dragOverNodeKey === key && this.dropPosition === 0;

            // 展开状态
            const expanded = this.expandedKeys.indexOf(key) !== -1;

            return (<TreeNode
                root={this}
                title={title}
                rckey={key}
                pos={pos}
                vChildren={vChildren}
                eventKey={key}
                dragOver={dragOver}
                dragOverGapTop={dragOverGapTop}
                dragOverGapBottom={dragOverGapBottom}
                source={source}
                template={this.template}
                draggable={this.draggable}
                expanded={expanded}
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
        dragStart(e, treeNode) {
            this.dragNode = treeNode;
            // 保存当前正在拖动的节点 key || pos
            this.dragNodesKeys = this.getDragNodesKeys(treeNode);
            // 再暴露出开始拖动的参数
            this.onDragStart({
                event: e,
                node: treeNode,
            });
        },
        /**
         * 拖动的元素“进入”某个节点时触发
         * @param {Event} e
         * @param {VueComponent} treeNode 实际进入的节点，所以是一直在变化的
         */
        dragEnter(e, treeNode) {
            // 获取到要放置的节点位置
            const dropPosition = this.calcDropPosition(e, treeNode);
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
            console.log(dropPosition);
        },
        dragOver(e, treeNode) {
            this.onDragOver({ event: e, node: treeNode });
        },
        dragLeave(e, treeNode) {
            this.onDragLeave({ event: e, node: treeNode });
        },
        /**
         * 拖动后放下
         * @param {Event} e
         * @param {VueComponent} treeNode 放下时鼠标所在的节点
         */
        drop(e, treeNode) {
            console.log('drop');
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
            console.log(res);
            this.onDrop(res);
        },
        dragEnd(e, treeNode) {
            this.dragOverNodeKey = '';
            this.onDragEnd({ event: e, node: treeNode });
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
    render(h) {
        // 得到的 children 是 VNode
        const vChildren = loop(this.data, h, TreeNode);
        /**
         * 1、一定是先渲染最顶层的节点
         * 2、如果节点还有子节点，交给子节点自己处理
         */

        return (<ul
            class="ant-tree tree"
            role="tree-node"
            unselectable="on"
        >
            {vChildren.map((child, i) => this.renderTreeNode(child, i))}
        </ul>);
    },
});
