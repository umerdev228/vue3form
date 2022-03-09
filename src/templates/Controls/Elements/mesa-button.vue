<template>
    <div class="position-relative">
        <div class="b-icon-text b-icon-text--secondary font-14 custom-padding">
            {{control.label}}
        </div>
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
    .custom-padding
    {
        padding: 5px 10px;
    }
</style>