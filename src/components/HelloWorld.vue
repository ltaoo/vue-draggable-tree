<template>
    <div class="hello">
        <Tree
            :expandedKeys="expandedKeys"
            :onExpand="onExpand"
            :autoExpandParent="autoExpandParent"
            draggable @dragStart="onDragStart"
            @dragEnter="onDragEnter"
            @drop="onDrop"
            :data="gData"
        >
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
            tns.push({ title: key, key });
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
        methods: {
            onDragStart(info) {
                console.log('start', info);
            },
            onDragEnter(info) {
                console.log('enter', info);
                this.expandedKeys = info.expandedKeys;
            },
            onDrop(info) {
                console.log('drop', info);
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
