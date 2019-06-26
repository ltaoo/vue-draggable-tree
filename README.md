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
该组件核心概念在于，所有 `TreeNode`，无论层级多深，都是由 `Tree` 这个根组件去管理。每个节点有「位置」属性，类似 0、0-0 这样，个数表示层级，第二位数字表示在该层级的位置，如 '0-1' 表示第一层级的第二个节点。

```js
- 图书
    - 经管
        - 创京东
        - 参与感
- 服装 <----- 这个节点就是 0-1
```

当拖动 `Node` 时，会触发相关事件

- dragstart
- dragenter
- dragover
- drop
- dragend

`dragstart`，当拖动节点时调用；`dragenter`，当拖动时「被进入」节点触发，举例，拖动「三体」到「经管」这个 `node` 时，触发 `dragenter` 的是「经管」节点，而不是「三体」节点；

并且，当 `enter` 时，这里有一个黑科技，`node` 的实际大小要大于我们所看到的大小。当我们移动到「下边缘」时，实际上是已经移到了内部，只是我们看起来还没有到内部，通过鼠标位置与节点位置的计算，我们人为地划分了「上边缘」、「内部」和「下边缘」。

计算方式是先获取到目标节点距离屏幕顶部的距离(top)、目标节点高度(height)、当前鼠标距屏幕顶部距离(y)，如果
- 1、y < top 说明鼠标在节点上方
- 2、y > top + height 说明鼠标在节点下方
- 3、其他情况说明在节点内部

### 进阶

定制渲染内容

### 潜在的 bug

当在同组间移动时，先移除原先的，再插入，位置计算会有问题。

## todo

[]增加 checkbox
[]增加 theme 以方便直接在 iview 或者 element 项目中使用
[]examples 展示页用例完善
[x]代码整理
[]选中状态
[]增加连接线
[]增加禁用状态
[]是否展开控制
