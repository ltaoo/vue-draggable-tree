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
    findSourceNodeByKey,
    computeMoveNeededParams,
} from '../tree/utils';
import {
    TARGET_POSITION_TYPE,
} from '../tree/constants';

const EXAMPLE_DATA = [
    {
        key: '0',
        title: '女装',
        type: 'clother',
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
        const self = this;
        // new node template
        this.template = Vue.component('custom-tree-node', {
            props: ['title', 'node'],
            render() {
                // 这个组件接收 title 和 node，node 就是真实渲染节点的那个 obj
                const btnStyle = 'margin-left: 10px; cursor: pointer;';
                const addBtn = (
                    <span
                        style={btnStyle}
                        onClick={self.addNode.bind(self, this.node)}
                    >+</span>
                );
                const editBtn = (
                    <span
                        style={btnStyle}
                        onClick={self.editNode.bind(self, this.node)}
                    >#</span>
                );
                const deleteBtn = (
                    <span
                        style={btnStyle}
                        onClick={self.deleteNode.bind(self, this.node)}
                    >-</span>
                );
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
            findSourceNodeByKey(this.data, node.key, (item, index, arr) => {
                arr.splice(index, 1);
            });
        },
        handleDrop(res) {
            const { node, dragNode, targetPosition } = res;
            console.log(node);
            // drop target
            const dropKey = node.rckey;
            // drag node
            const dragKey = dragNode.rckey;
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

            const targetNodeKey = dropKey;
            const draggingNodeKey = dragKey;
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
            console.log(targetPosition);
            // console.log(originSourceNode.title, targetPosition, targetSourceNode.title);
            // insert to content
            if (targetPosition === TARGET_POSITION_TYPE.CONTENT) {
                targetSourceNode.children = targetSourceNode.children || [];
                targetSourceNode.children.push(originSourceNode);
                originSourceNodes.splice(
                    originSourceNodeIndex,
                    1,
                );
            }
            // move to top
            if (targetPosition === TARGET_POSITION_TYPE.TOP) {
                console.log(
                    originSourceNode.title,
                    targetPosition,
                    targetSourceNodes,
                    targetSourceNodeIndex,
                );
                originSourceNodes.splice(originSourceNodeIndex, 1);
                targetSourceNodes.splice(
                    targetSourceNodeIndex + 1,
                    0,
                    originSourceNode,
                );
            }
            // move to bottom
            if (targetPosition === TARGET_POSITION_TYPE.BOTTOM) {
                console.log(
                    originSourceNode.title,
                    targetPosition,
                    targetSourceNodes,
                    targetSourceNodeIndex,
                );
                originSourceNodes.splice(originSourceNodeIndex, 1);
                // place to target node top
                targetSourceNodes.splice(
                    targetSourceNodeIndex,
                    0,
                    originSourceNode,
                );
            }
        },
    },
};
</script>

<style>

</style>
