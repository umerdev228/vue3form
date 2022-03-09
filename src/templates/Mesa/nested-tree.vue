<template>
    <div style="margin-left: -6px; margin-bottom: 5px">
        <h5 class="margin-bottom-10 margin-top-10 padding-left-12 bold">{{form.title}}</h5>
        <ul class="mesa-tree">
            <draggable-tree draggable ref="tree" :data="componentTree" @change="treeChange">
                <li slot-scope="{data, store}" class="tree-element tree-line no-padding">
                    <div :id="'branch-' + data.id" class="branch-element">
                        <span v-bind:class="{'hidden-node': !data.draggable}" class="tree-node-control" v-on:click.left.exact="selectControl(data.id)" v-on:click.ctrl.left.exact="updateSelection(data.id)" v-on:click.shift.left.exact="toggleOpen(store, data)">
                            <span v-bind:class="{'selected-node': data.selected, 'i-chip i-chip--primary': data.droppable, 'hovered': data.id == hovered}" class="tree-element font-14 white" @mouseenter="enterElement(data.id)" @mouseleave="leaveElement" >
                                <span v-if="data.droppable" class="tree-element">
                                    <i v-if="data.open" class="material-icons-round font-20">remove_circle</i>
                                    <i v-else class="material-icons-round font-20">add_circle</i>
                                </span>
                                <span v-else class="tree-element">
                                    <i class="material-icons-round font-20">{{data.icon}}</i>
                                </span>
                                &nbsp;
                                <span class="tree-node-text">{{data.nodeName}}</span>
                            </span>
                        </span>
                    </div>
                </li>
            </draggable-tree>
        </ul>
    </div>
</template>

<script>
    import { DraggableTree } from 'vue-draggable-nested-tree';
    import Vuex from 'vuex';

    import lib from '@/lib';

    export default
    {
        components: { DraggableTree },
        data: () => { return {} },
        computed: {
            ...Vuex.mapState([
                'form',
                'controls',
                'selectedControls',
                'hovered'
            ]),
            ...Vuex.mapGetters([
                'componentTree'
            ])
        },
        methods: {
            treeChange: function(node, targetTree)
            {
                var control = this.controls[node.id];
                var group = this.controls[node.parent.id];
                this.$store.dispatch('changeTree', { control, group, tree: targetTree.getPureData() });
            },
            selectControl: function(controlId)
            {
                this.$store.dispatch('clearSelection');
                this.$store.dispatch('selectControl', controlId);
                lib.scrollToElement(this.controls, controlId, false, true);
                $(document).ready(function()
                {
                    lib.animateElement('#' + controlId, 'pulse');
                });
            },
            updateSelection: function(controlId)
            {
                this.$store.dispatch('updateSelectionFromTree', controlId);
            },
            toggleOpen: function(tree, data)
            {
                this.$store.commit('toggleDroppable', { id: data.id, value: !data.open });
                tree.toggleOpen(data);
            },
            enterElement: function(controlId)
            {
                this.$store.commit('setHovered', controlId);
            },
            leaveElement: function()
            {
                this.$store.commit('setHovered', null);
            }
        },
        updated: function()
        {
            $('select').selectpicker();
        }
    }
</script>

<style scoped>
    .tree-line
    {
        margin-right: 6px !important;
    }

    .tree-element
    {
        vertical-align: middle;
        display: inline-flex;
        align-items: center;
    }

    .tree-node-control
    {
        cursor: pointer;
    }

    .tree-node-text
    {
        font-weight: normal;
    }

    .tree-element.hovered
    {
        text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    }

    .tree-element.hovered > .tree-node-text
    {
        font-style: italic;
        font-weight: bold;
    }

    .selected-node
    {
        text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
        color: #ccffbb !important;
    }

    .selected-node > .tree-node-text
    {
        font-weight: bold;
    }

    .hidden-node span
    {
        color: rgba(255, 255, 255, 0.4) !important;
    }
</style>