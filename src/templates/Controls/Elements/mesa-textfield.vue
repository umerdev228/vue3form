<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div class="display-flex" style="align-items: center; flex-grow: 1">
            <input type="text" class="form-control mesa-input i-text__field i-text font-14" tabindex="-1" :value="control.text" v-bind:size="controlWidth" disabled />
        </div>
    </div>
</template>

<script>
    import Vuex from 'vuex';

    import lib from '@/lib';

    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} },
        computed: {
            ...Vuex.mapGetters([
                'maxCharacters'
            ]),
            controlWidth: function()
            {
                var width = this.control.characters * 0.95;
                return width < 9 ? 9 : width;
            }
        },
        watch: {
            maxCharacters: function()
            {
                var text = lib.getPlaceholderText(this.control);
                if (text !== undefined)
                    this.control.text = text;
            }
        }
    }
</script>

<style scoped>
    .mesa-input
    {
        background-color: white !important;
        padding: 0 10px !important;
        cursor: pointer !important;
        color: #607d8b !important;
        border: 1px solid #d5dce0;
        user-select: none;
        height: 33px;
    }
</style>