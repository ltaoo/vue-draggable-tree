import Vue from 'vue';
import classNames from 'classnames';

import arrow from './arrow.svg';

const defaultTitle = '---';
const defaultPrefixCls = 'rc';

const TreeNode = Vue.component('TreeNode', {
    props: {
        prefixCls: {
            type: String,
            default() {
                return defaultPrefixCls;
            },
        },
        source: {
            type: Object,
        },
        title: {
            type: String,
            default() {
                return defaultTitle;
            },
        },
        rckey: {
        },
        pos: {
            type: String,
        },
        // 父节点
        root: {
            type: Object,
        },
        vChildren: {
            type: Array,
        },
        eventKey: {
        },
        draggable: {
            type: Boolean,
            default: false,
        },
        dragOver: {},
        dragOverGapTop: {
            type: Boolean,
        },
        dragOverGapBottom: {
            type: Boolean,
        },
        template: {},
        // 展开收起状态
        expanded: {
            type: Boolean,
        },
    },
    data() {
        this.isTreeNode = true;
        return {
            dataLoading: false,
            dragNodeHighlight: false,
        };
    },
    computed: {
        // 将正在拖拽的节点暴露在 this 上
        handleSelect() {
            return this.$refs.handleSelect;
        },
    },
    methods: {
        /**
         * 渲染子节点
         */
        renderChildren() {
            const { expanded } = this;
            let newchildren = null;
            const vChildren = this.vChildren;
            if (vChildren && !expanded) {
                newchildren = <ul class="ivu-tree-children">
                    {vChildren.map((vnode, i) =>
                        this.root.renderTreeNode(vnode, i),
                    )}
                </ul>;
            }
            return newchildren;
        },
        onSelect() {
            this.root.onSelect(this);
        },
        onDragStart(e) {
            e.stopPropagation();
            this.dragNodeHighlight = true;
            this.root.dragStart(e, this);
            try {
                // ie throw error
                // firefox-need-it
                e.dataTransfer.setData('text/plain', '');
            } catch (error) {
                // empty
            }
        },
        onDragEnter(e) {
            e.preventDefault();
            e.stopPropagation();
            this.root.dragEnter(e, this);
        },
        onDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            this.root.dragOver(e, this);
        },
        onDragLeave(e) {
            e.stopPropagation();
            this.root.dragLeave(e, this);
        },
        onDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            this.dragNodeHighlight = false;
            this.root.drop(e, this);
        },
        onDragEnd(e) {
            e.stopPropagation();
            this.dragNodeHighlight = false;
            this.root.dragEnd(e, this);
        },
        onExpand() {
            const callbackPromise = this.root.expand(this);
            if (callbackPromise && typeof callbackPromise === 'object') {
                const setLoading = (dataLoading) => {
                    this.dataLoading = dataLoading;
                };
                setLoading(true);
                callbackPromise.then(() => {
                    setLoading(false);
                }, () => {
                    setLoading(false);
                });
            }
        },
        switcher() {
            // const { prefixCls } = this;
            let state = '';
            if (this.source.children && this.source.children.length > 0) {
                // 如果是开的
                if (this.expanded) {
                    state += ' ivu-tree-arrow-open';
                } else {
                    state = '';
                }
            }
            // return <span onClick={this.onExpand}>{state}</span>;
            return (<span
                        onClick={this.onExpand}
            class={`ivu-tree-arrow${state}`}>{(this.source.children && this.source.children.length) ? <img style="width: 16px; vertical-align: bottom;" src={arrow} /> : null}</span>);
        },
    },
    render(h) {
        // 渲染可拖拽部分，标题
        const selectHandle = () => {
            // const { prefixCls } = this;
            const content = this.title;
            // const title = <span class={`${prefixCls}-title`}>{content}</span>;

            const Component = this.template;
            return h('span', {
                ref: 'selectHandle',
                attrs: {
                    class: 'ant-tree-node-content-wrapper ant-tree-node-content-wrapper-normal draggable',
                    draggable: this.draggable,
                },
                on: {
                    dragstart: this.onDragStart,
                    dragenter: this.onDragEnter,
                    dragover: this.onDragOver,
                    drop: this.onDrop,
                    dragend: this.onDragEnd,
                },
            }, [h(Component, {
                attrs: {
                },
                props: {
                    title: content,
                    node: this.source,
                },
            }, [])]);
        };
        // 当前位置
        // const { prefixCls } = this;
        // let disabledCls = '';
        let dragOverCls = '';
        if (this.disabled) {
            //   disabledCls = `${prefixCls}-treenode-disabled`;
        } else if (this.dragOver) {
            dragOverCls = 'drag-over';
        } else if (this.dragOverGapTop) {
            dragOverCls = 'drag-over-gap-top';
        } else if (this.dragOverGapBottom) {
            dragOverCls = 'drag-over-gap-bottom';
        }

        return h('li', {
            class: classNames(dragOverCls),
        }, [this.switcher(), selectHandle(), this.renderChildren()]);
    },
});

export default TreeNode;
