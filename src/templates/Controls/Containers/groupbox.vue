<template>
    <div class="c-groupbox mesa-groupbox position-relative" style="overflow-x: auto; min-height: 26px; min-width: 40px">
        <div class="c-groupbox__title mesa-group-title font-14">
            {{control.label}}
        </div>
        <mesa-form :group="control"></mesa-form>
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
    .mesa-group-title
    {
        padding: 0.2rem;
    }

    .mesa-groupbox
    {
        background-color: inherit;
        display: inherit;
    }
</style>