import Vue from 'vue';

import TreeNode from '@/components/TreeNode';

Vue.component('Tree', {
    props: ['data'],
    components: {
        TreeNode,
    },
    methods: {
        renderTreeNode(child, index, level = 0) {
            const { state, props } = this;
            const pos = `${level}-${index}`;
            const key = child.key || pos;

            const childProps = {
                root: this,
                eventKey: key,
                pos,
                loadData: props.loadData,
                prefixCls: props.prefixCls,
                showIcon: props.showIcon,
                draggable: props.draggable,
                dragOver: state.dragOverNodeKey === key && state.dropPosition === 0,
                dragOverGapTop: state.dragOverNodeKey === key && state.dropPosition === -1,
                dragOverGapBottom: state.dragOverNodeKey === key && state.dropPosition === 1,
                expanded: state.expandedKeys.indexOf(key) !== -1,
                selected: state.selectedKeys.indexOf(key) !== -1,
                openTransitionName: this.getOpenTransitionName(),
                openAnimation: props.openAnimation,
                filterTreeNode: this.filterTreeNode,
            };
            if (props.checkable) {
                childProps.checkable = props.checkable;
                childProps.checked = state.checkedKeys.indexOf(key) !== -1;
                childProps.halfChecked = state.halfCheckedKeys.indexOf(key) !== -1;
            }
            return <TreeNode {...childProps} />;
        },
    },
    render() {
        const loop = data => data.map((item) => {
            if (item.children && item.children.length) {
                return <TreeNode key={item.key} title={item.key}>{loop(item.children)}</TreeNode>;
            }
            return <TreeNode key={item.key} title={item.key} />;
        });
        return (<ul
            role="tree-node"
            unselectable="on"
        >
            {loop(this.data)}
        </ul>);
    },
});
