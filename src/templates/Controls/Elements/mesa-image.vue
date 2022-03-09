    <template>
    <div class="position-relative" style="min-height: 25px">
        <mesa-label class="i-text__label i-text" :control="control"></mesa-label>
        <div class="i-image mesa-img" v-bind:style="{'width': control.width + 'px', 'height': control.height + 'px'}">
            <svg version="1.1" id="image" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background: new 0 0 32 32" xml:space="preserve">
                <path id="picture" class="st0" d="M27.5,5h-23C3.7,5,3,5.7,3,6.5v19C3,26.3,3.7,27,4.5,27h23c0.8,0,1.5-0.7,1.5-1.5v-19
	                            C29,5.7,28.3,5,27.5,5z M26,18.5l-4.8-5.2c-0.4-0.4-1-0.4-1.4-0.1l0,0l-5.3,5.3l5.4,5.4H17l-4.8-4.8c-0.4-0.4-1-0.4-1.4,0L6,24V8h20
	                            V18.5z M8.1,12.5c0-1.3,1.1-2.4,2.4-2.4s2.4,1.1,2.4,2.4s-1.1,2.4-2.4,2.4l0,0C9.2,14.9,8.1,13.8,8.1,12.5z"></path>
            </svg>
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

<style scoped>
    .st0
    {
        fill: #D5DCE0;
    }

    .mesa-img
    {
        max-width: 100%;
    }
</style>