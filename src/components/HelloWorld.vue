<template>
    <div class="hello">
        <Tree :expandedKeys="expandedKeys" :props="props" :onExpand="onExpand" :autoExpandParent="autoExpandParent" draggable @dragStart="onDragStart" @dragEnter="onDragEnter" @drop="onDrop" :data="gData">
        </Tree>
    </div>
</template>

<script>
    const x = 3;
    const y = 2;
    const z = 1;
    const gData = [];

    const generateData = function (_level, _preKey, _tns) {
        const preKey = _preKey || '0';
        const tns = _tns || gData;

        const children = [];
        for (let i = 0; i < x; i += 1) {
            const key = `${preKey}-${i}`;
            tns.push({
                title: key,
                key,
            });
            if (i < y) {
                children.push(key);
            }
        }
        if (_level < 0) {
            return tns;
        }
        const level = _level - 1;
        children.forEach((key, index) => {
            tns[index].children = [];
            return generateData(level, key, tns[index].children);
        });
        return [];
    };
    generateData(z);

    export default {
        name: 'HelloWorld',
        data() {
            return {
                gData,
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
                console.log('enter', info);
                this.expandedKeys = info.expandedKeys;
            },
            /**
             * 结束拖拽后此时的信息，包括目标节点、拖拽节点、位置
             */
            onDrop(info) {
                console.log('on drop in main', info);
                // 目标节点
                const dropKey = info.node.eventKey;
                // 正在拖拽的节点
                const dragKey = info.dragNode.eventKey;
                const dropPos = info.node.pos.split('-');
                const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
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
                        console.log('index', item, arr, index);
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
