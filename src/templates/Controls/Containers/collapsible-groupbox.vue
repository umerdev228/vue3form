<template>
    <div style="flex-grow: 1">
        <div class="c-accordion__panel background-transparent" style="flex-direction: column; flex-grow: 1">
            <div :id="headerId" class="c-accordion__panel-header collapsible-header no-padding">
                <div class="b-btn b-btn--link c-accordion__panel-title no-padding" data-toggle="collapse" :data-target="'#' + contentId" aria-expanded="true" :aria-controls="contentId" style="overflow: hidden">
                    <div class="group-header">
                        <i class="material-icons-round font-20">add_circle</i>
                        <div class="collapsible-label font-14">
                            {{control.label}}
                        </div>
                    </div>
                </div>
            </div>
            <div :id="contentId" class="collapse" v-bind:class="{'show': showOpen}" :aria-labelledby="headerId" :data-parent="dataParent" style="flex-direction: column">
                <div class="c-accordion__panel-body" style="overflow-x: auto">
                    <mesa-form :group="control"></mesa-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Vuex from 'vuex';

    export default
    {
        props: {
            control: Object,
            containerId: String,
            index: Number
        },
        data: () => { return {} },
        computed: {
            ...Vuex.mapState([
                'openGroups'
            ]),
            showOpen: function()
            {
                return this.index === undefined || this.index == 0;
            },
            dataParent: function()
            {
                return this.containerId !== undefined ? '#' + this.containerId : '';
            },
            headerId: function()
            {
                return 'header' + this.control.id;
            },
            contentId: function()
            {
                return 'content' + this.control.id;
            }
        }
    }
</script>

<style scoped>
    .group-header
    {
        display: inline-flex;
        align-items: center;
        margin-left: 1.2rem;
    }

    .collapsible-header
    {
        line-height: 2;
    }

    .collapsible-label
    {
        padding: 0.5rem;
    }
</style>