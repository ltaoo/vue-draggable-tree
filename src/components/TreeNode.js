import Vue from 'vue';
import classNames from 'classnames';

const defaultTitle = '---';

const defaultTemplate = Vue.component('DEFAULT_TEMPLATE', {
    props: {
        title: {
        },
        node: {
            type: Object,
        },
    },
    render() {
        return (<div><span>{this.title}</span></div>);
    },
});

const TreeNode = Vue.component('TreeNode', {
    props: {
        prefixCls: {
            type: String,
            default() {
                return 'rc';
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
        dragOver: {},
        dragOverGapTop: {
            type: Boolean,
        },
        dragOverGapBottom: {
            type: Boolean,
        },
        template: {},
    },
    data() {
        this.isTreeNode = true;
        return {
            dataLoading: false,
            dragNodeHighlight: false,
            expanded: false,
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
            const { expanded } = this;
            let newchildren = null;
            const vChildren = this.vChildren;
            if (vChildren && !expanded) {
                newchildren = <ul>
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
        onExpand() {
            this.expanded = !this.expanded;
            // const callbackPromise = this.root.onExpand(this);
            // if (callbackPromise && typeof callbackPromise === 'object') {
            //     const setLoading = (dataLoading) => {
            //         this.dataLoading = dataLoading;
            //     };
            //     setLoading(true);
            //     callbackPromise.then(() => {
            //         setLoading(false);
            //     }, () => {
            //         setLoading(false);
            //     });
            // }
        },
        switcher() {
            // const { prefixCls } = this;
            let state = '';
            if (this.source.children && this.source.children.length > 0) {
                // 如果是开的
                if (this.expanded) {
                    state = '+';
                } else {
                    state = '-';
                }
            }
            return <span onClick={this.onExpand}>{state}</span>;
        },
    },
    render(h) {
        // 渲染可拖拽部分，标题
        const selectHandle = () => {
            const { prefixCls } = this;
            const content = this.title;
            const title = <span class={`${prefixCls}-title`}>{content}</span>;
            const wrap = `${prefixCls}-node-content-wrapper`;
            const domProps = {
                class: `${wrap} ${wrap}-normal`,
                // onMouseEnter: this.onMouseEnter,
                // onMouseLeave: this.onMouseLeave,
                // onContextMenu: this.onContextMenu,
            };
            if (!this.disabled) {
                if (this.selected || this.dragNodeHighlight) {
                    domProps.class += ` ${prefixCls}-node-selected`;
                }
                // domProps.onClick = (e) => {
                //     if (this.isSelectable()) {
                //         e.preventDefault();
                //         this.onSelect();
                //     }
                // };
                if (this.draggable) {
                    domProps.class += ' draggable';
                    domProps.draggable = true;
                    domProps['aria-grabbed'] = true;
                }
            }
            const Component = this.template || defaultTemplate;
            return h('span', {
                ref: 'selectHandle',
                attrs: {
                    class: 'title-wrapper draggable',
                    style: 'height: 17px; font-size: 14px; padding-top: 2px; vertical-align: top;',
                },
                domProps: {
                    draggable: true,
                },
                on: {
                    dragstart: (e) => {
                        this.onDragStart(e);
                    },
                    dragenter: (e) => {
                        this.onDragEnter(e);
                    },
                    dragover: (e) => {
                        this.onDragOver(e);
                    },
                    drop: (e) => {
                        this.onDrop(e);
                    },
                    dragend: (e) => {
                        this.onDragEnd(e);
                    },
                },
            }, [h(Component, {
                attrs: {
                },
                props: {
                    title,
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
