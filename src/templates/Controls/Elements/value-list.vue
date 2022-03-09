<template>
    <div class="position-relative">
        <ul class="list-group">
            <li v-if="control.labelAlign != labelAlignments.hidden" class="list-group-item active">
                <mesa-label :control="control"></mesa-label>
            </li>
            <li v-for="option in control.options" class="list-group-item font-14 background-transparent">
                {{ option }}
            </li>
        </ul>
    </div>
</template>

<script>
    import Vuex from 'vuex';

    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} },
        computed: {
            ...Vuex.mapState([
                'labelAlignments'
            ])
        }
    }
</script>

<style scoped>
    .active
    {
        z-index: auto !important;
    }

    .list-group-item
    {
        padding: 0.55rem 1rem !important;
    }
</style>