# vue-draggable-tree

> 可拖拽 vue 树

![效果图](./draggable-tree.gif)

## Example

online example: https://ltaoo.github.io/vue-draggable-tree/examples/index.html

## Install

## Usage

```javascript
<template>
    <div class="hello">
        <Tree
            :draggable="true"
            :data="gData"
            :onDrop="onDrop"
        ></Tree>
    </div>
</template>

<script>
import Tree from './tree';

export default {
    name: 'vue-draggable-tree-demo',
    components: {
        Tree,
    },
    data() {
        return {
            gData: EXAMPLE_DATA,
        };
    },
    methods: {
        /**
         * 结束拖拽后此时的信息，包括目标节点、拖拽节点、位置
         */
        onDrop(info) {
            // 目标节点
            const dropKey = info.node.eventKey;
            // 正在拖拽的节点
            const dragKey = info.dragNode.eventKey;
            const dropPos = info.node.pos.split('-');
            const dropPosition =
                info.dropPosition - Number(dropPos[dropPos.length - 1]);
            // const dragNodesKeys = info.dragNodesKeys;
            /**
             * 遍历 data，节点对应的对象
             * @param {} data
             * @param {} key
             * @param {Function} callback
             */
            const loop = (data, key, callback) => {
                data.forEach((item, index, arr) => {
                    if (item.key === key) {
                        return callback(item, index, arr);
                    }
                    if (item.children) {
                        return loop(item.children, key, callback);
                    }
                    return false;
                });
            };
            // 浅拷贝
            const data = [...this.gData];
            let dragObj;
            loop(data, dragKey, (item, index, arr) => {
                // 找到后，删掉该节点
                arr.splice(index, 1);
                dragObj = item;
            });
            // 然后处理应该放到哪里
            if (info.dropToGap) {
                // 如果是在两个节点之间
                let ar;
                let i;
                // 寻找放置的那个节点对应的数组，保存为 ar
                loop(data, dropKey, (item, index, arr) => {
                    ar = arr;
                    i = index;
                });
                // 如果是放到下边缘
                if (dropPosition === 1) {
                    ar.splice(i + 1, 0, dragObj);
                } else {
                    ar.splice(i, 0, dragObj);
                }
            } else {
                // 成为子节点
                loop(data, dropKey, (item) => {
                    /* eslint-disable */
                    item.children = item.children || [];
                    // where to insert 示例添加到尾部，可以是随意位置
                    item.children.push(dragObj);
                });
            }
            // 改变数据，让 vue 自己去更新视图
            this.gData = data;
        },
    },
};
</script>
```

## API

属性 | 说明 | 类型 | 默认值 |
---|---|---|---|
data | 要渲染的数据 | Array | 空
draggable | 设置节点可拖拽（IE>8）| Boolean | false
onDragEnd | dragend 触发时调用 | function({event, node}) | -
onDragEnter | dragenter 触发时调用 | function({event, node}) | -
onDragLeave | dragleave 触发时调用 | function({event, node}) | -
onDragOver | dragover 触发时调用 | function({event, node}) | -
onDragStart | dragstart 触发时调用 | function({event, node}) | -
onDrop | drop 触发时调用 | function({event, node}) | -
onExpand | 展开/收起节点时触发 | function({event, node}) | -
template | 自定义节点内容 | VueComponent | -