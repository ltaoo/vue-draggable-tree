import Vue from 'vue';

import TreeNode from '@/components/TreeNode';
import {
    loop,
} from '@/utils';

Vue.component('Tree', {
    props: ['data'],
    methods: {
        /**
         * 渲染单个节点，更确切的说法应该是处理节点，视情况添加 children
         * @param {VNode} child
         * @param {*} index
         * @param {*} level
         */
        renderTreeNode(child, index = 0, level = 0) {
            const pos = `${level}-${index}`;
            const key = child.rckey || pos;

            const childProps = {
                rckey: key,
                title: key,
                props: child.data,
                vchildren: child.vChildren,
                ...child.data,
            };
            return <TreeNode root={this} {...childProps} />;
        },
    },
    render(h) {
        // 传过来的 children，这个时候还是 VNode
        const vChildren = loop(this.data, h, TreeNode);
        /**
         * 1、一定是先渲染最顶层的节点
         * 2、如果节点还有子节点，交给子节点自己处理
         */
        return (<ul
            role="tree-node"
            unselectable="on"
        >
            {vChildren.map(child => this.renderTreeNode(child))}
        </ul>);
    },
});
