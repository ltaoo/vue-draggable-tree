<template>
    <div>
        <div class="basic">
            <h2>基本用法</h2>
            <p>只是单纯渲染树</p>
            <div>
                <Basic
                    ref="code"
                    style="display: inline-block; width: 50vw; vertical-align: top;"
                ></Basic>
                <pre
                    style="display: inline-block; width: 44vw; font-size: 12px; vertical-align: top;"
                    v-html="code">
                </pre>
            </div>
            <pre>
                <code v-html="sourceCode">
                </code>
            </pre>
        </div>
        <div class="custom">
            <h2>自定义子节点内容</h2>
        </div>
    </div>
</template>

<script>
import Highlight from './Highlight';
import Basic from './basic';

function syntaxHighlight(json) {
    let res = json;
    if (typeof res !== 'string') {
        res = JSON.stringify(res, undefined, 2);
    }
    res = res.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
    return res.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+]?\d+)?)/g, (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return `<span class=${cls}>${match}</span>`;
    });
}

export default {
    name: 'vue-draggable-tree-demo',
    components: {
        Highlight,
        Basic,
    },
    data() {
        return {
            code: '',
            sourceCode: '',
        };
    },
    computed: {
    },
    mounted() {
        const component = this.$refs.code;
        const data = component.data;
        this.code = syntaxHighlight(data);
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
    .string { color: green; }
    .number { color: darkorange; }
    .boolean { color: blue; }
    .null { color: magenta; }
    .key { color: red; }
</style>
