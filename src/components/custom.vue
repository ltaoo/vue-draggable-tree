<template>
    <Tree
        draggable
        v-model="data"
        :afterInsert="afterInsert"
        :template="template"
        :onDrop="handleDrop"
    ></Tree>
</template>

<script>
import Vue from 'vue';
import Tree from '../tree';

import {
    sourceLoop,
} from '../tree/utils';

const EXAMPLE_DATA = [
    {
        key: '0',
        title: '女装',
        children: [
            {
                key: '0-1',
                title: '风衣',
                type: 'clother',
            },
            {
                key: '0-2',
                title: '外套',
                type: 'clother',
            },
        ],
    },
    {
        key: '1',
        title: '男装',
        type: 'clother',
    },
    {
        key: '2',
        title: '图书',
        type: 'book',
        children: [
            {
                key: '2-0',
                title: '小说',
                type: 'book',
                children: [
                    {
                        key: '2-0-0',
                        title: '九州牧云录',
                        type: 'book',
                    },
                    {
                        key: '2-0-1',
                        title: '天空的城',
                        type: 'book',
                    },
                    {
                        key: '2-0-2',
                        title: '三体',
                        type: 'book',
                    },
                ],
            },
            {
                key: '2-1',
                title: '经管',
                type: 'book',
                children: [
                    {
                        key: '2-1-0',
                        title: '创京东',
                        type: 'book',
                    },
                ],
            },
            {
                key: '2-2',
                title: '科技',
                type: 'book',
                children: [
                    {
                        key: '2-2-0',
                        title: 'JavaScript权威指南',
                        highlight: true,
                        type: 'book',
                    },
                    {
                        key: '2-2-1',
                        title: 'JavaScript高级程序设计',
                        type: 'book',
                    },
                ],
            },
        ],
    },
];

export default {
    name: 'vue-draggable-tree-demo',
    components: {
        Tree,
    },
    data() {
        // 保存 this
        const rootThis = this;
        this.template = Vue.component('custom-tree-node', {
            props: ['title', 'node'],
            render() {
                // 这个组件接收 title 和 node，node 就是真实渲染节点的那个 obj
                const btnStyle = 'margin-left: 10px; cursor: pointer;';
                const addBtn = <span
                    style={btnStyle}
                    onClick={rootThis.addNode.bind(rootThis, this.node)}>+</span>;
                const editBtn = <span
                    style={btnStyle}
                    onClick={rootThis.editNode.bind(rootThis, this.node)}>#</span>;
                const deleteBtn = <span
                    style={btnStyle}
                    onClick={rootThis.deleteNode.bind(rootThis, this.node)}>-</span>;
                const titleStyle = this.node.highlight ? 'color: red;' : '';
                return (
                    <div>
                        <span style={titleStyle}>{this.title}</span>
                        {addBtn}
                        {editBtn}
                        {deleteBtn}
                    </div>
                );
            },
        });
        return {
            data: EXAMPLE_DATA,
        };
    },
    methods: {
        afterInsert() {
            console.log(this.data);
        },
        /**
         * 增加节点
         */
        addNode(node) {
            if (!node.children) {
                // 由于开始并没有 children 属性，所以直接添加并不会触发重新渲染，必须使用 Vue.set
                Vue.set(node, 'children', []);
            }
            node.children.push({
                key: Math.random(),
                title: 'new node',
                children: [],
            });
        },
        /**
         * 编辑节点
         */
        editNode(node) {
            const newValue = window.prompt('请输入新标题');
            if (newValue) {
                /* eslint-disable */
                node.title = newValue;
                /* eslint-enable */
            }
        },
        /**
         * 删除节点
         */
        deleteNode(node) {
            // 要找到父节点
            sourceLoop(this.data, node.key, (item, index, arr) => {
                arr.splice(index, 1);
            });
        },
        handleDrop(res) {
            const {
                node,
                dragNode,
            } = res;
            // drop target
            const dropKey = node.eventKey;
            // drag node
            const dragKey = dragNode.eventKey;
            const dropPos = node.pos.split('-');
            const dropPosition =
                res.dropPosition - Number(dropPos[dropPos.length - 1]);
            /**
             * We may have some situations to deal with.
             * For example,
             * I will use the book as a child node of clothing.
             * At this time, I should organize the completion of the drag.
             */
            if (node.source.type !== dragNode.source.type) {
                alert(`${dragNode.source.title} can't put in ${node.source.type}`);
                return;
            }
            // 浅拷贝
            const data = [...this.data];
            let dragObj;
            let hasDragObjArr;
            let deleteIndex;
            sourceLoop(data, dragKey, (item, index, arr) => {
                // 保存正在拖拽的节点所在 children
                hasDragObjArr = arr;
                deleteIndex = index;
                hasDragObjArr.splice(index, 1);
                dragObj = item;
            });
            // 然后处理应该放到哪里
            if (res.dropToGap) {
                // 如果是在两个节点之间
                let ar;
                let i;
                // 寻找放置的那个节点对应的数组，保存为 ar
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
        },
    },
};
</script>

<style>

</style>
