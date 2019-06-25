# vue-draggable-tree

> 最容易使用的 vue 可拖拽树。

![效果图](./draggable-tree.gif)

参考~~抄袭~~`rc-tree`实现的一个可拖拽树，样式参考`ant-design`。

## Example

online example: https://ltaoo.github.io/vue-draggable-tree/examples/index.html

## Install

```bash
yarn add vue-draggable-tree
```

## Usage

```javascript
<template>
    <Tree
        draggable
        v-model="data"
        :afterInsert="afterInsert"
    ></Tree>
</template>

<script>
import Tree from '../tree';

const EXAMPLE_DATA = [
    {
        key: '0',
        title: '女装',
        children: [
            {
                key: '0-1',
                title: '风衣',
            },
            {
                key: '0-2',
                title: '外套',
            },
        ],
    },
    {
        key: '1',
        title: '男装',
    },
    {
        key: '2',
        title: '图书',
        children: [
            {
                key: '2-0',
                title: '小说',
                children: [
                    {
                        key: '2-0-0',
                        title: '九州牧云录',
                    },
                    {
                        key: '2-0-1',
                        title: '天空的城',
                    },
                    {
                        key: '2-0-2',
                        title: '三体',
                    },
                ],
            },
            {
                key: '2-1',
                title: '经管',
                children: [
                    {
                        key: '2-1-0',
                        title: '创京东',
                    },
                ],
            },
            {
                key: '2-2',
                title: '科技',
                children: [
                    {
                        key: '2-2-0',
                        title: 'JavaScript权威指南',
                    },
                    {
                        key: '2-2-1',
                        title: 'JavaScript高级程序设计',
                    },
                ],
            },
        ],
    },
];

export default {
    name: 'vue-draggable-tree-demo',
    components: {
        Tree,
    },
    data() {
        return {
            data: EXAMPLE_DATA,
        };
    },
    methods: {
        afterInsert() {
            console.log(this.data);
        },
    },
};
</script>

<style>

</style>
```

## API

属性 | 说明 | 类型 | 默认值 |
---|---|---|---|
data | 要渲染的数据 | Array | 空
draggable | 设置节点可拖拽（IE>8）| Boolean | false
dragEnd | 拖拽结束后调用的事件 | function(ary, node, e) | -
onDragEnter | dragenter 触发时调用 | function({event, node}) | -
onDragLeave | dragleave 触发时调用 | function({event, node}) | -
onDragOver | dragover 触发时调用 | function({event, node}) | -
onDragStart | dragstart 触发时调用 | function({event, node}) | -
onDrop | drop 触发时调用 | function({event, node}) | -
onExpand | 展开/收起节点时触发 | function({event, node}) | -
afterInsert | 在节点插入到指定位置后调用 | function() | -
template | 自定义节点内容 | VueComponent | -

## 说明
树组件，分为两部分吧，首先是渲染，其次是渲染后处理拖动。

### render
渲染其实比较简单，首先我们有「元数据」，我们定义下接口

```typescript
interface SourceNode {
    key: string;
    title: string;
    children?: Array<SourceNode>;
    [propName: string]: any;
}
```

`key` 需要是唯一值。然后根据这个元数据生成 `vnode`，`Tree` 组件要求 `data` 是数组，所以是生成了 `vnode` 组成的数组。
再使用 `this.renderTreeNode` 真正地去渲染。

```vue
// vChildren Array<VNode>，h createElement
const vChildren = loop(this.data, h, TreeNode);
<ul
    class="ant-tree tree"
    role="tree-node"
    unselectable="on"
>
    {vChildren.map((child, i) => this.renderTreeNode(child, i))}
</ul>
```

`VNode` 的接口长什么样呢？

```js
interface VNode {
    tag: string;
    data: Object;
    children: Array<VNode>;
    // ...
}
```

在 `React` 中，`JSX` 其实是创建 `React Element` 的语法糖，这里也是类似，

参考 [渲染函数 & JSX](https://cn.vuejs.org/v2/guide/render-function.html#JSX)

### drop
该组件核心概念在于，所有 `TreeNode`，无论层级多深，都是由 `Tree` 这个根组件去管理。

## todo

- 增加 checkbox
- 增加 theme 以方便直接在 iview 或者 element 项目中使用
- examples 展示页用例完善
- 代码整理
- 选中状态
- 增加连接线
- 增加禁用状态
- 是否展开控制
