import Vue from 'vue';

import VueDraggableResizable from 'vue-draggable-resizable';
import Notifications from 'vue-notification';
import VueShortcuts from 'vue-shortcuts';
import Fullscreen from 'vue-fullscreen';
import Vue2Storage from 'vue2-storage';
import VueHead from 'vue-head';
import Axios from 'axios';
import VueAxios from 'vue-axios';

import Editor from '@/templates/editor.vue';

import FormFieldList from '@/templates/Mesa/form-field-list.vue';
import MesaDraggable from '@/templates/Mesa/mesa-draggable.vue';
import MesaControl from '@/templates/Mesa/mesa-control.vue';
import NestedTree from '@/templates/Mesa/nested-tree.vue';
import ConfigMenu from '@/templates/Mesa/config-menu.vue';
import MesaForm from '@/templates/Mesa/mesa-form.vue';

import CollapsibleGroupbox from '@/templates/Controls/Containers/collapsible-groupbox.vue';
import Accordion from '@/templates/Controls/Containers/accordion.vue';
import TabGroup from '@/templates/Controls/Containers/tab-group.vue';
import Groupbox from '@/templates/Controls/Containers/groupbox.vue';
import Tab from '@/templates/Controls/Containers/tab.vue';

import SelectableList from '@/templates/Controls/Elements/selectable-list.vue';
import EditableList from '@/templates/Controls/Elements/editable-list.vue';
import LookupButton from '@/templates/Controls/Elements/lookup-button.vue';
import RadioGroup from '@/templates/Controls/Elements/radio-group.vue';
import StaticText from '@/templates/Controls/Elements/static-text.vue';
import Textfield from '@/templates/Controls/Elements/mesa-textfield.vue';
import ValueList from '@/templates/Controls/Elements/value-list.vue';
import MesaLabel from '@/templates/Controls/Elements/mesa-label.vue';
import Textarea from '@/templates/Controls/Elements/mesa-textarea.vue';
import Dropdown from '@/templates/Controls/Elements/dropdown.vue';
import Checkbox from '@/templates/Controls/Elements/checkbox.vue';
import Document from '@/templates/Controls/Elements/document.vue';
import MesaDate from '@/templates/Controls/Elements/date.vue';
import Button from '@/templates/Controls/Elements/mesa-button.vue';
import Lookup from '@/templates/Controls/Elements/lookup.vue';
import Image from '@/templates/Controls/Elements/mesa-image.vue';
import List from '@/templates/Controls/Elements/list.vue';

import store from '@/store';

//------------------------
// Vue components
//------------------------

Vue.component('vue-draggable-resizable', VueDraggableResizable);
Vue.use(VueShortcuts, { prevent: ['input'] });
Vue.use(VueAxios, Axios);
Vue.use(Notifications);
Vue.use(Vue2Storage);
Vue.use(Fullscreen);
Vue.use(VueHead);
//
// //------------------------
// // Custom components
// //------------------------
//
// Vue.component('collapsible-groupbox', CollapsibleGroupbox);
// Vue.component('selectable-list', SelectableList);
// Vue.component('form-field-list', FormFieldList);
// Vue.component('mesa-draggable', MesaDraggable);
// Vue.component('editable-list', EditableList);
// Vue.component('lookup-button', LookupButton);
// Vue.component('mesa-control', MesaControl);
// Vue.component('mesa-textfield', Textfield);
// Vue.component('radio-group', RadioGroup);
// Vue.component('static-text', StaticText);
// Vue.component('config-menu', ConfigMenu);
// Vue.component('nested-tree', NestedTree);
// Vue.component('mesa-textarea', Textarea);
// Vue.component('value-list', ValueList);
// Vue.component('mesa-label', MesaLabel);
// Vue.component('accordion', Accordion);
// Vue.component('mesa-button', Button);
// Vue.component('mesa-form', MesaForm);
// Vue.component('tab-group', TabGroup);
// Vue.component('checkbox', Checkbox);
// Vue.component('document', Document);
// Vue.component('dropdown', Dropdown);
// Vue.component('groupbox', Groupbox);
// Vue.component('mesa-image', Image);
// Vue.component('lookup', Lookup);
// Vue.component('date', MesaDate);
// Vue.component('list', List);
// Vue.component('tab', Tab);

//------------------------
// App init
//------------------------

// new Vue({
//     el: '#mesa',
//     components: { Editor },
//     store,
//     template: '<Editor />'
// });


// Vue 3 syntax

const app = Vue.createApp({
    // options object
    el: '#mesa',
    components: { Editor },
    store,
    template: '<Editor />'
})
app.mounth('#mesa') // Vue Instance - Root component

//------------------------
// Custom components
//------------------------
app.component('collapsible-groupbox', {CollapsibleGroupbox})
app.component('selectable-list', {SelectableList})
app.component('form-field-list', {FormFieldList})
app.component('mesa-draggable', {MesaDraggable})
app.component('editable-list', {EditableList})
app.component('lookup-button', {LookupButton})
app.component('mesa-control', {MesaControl})
app.component('mesa-textfield', {Textfield})
app.component('radio-group', {RadioGroup})
app.component('static-text', {StaticText})
app.component('config-menu', {ConfigMenu})
app.component('nested-tree', {NestedTree})
app.component('mesa-textarea', {Textarea})
app.component('value-list', {ValueList})
app.component('mesa-label', {MesaLabel})
app.component('accordion', {Accordion})
app.component('mesa-button', {Button})
app.component('mesa-form', {MesaForm})
app.component('tab-group', {TabGroup})
app.component('checkbox', {Checkbox})
app.component('document', {Document})
app.component('dropdown', {Dropdown})
app.component('groupbox', {Groupbox})
app.component('mesa-image', {Image})
app.component('lookup', {Lookup})
app.component('date', {MesaDate})
app.component('list', {List})
app.component('tab', {Tab})

Vue.component('collapsible-groupbox', CollapsibleGroupbox);
Vue.component('selectable-list', SelectableList);
Vue.component('form-field-list', FormFieldList);
Vue.component('mesa-draggable', MesaDraggable);
Vue.component('editable-list', EditableList);
Vue.component('lookup-button', LookupButton);
Vue.component('mesa-control', MesaControl);
Vue.component('mesa-textfield', Textfield);
Vue.component('radio-group', RadioGroup);
Vue.component('static-text', StaticText);
Vue.component('config-menu', ConfigMenu);
Vue.component('nested-tree', NestedTree);
Vue.component('mesa-textarea', Textarea);
Vue.component('value-list', ValueList);
Vue.component('mesa-label', MesaLabel);
Vue.component('accordion', Accordion);
Vue.component('mesa-button', Button);
Vue.component('mesa-form', MesaForm);
Vue.component('tab-group', TabGroup);
Vue.component('checkbox', Checkbox);
Vue.component('document', Document);
Vue.component('dropdown', Dropdown);
Vue.component('groupbox', Groupbox);
Vue.component('mesa-image', Image);
Vue.component('lookup', Lookup);
Vue.component('date', MesaDate);
Vue.component('list', List);
Vue.component('tab', Tab);
