<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <button class="input-group-text i-input-group__tag i-input-group__tag--primary fit-width" tabindex="-1">
            <i class="fa fa-search i-input-group__tag-icon"></i>
        </button>
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
    button
    {
        padding: 0.26rem 0.3rem;
    }
</style>