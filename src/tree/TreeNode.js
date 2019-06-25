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
        createElement: {
            type: Function,
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
            const { expanded, children, createElement } = this;
            let newchildren = null;
            if (children && !expanded) {
                newchildren = <ul class="ivu-tree-children">
                    {children.map((formattedSourceNode, i) =>
                        this.root.renderTreeNode(formattedSourceNode, i, createElement),
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
            let state = '';
            if (this.source.children && this.source.children.length > 0) {
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
                        (this.source.children && this.source.children.length)
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
        // 当前位置
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
