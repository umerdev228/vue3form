<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <label class="i-checkbox i-checkbox__label padding-10 margin-bottom-3" v-bind:class="{'margin-top-3': control.labelAlign == labelAlignments.left || control.labelAlign == labelAlignments.right || control.labelAlign == labelAlignments.hidden, 'margin-right-3': control.labelAlign == labelAlignments.hidden, 'margin-left-3': control.labelAlign == labelAlignments.hidden}">
            <input type="checkbox" tabindex="-1" disabled checked />
            <span class="i-checkbox__field"></span>
        </label>
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

<style scoped></style>