import Vue from 'vue';

export default Vue.component('IVIEW_TEMPLATE', {
    props: {
        title: {
        },
        node: {
            type: Object,
        },
    },
    render() {
        return (
            <span class="ant-tree-title">{this.title}</span>
        );
    },
});
