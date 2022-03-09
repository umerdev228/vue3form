<template>
    <div v-bind:id="control.id" class="mesa-control position-relative" v-bind:class="{'selected': isSelected, 'hovered': showMoveButton}" @mouseenter="mouseEnter" @mouseleave="mouseLeave" @mousemove="mouseMove">
        <component :is="control.view" :control="control" class="display-flex" v-bind:style="{'flex-direction': direction}"></component>
        <div>
            <div v-if="controlLayout < 2 && control.lineBreak">
                <i class="material-icons-round red position-absolute bottom-right item-small bold white-border">subdirectory_arrow_left</i>
            </div>
            <div v-else-if="(controlLayout == 0 || controlLayout == 2) && control.joined">
                <i class="material-icons-round green position-absolute bottom-right item-small bold white-border">arrow_forward</i>
            </div>
            <div v-else-if="control.wholeLine">
                <i class="material-icons-round blue position-absolute bottom-right item-small bold white-border" style="margin-right: 6px">arrow_back</i>
                <i class="material-icons-round blue position-absolute bottom-right item-small bold white-border">arrow_forward</i>
                <i class="material-icons-round blue position-absolute bottom-right item-small bold" style="margin-right: 6px">arrow_back</i>
                <i class="material-icons-round blue position-absolute bottom-right item-small bold">arrow_forward</i>
            </div>
        </div>
        <button v-show="canDrag" class="btn btn-light position-absolute top-right cursor-move transparent" v-bind:class="{'move-control': showMoveButton}" @mousedown="handleMovement" style="max-height: 100%">
            <i class="glyphicon glyphicon-move item-medium"></i>
        </button>
    </div>
</template>

<script>
    import Vuex from 'vuex';

    import lib from '@/lib';

    var wasDragging = false;

    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} },
        computed: {
            ...Vuex.mapState([
                'form',
                'controls',
                'selectedControls',
                'tabsLocked',
                'dragEnabled',
                'isSelecting',
                'isDragging',
                'changedByDrag',
                'draggedEl',
                'hovered',
                'labelAlignments'
            ]),
            isSelected: function()
            {
                return lib.containsControl(this.control.id, this.selectedControls);
            },
            showMoveButton: function()
            {
                return this.control.id == this.hovered;
            },
            canDrag: function()
            {
                return this.dragEnabled && !this.isSelecting && (!this.tabsLocked || !lib.hasTabContainer(this.controls, this.control.id, false));
            },
            direction: function()
            {
                return this.control.labelAlign == this.labelAlignments.left ? 'row' : this.control.labelAlign == this.labelAlignments.right ? 'row-reverse' : 'column';
            },
            controlLayout: function()
            {
                if (this.control.groupId == '')
                    return this.form.layout;
                else
                    return this.controls[this.control.groupId].layout;
            }
        },
        methods: {
            ...Vuex.mapActions([
                'clearSelection',
                'startSelecting',
                'updateSelection',
                'startDrag'
            ]),
            handleMovement: function(evt)
            {
                if (!this.isSelecting && !this.isDragging && evt.which == 1 && !evt.ctrlKey && !evt.metaKey)
                {
                    this.clearSelection();
                    this.updateSelection(this.control.id);
                    this.startDrag();
                    this.$store.commit('setDragged', this.control.id);
                    wasDragging = true;
                }
            },
            mouseEnter: function()
            {
                if (!this.isSelecting && !this.isDragging)
                {
                    if (this.draggedEl == null)
                        this.$store.commit('setHovered', this.control.id);
                    else
                        this.$store.commit('setHovered', this.draggedEl);
                    if (this.draggedEl == this.control.id)
                        this.$store.commit('setDragged', null);
                }
            },
            mouseLeave: function()
            {
                if (!this.isSelecting && !this.isDragging)
                {
                    this.$store.commit('setHovered', this.control.groupId);
                    if (!wasDragging || !this.changedByDrag)
                        this.$store.commit('setDragged', null);
                    wasDragging = false;
                }
            },
            mouseMove: function()
            {
                if (this.hovered != this.control.id)
                    this.$store.dispatch('hoverControl', this.control.id);
            }
        }
    }
</script>

<style scoped>
    .transparent
    {
        opacity: 0;
    }

    .mesa-control
    {
        border: 2px solid #e8e8e8;
        cursor: pointer;
        padding: 5px;
        margin: 2px;
    }

    .mesa-control.selected
    {
        background-color: #f6fff0 !important;
        border: 2px solid #008d0b !important;
    }

    .mesa-control.hovered
    {
        background-color: #def8ff !important;
        border: 2px solid #79bdff !important;
    }

    .move-control
    {
        border: 0.05em solid rgba(113, 115, 117, 0.5);
        padding: 3px 4px 0 5px !important;
        line-height: 1.36;
        opacity: 0.5;
    }

    .move-control:hover
    {
        opacity: 1 !important;
    }

    .move-control:active
    {
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5) !important;
        -moz-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5) !important;
        -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5) !important;
    }
</style>