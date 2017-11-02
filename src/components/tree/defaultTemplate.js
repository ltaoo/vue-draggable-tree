import Vue from 'vue';

export default Vue.component('DEFAULT_TEMPLATE', {
    props: {
        title: {
        },
        node: {
            type: Object,
        },
    },
    render() {
        return (<div><span>{this.title}</span></div>);
    },
});
