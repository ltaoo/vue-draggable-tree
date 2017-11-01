<template>
    <div class="hello">
        <Tree :expandedKeys="expandedKeys" :props="props" :onExpand="onExpand" :autoExpandParent="autoExpandParent" draggable @dragStart="onDragStart" @dragEnter="onDragEnter" @drop="onDrop" :data="gData">
        </Tree>
    </div>
</template>

<script>
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
    name: 'HelloWorld',
    data() {
        return {
            gData: EXAMPLE_DATA,
            autoExpandParent: true,
            expandedKeys: ['0-0-key', '0-0-0-key', '0-0-0-0-key'],
        };
    },
    computed: {
        props() {
            return {
                onDragStart: this.onDragStart,
                onDragEnter: this.onDragEnter,
                onDrop: this.onDrop,
                onDragEnd() {},
                onDragOver() {},
            };
        },
    },
    methods: {
        onDragStart(info) {
            console.log('start', info);
        },
        onDragEnter(info) {
            this.expandedKeys = info.expandedKeys;
        },
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
        onExpand(expandedKeys, ...arg) {
            console.log('expand', arg);
            this.expandedKeys = expandedKeys;
            this.autoExpandParent = false;
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
