<template>
    <div class="font-14" v-bind:class="[align]">
        {{control.label}}
    </div>
</template>

<script>
    import Vuex from 'vuex';

    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} },
	    computed: {
            ...Vuex.mapState([
                'labelAlignments'
            ]),
		    align: function()
		    {
			    switch (this.control.labelAlign)
			    {
                    case this.labelAlignments.hidden: return 'no-label';
				    case this.labelAlignments.topLeft: return 'mesa-label-top-left';
				    case this.labelAlignments.topRight: return 'mesa-label-top-right';
                    case this.labelAlignments.topCenter: return 'mesa-label-top-center';
				    case this.labelAlignments.left: return 'mesa-label-left';
				    case this.labelAlignments.right: return 'mesa-label-right';
				    default: return '';
			    }
		    }
	    }
    }
</script>

<style scoped>
    .mesa-label-top-left
    {
        align-self: flex-start;
    }

    .mesa-label-top-right
    {
        align-self: flex-end;
    }

    .mesa-label-top-center
    {
        align-self: center;
    }

    .mesa-label-left
    {
        align-self: center;
        padding-right: 6px;
    }

    .mesa-label-right
    {
        align-self: center;
        padding-left: 6px;
    }

    .no-label
    {
        display: none;
    }
</style>