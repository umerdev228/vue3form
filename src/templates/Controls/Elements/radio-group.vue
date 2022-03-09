<template>
    <div class="position-relative full-width">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div class="display-flex" style="flex-direction: column">
            <div v-for="(row, i) in options" class="display-flex" style="flex-direction: row">
                <label v-for="(opt, j) in row" class="i-radio i-radio__label mesa-radio font-14 margin-top-5" v-bind:style="{'margin-left': (j != 0 ? 12 : 0) + 'px'}">
                    {{opt}}
                    <input type="radio" name="radio" tabindex="-1" v-bind:checked="i == 0 && j == 0" disabled />
                    <span class="i-radio__field"></span>
                </label>
            </div>
        </div>
    </div>
</template>

<script>
    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} },
        computed: {
            options: function()
            {
                var rows = [];
                var columns = [];
                var count = 0;
                for (let i = 0; i < this.control.options.length; i++)
                {
                    columns.push(this.control.options[i]);
                    count++;
                    // When the last column of the current row is reached, starts a new one.
                    if (count == this.columns)
                    {
                        rows.push(columns);
                        columns = [];
                        count = 0;
                    }
                }
                if (columns.length > 0)
                    rows.push(columns);
                return rows;
            },
            columns: function()
            {
                var columns = this.control.columns;
                if (!isNaN(columns) && columns < 1)
                    columns = 1;
                return columns;
            }
        }
    }
</script>

<style scoped>
    .mesa-radio
    {
        padding-left: 28px;
    }
</style>