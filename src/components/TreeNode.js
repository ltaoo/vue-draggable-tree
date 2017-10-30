import Vue from 'vue';
import classNames from 'classnames';

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
        // 父节点
        root: {
            type: Object,
        },
        vChildren: {
            type: Array,
        },
        pos: {
            type: String,
        },
        eventKey: {
            type: String,
        },
        dragOverGapTop: {
            type: Boolean,
        },
        dragOverGapBottom: {
            type: Boolean,
        },
    },
    data() {
        return {
            dataLoading: false,
            dragNodeHighlight: false,
        };
    },
    computed: {
        handleSelect() {
            return this.$refs.handleSelect;
        },
    },
    methods: {
        /**
         * 渲染子节点
         */
        renderChildren() {
            let newchildren = null;
            const vChildren = this.vChildren;
            if (vChildren) {
                newchildren = (
                    <ul>
                        {vChildren.map((vnode, i) => this.root.renderTreeNode(vnode, i))}
                    </ul>
                );
            }
            return newchildren;
        },
        onSelect() {
            this.root.onSelect(this);
        },
        onMouseEnter(e) {
            e.preventDefault();
            this.root.onMouseEnter(e, this);
        },
        onMouseLeave(e) {
            e.preventDefault();
            this.root.onMouseLeave(e, this);
        },
        onContextMenu(e) {
            this.root.onContextMenu(e, this);
        },
        onDragStart(e) {
            e.stopPropagation();
            this.dragNodeHighlight = true;
            this.root.onDragStart(e, this);
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
            this.root.onDragEnter(e, this);
        },
        onDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            this.root.onDragOver(e, this);
        },
        onDragLeave(e) {
            e.stopPropagation();
            this.root.onDragLeave(e, this);
        },
        onDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            this.dragNodeHighlight = false;
            this.root.onDrop(e, this);
        },
        onDragEnd(e) {
            e.stopPropagation();
            this.dragNodeHighlight = false;
            this.root.onDragEnd(e, this);
        },
    },
    render(h) {
        // 渲染可拖拽部分，标题
        const selectHandle = () => {
            const props = {
                disabled: false,
            };
            const content = this.title;
            const prefixCls = 'c';
            const title = <span class={`${prefixCls}-title`}>{content}</span>;
            const wrap = `${prefixCls}-node-content-wrapper`;
            const domProps = {
                className: `${wrap} ${wrap}-normal`,
                onMouseEnter: this.onMouseEnter,
                onMouseLeave: this.onMouseLeave,
                onContextMenu: this.onContextMenu,
            };
            if (!props.disabled) {
                if (props.selected || this.dragNodeHighlight) {
                    domProps.className += ` ${prefixCls}-node-selected`;
                }
                domProps.onClick = (e) => {
                    if (this.isSelectable()) {
                        e.preventDefault();
                        this.onSelect();
                    }
                };
                if (props.draggable) {
                    domProps.class += ' draggable';
                    domProps.draggable = true;
                    domProps['aria-grabbed'] = true;
                }
            }
            return h('span', {
                ref: 'selectHandle',
                attrs: {
                    draggable: true,
                    ...domProps,
                },
                domProps: {
                    draggable: true,
                    ...domProps,
                },
                on: {
                    dragstart: (e) => {
                        this.onDragStart(e);
                    },
                    dragenter: (e) => {
                        this.onDragEnter(e);
                    },
                    dragover: (e) => {
                        // this.onDragEnter(e);
                        this.onDragOver(e);
                    },
                    drop: (e) => {
                        this.onDrop(e);
                    },
                    dragend: (e) => {
                        this.onDragEnd(e);
                    },
                },
            }, [title]);
        };
        // 当前位置
        // const prefixCls = 'c';
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

        // return (
        //     <li
        //         class={classNames(dragOverCls)}
        //     >
        //         {selectHandle()}
        //         {this.renderChildren()}
        //     </li>
        // );
        return h('li', {
            class: classNames(dragOverCls),
        }, [selectHandle(), this.renderChildren()]);
    },
});

export default TreeNode;
