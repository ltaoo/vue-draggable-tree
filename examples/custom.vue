<template>
    <Tree
        draggable
        v-model="data"
        :afterInsert="afterInsert"
        :template="template"
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
            },
            {
                key: '0-2',
                title: '外套',
            },
        ],
    },
    {
        key: '1',
        title: '男装',
    },
    {
        key: '2',
        title: '图书',
        children: [
            {
                key: '2-0',
                title: '小说',
                children: [
                    {
                        key: '2-0-0',
                        title: '九州牧云录',
                    },
                    {
                        key: '2-0-1',
                        title: '天空的城',
                    },
                    {
                        key: '2-0-2',
                        title: '三体',
                    },
                ],
            },
            {
                key: '2-1',
                title: '经管',
                children: [
                    {
                        key: '2-1-0',
                        title: '创京东',
                    },
                ],
            },
            {
                key: '2-2',
                title: '科技',
                children: [
                    {
                        key: '2-2-0',
                        title: 'JavaScript权威指南',
                        highlight: true,
                    },
                    {
                        key: '2-2-1',
                        title: 'JavaScript高级程序设计',
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
            const newValue = prompt('请输入新标题');
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
    },
};
</script>

<style>

</style>
