<template>
    <div class="position-relative" style="min-height: 26px">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div v-html="control.htmlText" class="static-text"></div>
    </div>
</template>

<script>
    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} }
    }
</script>

<style scoped>
    .static-text
    {
        display: flex;
        flex-grow: 1;
        align-self: stretch;
        align-items: center;
    }

    .static-text > :first-child
    {
        margin-top: 0 !important;
    }

    .static-text > :last-child
    {
        margin-bottom: 0 !important;
    }
</style>