<template>
    <div style="flex-grow: 1">
        <h4 v-if="!isGroup">{{form.title}}</h4>
        <div v-if="children.length == 0" v-bind:class="{'padding-bottom-10': !isGroup}" class="flex-container">
            <div class="mesa-row-group fixed-row-group">
                <div class="mesa-join-group" style="flex-grow: 1">
                    <mesa-draggable class="mesa-join-group" :control-row="[]" :group-id="groupId" :alignment-type="alignmentType" :max-width="maxWidth" :layout="layout"></mesa-draggable>
                </div>
            </div>
        </div>
        <div v-else-if="layout != 1" v-bind:class="{'padding-bottom-10': !isGroup}" class="flex-container">
            <div v-for="row in controlRows" class="mesa-row-group fixed-row-group" v-bind:style="{'justify-content': alignmentType}">
                <div v-for="(join, index) in row" class="mesa-join-group" v-bind:style="{'flex-grow': growElement(index, row), 'align-items': 'stretch', 'max-width': '100%'}">
                    <mesa-draggable class="mesa-join-group" :control-row="join" :group-id="groupId" :alignment-type="alignmentType" :max-width="maxWidth" :layout="layout"></mesa-draggable>
                </div>
            </div>
        </div>
        <div v-else v-bind:class="{'padding-bottom-10': !isGroup}" class="flex-container">
            <div v-for="row in controlRows" class="mesa-row-group fixed-row-group">
                <div v-for="(join, index) in row" class="mesa-join-group" style="flex-grow: 1; align-items: stretch; max-width: 100%">
                    <mesa-draggable class="mesa-join-group" :control-row="join" :group-id="groupId" :alignment-type="alignmentType" :max-width="maxWidth" :layout="layout"></mesa-draggable>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Vuex from 'vuex';

    import lib from '@/lib';

    function buildFlowLayout(children)
    {
        var res = [];
        var currentRow = [];
        var currentJoin = [];
        children.forEach(function(element)
        {
            currentJoin.push(element);
            if (element.wholeLine || element.ctrlType == lib.TAB_GROUP)
            {
                if (currentRow.length > 0)
                    res.push(currentRow);
                currentRow = [];
                currentRow.push(currentJoin);
                res.push(currentRow);
                currentRow = [];
                currentJoin = [];
            }
            // When it's on a line break, ends this row and starts a new one.
            else if (element.lineBreak)
            {
                currentRow.push(currentJoin);
                res.push(currentRow);
                currentRow = [];
                currentJoin = [];
            }
            else if (!element.joined)
            {
                currentRow.push(currentJoin);
                currentJoin = [];
            }
        });
        // If there is a pending row, adds it to the result.
        if (currentJoin.length > 0)
            currentRow.push(currentJoin);
        if (currentRow.length > 0)
            res.push(currentRow);
        return res;
    }

    function buildGridLayout(children, columns)
    {
        var res = [];
        var currentRow = [];
        var currentJoin = [];
        var currentColumns = 0;
        children.forEach(function(element)
        {
            currentJoin.push(element);
            if (currentColumns == columns - 1 || element.lineBreak)
            {
                currentRow.push(currentJoin);
                res.push(currentRow);
                currentRow = [];
                currentJoin = [];
                currentColumns = 0;
            }
            else
                currentColumns++;
        });
        if (currentJoin.length > 0)
            currentRow.push(currentJoin);
        if (currentRow.length > 0)
            res.push(currentRow);
        return res;
    }

    function buildListLayout(children)
    {
        var res = [];
        var currentRow = [];
        var currentJoin = [];
        children.forEach(function(element)
        {
            currentJoin.push(element);
            if (element.wholeLine || element.ctrlType == lib.TAB_GROUP)
            {
                if (currentRow.length > 0)
                    res.push(currentRow);
                currentRow = [];
                currentRow.push(currentJoin);
                res.push(currentRow);
                currentRow = [];
                currentJoin = [];
            }
            else if (!element.joined)
            {
                currentRow.push(currentJoin);
                res.push(currentRow);
                currentRow = [];
                currentJoin = [];
            }
        });
        if (currentJoin.length > 0)
            currentRow.push(currentJoin);
        if (currentRow.length > 0)
            res.push(currentRow);
        return res;
    }

    export default
    {
        props: {
            group: Object
        },
        data: () => {
            return {
                children: []
            }
        },
        computed: {
            ...Vuex.mapState([
                'form',
                'controls',
            ]),
            ...Vuex.mapGetters([
                'groupChildren'
            ]),
            isGroup: function()
            {
                return this.group !== undefined;
            },
            groupId: function()
            {
                return this.isGroup ? this.group.id : '';
            },
            layout: function()
            {
                if (this.isGroup)
                    return this.controls[this.groupId].layout;
                else
                    return this.form.layout;
            },
            alignmentType: function()
            {
                var alignment = 0;
                var groupId = this.groupId;
                while (alignment == 0)
                {
                    if (groupId == '')
                    {
                        alignment = this.form.childAlign;
                        break;
                    }
                    else
                    {
                        alignment = this.controls[groupId].childAlign;
                        groupId = this.controls[groupId].groupId;
                    }
                }
                if (alignment == 2)
                    return 'flex-end';
                else if (alignment == 3)
                    return 'center';
                else if (alignment == 4 && this.layout != 1)
                    return 'space-between';
                else
                    return 'flex-start';
            },
            columns: function()
            {
                var columns = this.isGroup ? this.group.columns : this.form.columns;
                return columns < 1 ? 1 : columns;
            },
            maxWidth: function()
            {
                var full = 100;
                return (this.layout != 1 ? full : full / this.columns) + '%';
            },
            controlRows: {
                set: function() {},
                get: function()
                {
                    if (this.layout == 0)
                        return buildFlowLayout(this.children);
                    else if (this.layout == 1)
                        return buildGridLayout(this.children, this.columns);
                    else if (this.layout == 2)
                        return buildListLayout(this.children);
                }
            }
        },
        methods: {
            updateChildren: function(data)
            {
                this.children = data;
            },
            growElement: function(index, row)
            {
                if (row[index][0].wholeLine || row[index][0].ctrlType == lib.TAB_GROUP)
                    return 1;
                else if (this.alignmentType == 'flex-start')
                    return index == row.length - 1 ? 1 : 0;
                else if (this.alignmentType == 'flex-end')
                    return index == 0 ? 1 : 0;
                else
                    return 0;
            }
        },
        watch: {
            groupChildren: function()
            {
                this.children = this.groupChildren[this.groupId];
            }
        },
        created: function()
        {
            this.children = this.groupChildren[this.groupId];
        },
        updated: function()
        {
            lib.arrangeFlowLayout();
        }
    }
</script>

<style scoped></style>