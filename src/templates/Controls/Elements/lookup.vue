<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div class="input-group i-input-group auto-width" style="align-items: center; flex-grow: 1">
            <input type="text" class="form-control mesa-lookup i-input-group__field font-14" tabindex="-1" :value="control.text" v-bind:size="controlWidth" disabled />
            <div class="input-group-append i-input-group--right">
                <button class="input-group-text i-input-group__tag i-input-group__tag--primary" tabindex="-1">
                    <i class="fa fa-search i-input-group__tag-icon"></i>
                </button>
            </div>
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
    .mesa-lookup
    {
        background-color: white !important;
        z-index: auto !important;
        padding: 0 10px !important;
        cursor: pointer !important;
        color: #607d8b !important;
        user-select: none;
        height: 33px;
    }

    button
    {
        padding: 0.26rem 0.3rem;
    }
</style>