<template>
    <div>
        <pre>
            <code class="nohighlight" v-html="code">
                <slot>
                </slot>
            </code>
        </pre>
    </div>
</template>

<script>
export default {
    name: 'high-light',
    props: ['code'],
};
</script>

<style>

</style>
