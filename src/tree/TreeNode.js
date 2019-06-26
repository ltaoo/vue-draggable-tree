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
        children: {
            type: Array,
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
            const { expanded, children } = this;
            let newchildren = null;
            if (children && !expanded) {
                newchildren = <ul class="ivu-tree-children">
                    {children.map(formattedSourceNode =>
                        this.root.renderTreeNode(formattedSourceNode),
                    )}
                </ul>;
            }
            return newchildren;
        },
        onSelect() {
            this.root.onSelect(this);
        },
        onDragStart(e) {
            // console.log(this.title, 'drag start');
            e.stopPropagation();
            this.dragNodeHighlight = true;
            this.root.handleStartDrag(e, this);
            try {
                // ie throw error
                // firefox-need-it
                e.dataTransfer.setData('text/plain', '');
            } catch (error) {
                // empty
            }
        },
        onDragEnter(e) {
            // console.log(this.title, 'drag enter', e.target);
            e.preventDefault();
            e.stopPropagation();
            this.root.handleNodeEntered(e, this);
        },
        onDragOver(e) {
            // console.log(this.title, 'drag over', e.target);
            e.preventDefault();
            e.stopPropagation();
            this.root.handleNodeCrossed(e, this);
        },
        onDragLeave(e) {
            // console.log(this.title, 'drag leave', e.target);
            e.stopPropagation();
            this.root.handleNodeLeaved(e, this);
        },
        onDrop(e) {
            // console.log(this.title, 'drop', e.target);
            e.preventDefault();
            e.stopPropagation();
            this.dragNodeHighlight = false;
            this.root.handleNodeDropped(e, this);
        },
        onDragEnd(e) {
            // console.log(this.title, 'drag end', e.target);
            e.stopPropagation();
            this.dragNodeHighlight = false;
            this.root.handleDragEnd(e, this);
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
            let state = '';
            if (this.children && this.children.length > 0) {
                if (this.expanded) {
                    state += ' ivu-tree-arrow-open';
                }
            }
            return (
                <span
                    onClick={this.onExpand}
                    class={`ivu-tree-arrow${state}`}
                >
                    {
                        (this.children && this.children.length)
                        ? <img style="width: 16px; vertical-align: bottom;" src={arrow} />
                        : null
                    }
                </span>
            );
        },
    },
    render(h) {
        // render draggable part
        const selectHandle = () => {
            const content = this.title;
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
                    dragleave: this.onDragLeave,
                    drop: this.onDrop,
                    dragend: this.onDragEnd,
                },
            }, [
                h(Component, {
                    attrs: {},
                    props: {
                        title: content,
                        node: this.source,
                    },
                }, []),
            ]);
        };
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
