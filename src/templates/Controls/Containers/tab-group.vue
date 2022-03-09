<template>
    <div>
        <nav>
            <div class="nav nav-tabs c-tab c-tab__divider" role="tablist">
                <tab v-for="(child, i) in children" v-show="!child.hidden" v-bind:id="child.id" :control="child" :is-header="true" :index="i" :key="child.id + i"></tab>
            </div>
        </nav>
        <div class="tab-content c-tab__item-container" style="min-height: 26px">
            <tab v-for="(child, i) in children" v-show="!child.hidden" :control="child" :is-header="false" :index="i" :key="child.id + i"></tab>
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
            }
        }
    }
</script>

<style scoped></style>