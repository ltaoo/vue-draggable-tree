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
            onDrop(info) {
                console.log('on drop in main', info);
                const dropKey = info.node.eventKey;
                const dragKey = info.dragNode.eventKey;
                const dropPos = info.node.pos.split('-');
                const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
                // // const dragNodesKeys = info.dragNodesKeys;
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
                const data = [...this.gData];
                let dragObj;
                loop(data, dragKey, (item, index, arr) => {
                    arr.splice(index, 1);
                    dragObj = item;
                });
                if (info.dropToGap) {
                    let ar;
                    let i;
                    loop(data, dropKey, (item, index, arr) => {
                        ar = arr;
                        i = index;
                    });
                    if (dropPosition === -1) {
                        ar.splice(i, 0, dragObj);
                    } else {
                        ar.splice(i - 1, 0, dragObj);
                    }
                } else {
                    loop(data, dropKey, (item) => {
                        /* eslint-disable */
                        item.children = item.children || [];
                        // where to insert 示例添加到尾部，可以是随意位置
                        item.children.push(dragObj);
                    });
                }
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
