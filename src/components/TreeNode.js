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
        onSelect() {
            this.props.root.onSelect(this);
        },
        onMouseEnter(e) {
            e.preventDefault();
            this.props.root.onMouseEnter(e, this);
        },
        onMouseLeave(e) {
            e.preventDefault();
            this.props.root.onMouseLeave(e, this);
        },
        onContextMenu(e) {
            this.props.root.onContextMenu(e, this);
        },
        onDragStart(e) {
            console.log('tree node drag start');
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
            this.props.root.onDragEnter(e, this);
        },
        onDragOver(e) {
            e.preventDefault();
            e.stopPropagation();
            this.props.root.onDragOver(e, this);
        },
        onDragLeave(e) {
            e.stopPropagation();
            this.props.root.onDragLeave(e, this);
        },
        onDrop(e) {
            e.preventDefault();
            e.stopPropagation();
            this.setState({
                dragNodeHighlight: false,
            });
            this.props.root.onDrop(e, this);
        },
        onDragEnd(e) {
            e.stopPropagation();
            this.setState({
                dragNodeHighlight: false,
            });
            this.props.root.onDragEnd(e, this);
        },
    },
    render(h) {
        let newchildren = null;
        const children = this.children;
        if (children) {
            const vchildren = loop(children, h, TreeNode);
            newchildren = (
                <ul>
                    {vchildren.map(vnode => this.root.renderTreeNode(vnode))}
                </ul>
            );
        }
        // 渲染可拖拽部分，标题
        const selectHandle = () => {
            const props = {
                disabled: false,
            };
            const content = this.title;
            const prefixCls = 'c';
            const title = <span className={`${prefixCls}-title`}>{content}</span>;
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
                    domProps.className += ' draggable';
                    domProps.draggable = true;
                    domProps['aria-grabbed'] = true;
                    domProps.onDragStart = this.onDragStart;
                }
            }
            // return (
                // <span
                //     ref={this.saveSelectHandle}
                //     title={typeof content === 'string' ? content : ''}
                //     {...domProps}
                //     draggable
                //     ondragstart={this.onDragStart}
                // >
                //     {title}
                // </span>
            // );
            return h('span', {
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
                },
            }, [title]);
        };

        return (
            <li
                className={classNames('')}
            >
                {selectHandle()}
                {newchildren}
            </li>
        );
    },
});

export default TreeNode;
