<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div class="i-textarea--readonly display-flex" style="align-items: center; flex-grow: 1">
            <textarea class="i-textarea__field i-textarea mesa-textarea" tabindex="-1" v-bind:rows="control.lines" v-bind:cols="controlWidth" disabled>{{controlText}}</textarea>
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
            controlText: function()
            {
                return 'x'.repeat(this.control.lines * this.control.characters + this.control.lines * 2);
            },
            controlWidth: function()
            {
                return this.control.characters < 10 ? 10 : this.control.characters;
            }
        }
    }
</script>

<style scoped>
    .mesa-textarea
    {
        background-color: white !important;
        padding: 8px 10px !important;
        cursor: pointer !important;
        resize: none;
    }
</style>