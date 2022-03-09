<template>
    <div class="position-relative">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div style="flex-grow: 1">
            <select data-style="btn dropdown-toggle b-icon-text--secondary i-select--secondary height-33" tabindex="-1" data-width="100%">
                <option v-for="option in control.options" v-bind:value="option" class="font-14">
                    {{ option }}
                </option>
            </select>
        </div>
    </div>
</template>

<script>
    export default
    {
        props: {
            control: Object
        },
        data: () => { return {} }
    }
</script>

<style scoped></style>