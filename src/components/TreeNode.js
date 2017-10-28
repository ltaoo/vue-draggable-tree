import Vue from 'vue';
import classNames from 'classnames';

const defaultTitle = '---';

export default Vue.component('TreeNode', {
    props: {
        title: {
            type: String,
            default() {
                return defaultTitle;
            },
        },
        prefixCls: {
            type: String,
        },
        disabled: {
            type: Boolean,
        },
        disableCheckbox: {
            type: Boolean,
        },
        expanded: {
            type: Boolean,
        },
        isLeaf: {
            type: Boolean,
        },
        root: {
            type: Object,
        },
        onSelect: {
            type: Function,
        },
        props: {
            type: Object,
        },
    },
    data() {
        return {
            dataLoading: false,
            dragNodeHighlight: false,
        };
    },
    methods: {
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
            this.setState({
                dragNodeHighlight: true,
            });
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
        renderChildren(props) {
            this.renderFirst = 1;
            let children = null;
            if (props.children) {
                // children = toArray(props.children).filter(item => !!item);
                children = [];
            }
            let newChildren = children;
            if (children &&
                (Array.isArray(children) && children.length &&
                    children.every(item => item.type && item.type.isTreeNode) ||
                    (children.type && children.type.isTreeNode))) {
                const cls = classNames(`${props.prefixCls}-child-tree`, {
                    [`${props.prefixCls}-child-tree-open`]: props.expanded,
                });
                newChildren = (
                    <div
                    >
                        {!props.expanded ? null : (
                            <ul className={cls} data-expanded={props.expanded}>
                                {this.root.renderTreeNode()}
                            </ul>
                        )}
                    </div>
                );
            }
            return newChildren;
        },
    },
    render() {
        const props = this.props || {};
        const prefixCls = props.prefixCls || 'vim';
        const expandedState = props.expanded ? 'open' : 'close';
        let iconState = expandedState;
        let newChildren = this.renderChildren(props);
        const content = props.title;
        if (!newChildren || newChildren === props.children) {
            // content = newChildren;
            newChildren = null;
            if (!props.loadData || props.isLeaf) {
                iconState = 'docu';
            }
        }
        const iconEleCls = {
            [`${prefixCls}-iconEle`]: true,
            [`${prefixCls}-icon_loading`]: this.dataLoading,
            [`${prefixCls}-icon__${iconState}`]: true,
        };
        const selectHandle = () => {
            const icon = ((props.showIcon || props.loadData) && this.dataLoading) ?
                <span className={classNames(iconEleCls)}></span> : null;
            const title = <span className={`${prefixCls}-title`}>{content}</span>;
            const wrap = `${prefixCls}-node-content-wrapper`;
            const domProps = {
                className: `${wrap} ${wrap}-${iconState === expandedState ? iconState : 'normal'}`,
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
                    } else if (props.checkable && !props.disableCheckbox) {
                        e.preventDefault();
                        // && !props.disabled is checked on line 259
                        this.onCheck();
                    }
                };
                if (props.draggable) {
                    domProps.className += ' draggable';
                    domProps.draggable = true;
                    domProps['aria-grabbed'] = true;
                    domProps.onDragStart = this.onDragStart;
                }
            }
            return (
                <span
                    ref={this.saveSelectHandle}
                    title={typeof content === 'string' ? content : ''}
                    {...domProps}
                >
                    {icon}{title}
                </span>
            );
        };

        const liProps = {};
        if (props.draggable) {
            liProps.onDragEnter = this.onDragEnter;
            liProps.onDragOver = this.onDragOver;
            liProps.onDragLeave = this.onDragLeave;
            liProps.onDrop = this.onDrop;
            liProps.onDragEnd = this.onDragEnd;
        }
        return (
            <li
                {...liProps}
                className={classNames(props.className)}
            >
                {selectHandle()}
                {newChildren}
            </li>
        );
    },
});
