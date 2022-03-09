<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div class="input-group i-input-group auto-width">
            <div class="custom-file i-input-group__file">
                <input id="input-file-group" type="file" class="custom-file-input mesa-input" tabindex="-1" aria-describedby="input-file-button" disabled />
                <label for="input-file-group" class="custom-file-label i-input-group__file-label">{{lang.keywords.choose_file}}</label>
            </div>
            <div class="input-group-append i-input-group--right">
                <button id="input-file-button" class="btn b-icon--primary i-input-group__button--primary" type="button" tabindex="-1">
                    <i class="fa fa-send i-input-group__tag-icon i-input-group__button-icon"></i>
                </button>
            </div>
        </div>
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
                'lang'
            ])
        }
    }
</script>

<style scoped>
    .custom-file-label
    {
        padding: 6px 10px !important;
        background-color: white !important;
        z-index: auto !important;
        height: 33px !important;
        overflow: hidden;
        cursor: pointer;
    }

    .custom-file-label::after
    {
        padding: 6px !important;
        z-index: auto !important;
        height: 31px !important;
        content: "Browse";
    }
    
    .mesa-input
    {
        z-index: auto !important;
        cursor: pointer !important;
        height: 33px !important;
        color: #607d8b !important;
        user-select: none;
        overflow: hidden;
    }

    .btn
    {
        z-index: auto !important;
    }
</style>