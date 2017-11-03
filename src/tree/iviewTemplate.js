import Vue from 'vue';
import './iview.css';

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
