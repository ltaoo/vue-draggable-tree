<template>
    <div>
        <div class="basic">
            <h2>基本用法</h2>
            <p>只是单纯渲染树</p>
            <div>
                <Basic></Basic>
            </div>
            <a href="https://github.com/ltaoo/vue-draggable-tree/blob/master/examples/basic.vue">代码</a>
        </div>
        <div class="custom">
            <h2>自定义子节点内容</h2>
            <p>可以自定义内容，增加按钮、icon 等。
            <div>
                <Custom />
            </div>
            <a href="https://github.com/ltaoo/vue-draggable-tree/blob/master/examples/custom.vue">代码</a>
        </div>
        <div>
            <h2>展示全部的 hook</h2>
            <div>
                <Hooks />
            </div>
            <a href="https://github.com/ltaoo/vue-draggable-tree/blob/master/examples/hooks.vue">代码</a>
        </div>
    </div>
</template>

<script>
import Highlight from './Highlight';

import Basic from './basic';
import Custom from './custom';
import Hooks from './hooks';

export default {
    name: 'vue-draggable-tree-demo',
    components: {
        Highlight,
        Basic,
        Custom,
        Hooks,
    },
    data() {
        return {
            name: 'demo',
        };
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
