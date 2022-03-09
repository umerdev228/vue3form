<template>
    <div style="min-height: 26px; min-width: 40px">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div :id="containerId" class="accordion c-accordion no-margin" style="flex-grow: 1">
            <collapsible-groupbox v-for="(child, i) in children" v-show="!child.hidden" v-bind:id="child.id" :control="child" :container-id="containerId" :index="i" :key="child.id + i"></collapsible-groupbox>
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
            ...Vuex.mapState([
                'controls'
            ]),
            children: function()
            {
                return lib.getGroupChildren(this.controls, this.control.id);
            },
            containerId: function()
            {
                return 'accordion' + this.control.id;
            }
        }
    }
</script>

<style scoped>
    .mesa-group-title
    {
        padding-bottom: 0.5rem;
    }

    .mesa-groupbox
    {
        background-color: inherit;
        display: inherit;
    }
</style>