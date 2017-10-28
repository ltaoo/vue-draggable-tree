import Vue from 'vue';
import classNames from 'classnames';
import {
    loop,
} from '@/utils';

const defaultTitle = '---';

const TreeNode = Vue.component('TreeNode', {
    props: {
        title: {
            type: String,
            default() {
                return defaultTitle;
            },
        },
        rckey: {
            type: String,
        },
        props: {
            type: Object,
        },
        root: {
            type: Object,
        },
        vchildren: {
            type: Array,
        },
    },
    data() {
        console.log('in tree node', this, this.rckey);
        return {
            dataLoading: false,
            dragNodeHighlight: false,
        };
    },
    computed: {
        children() {
            console.log(this.$vnode);
            return this.$vnode.data.props ? this.$vnode.data.props.vChildren : null;
        },
    },
    methods: {
        renderChildren() {
            // children 为 Array
        },
    },
    render(h) {
        const props = this.props || {};
        let newchildren = null;
        const children = this.children;
        console.log(typeof h, 'in tree node');
        if (children) {
            newchildren = (
                <ul>
                    {this.root.renderTreeNode(loop(children, h, TreeNode))}
                </ul>
            );
        }

        return (
            <li
                className={classNames(props.className || '')}
            >
                <span class="tree__title">{this.rckey}</span>
                {newchildren}
            </li>
        );
    },
});

export default TreeNode;
