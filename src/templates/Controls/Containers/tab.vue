<template>
    <a v-if="isHeader" :id="headerId" class="nav-item c-tab__item nav-link c-tab__item-header" v-bind:class="{'active show': index == 0}" href="#" :data-target="'#' + contentId" data-toggle="tab" role="tab" :aria-controls="contentId" v-bind:aria-selected="index == 0">
        <div class="font-14">
            {{control.label}}
        </div>
    </a>
    <div v-else :id="contentId" class="tab-pane c-tab__item-content fade" v-bind:class="{'active show': index == 0}" role="tabpanel" :aria-labelledby="headerId">
        <mesa-form :group="control"></mesa-form>
    </div>
</template>

<script>
    export default
    {
        props: {
            control: Object,
            isHeader: Boolean,
            index: Number
        },
        data: () => { return {} },
        computed: {
            headerId: function()
            {
                return 'tab-header' + this.control.id;
            },
            contentId: function()
            {
                return 'tab-content' + this.control.id;
            }
        }
    }
</script>

<style scoped>
    a:not(.active):not(:hover)
    {
        background-color: silver;
    }
</style>