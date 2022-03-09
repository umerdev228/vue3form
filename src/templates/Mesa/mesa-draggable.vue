<template>
    <draggable v-if="layout != 1" group="controls" handle=".move-control" v-bind="{animation: 500}" :list="controlRow" @change="listChanged" @end="endDrag" ghost-class="drag-ghost" v-bind:style="{'justify-content': alignmentType, 'flex-grow': 1, 'align-items': 'stretch', 'max-width': '100%'}">
        <div v-for="(subcontrol, index) in controlRow" v-show="!subcontrol.hidden" class="mesa-join-group" style="max-width: 100%; line-height: 1.428571429">
            <mesa-control :control="subcontrol" v-bind:class="{'fill-line': fillLine(subcontrol), 'wrap-element': !fillLine(subcontrol), 'flow-group': layout == 0 || layout == 2}" style="max-width: 100%; flex-grow: 1"></mesa-control>
        </div>
    </draggable>
    <draggable v-else group="controls" handle=".move-control" v-bind="{animation: 500}" :list="controlRow" @change="listChanged" @end="endDrag" ghost-class="drag-ghost" style="flex-grow: 1; align-items: stretch; max-width: 100%">
        <div v-for="(subcontrol, index) in controlRow" v-show="!subcontrol.hidden" class="mesa-join-group" v-bind:style="{'justify-content': alignmentType, 'flex-basis': maxWidth, 'max-width': maxWidth, 'line-height': 1.428571429}">
            <mesa-control :control="subcontrol" v-bind:style="{'flex-grow': fillLine(subcontrol) ? 1 : 0, 'max-width': '100%'}"></mesa-control>
        </div>
    </draggable>
</template>

<script>
    import Vuex from 'vuex';
    import Draggable from 'vuedraggable';

    import lib from '@/lib';

    export default
    {
        props: {
            controlRow: Array,
            groupId: String,
            alignmentType: String,
            maxWidth: String,
            layout: Number
        },
        components: {
            'draggable': Draggable
        },
        data: () => { return {} },
        computed: {
            ...Vuex.mapState([
                'form',
                'controls'
            ])
        },
        methods: {
            ...Vuex.mapActions([
                'endDrag'
            ]),
            fillLine: function(control)
            {
                return control.wholeLine || control.ctrlType == lib.TAB_GROUP;
            },
            listChanged: function(list)
            {
                if (list.added !== undefined)
                {
                    // If the element was dragged around and then put back on the same place, "controlRow" wouldn't be updated.
                    // The following code ensures that "controlRow" is always updated, even if nothing changes.
                    // Without it, subsequent "added" events involving this element won't be triggered.
                    let controlId = list.added.element.id;
                    let order = this.controls[controlId].order;
                    this.controls[controlId].order = -1;
                    this.controls[controlId].order = order;
                    this.$store.dispatch('addControl', { controlId: controlId, row: this.controlRow, index: list.added.newIndex, groupId: this.groupId });
                }
                else if (list.moved !== undefined)
                    this.$store.dispatch('moveControl', { controlId: list.moved.element.id, row: this.controlRow, oldIndex: list.moved.oldIndex, newIndex: list.moved.newIndex });
            }
        }
    }
</script>

<style scoped>
    .mesa-draggable
    {
        max-width: 100%;
        flex-grow: 1;
        align-items: stretch
    }

    .drag-ghost
    {
        opacity: 0.6 !important;
        z-index: 999999999 !important;
    }
</style>