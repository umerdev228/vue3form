<template>
    <div class="position-relative full-width" style="overflow-x: auto">
        <mesa-label class="c-table__title" :control="control"></mesa-label>
        <table class="table c-table c-table--striped no-margin-bottom">
            <thead class="c-table__head">
                <tr>
                    <th v-for="col in control.columnValues" class="font-14">{{col.title}}</th>
                </tr>
            </thead>
            <tbody class="c-table__body">
                <tr v-for="rowix in control.lines" class="c-table__row">
                    <td v-for="col in control.columnValues" class="font-14">
                        <input type="text" class="form-control mesa-input i-text__field i-text font-14" tabindex="-1" v-bind:value="getCellText(col)" disabled />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
    import lib from '@/lib';

    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} },
        methods: {
            getCellText: function(control)
            {
                var text = lib.getPlaceholderText(control);
                return control.characters > 20 ? text.substring(0, 20) : text;
            }
        }
    }
</script>

<style scoped>
    .mesa-input
    {
        background-color: white !important;
        cursor: pointer !important;
        color: #607d8b !important;
    }
</style>