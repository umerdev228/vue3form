<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div class="input-group i-input-group i-date-picker auto-width" style="align-items: center; flex-grow: 1">
            <input type="text" class="form-control mesa-input i-input-group__field i-date-picker__field font-14" tabindex="-1" :value="control.text" v-bind:size="controlWidth" aria-label="" aria-describedby="" disabled />
            <div class="input-group-append i-input-group--right i-date-picker__button">
                <button class="btn b-icon--secondary i-date-picker__button--primary" tabindex="-1" style="z-index: 0">
                    <i class="fa fa-calendar i-input-group__tag-icon"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} },
        computed: {
            controlWidth: function()
            {
                var length = this.control.text.length;
                var chars = this.control.characters
                return (chars < length ? length : chars) * 0.76;
            }
        }
    }
</script>

<style scoped>
    .mesa-input
    {
        background-color: white !important;
        z-index: auto !important;
        padding: 0 10px !important;
        cursor: pointer !important;
        color: #607d8b !important;
        user-select: none;
        height: 33px;
    }
</style>