<template>
    <vue-draggable-resizable class="mesa-properties-container padding-top-60" :draggable="false" :resizable="!menuLocked" :handles="handles" :w="dimensions.width" :h="dimensions.height" :min-width="dimensions.min" :max-width="dimensions.max" class-name-handle="menu-handle" @resizing="resize">
        <div slot="mr">
            <i class="fa fa-angle-double-right item-medium bold"></i>
        </div>
        <div slot="ml">
            <i class="fa fa-angle-double-left item-medium bold"></i>
        </div>
        <div class="mesa-properties background-metal-reversed white">
            <div class="mesa-properties-content">
                <nav>
                    <div class="nav-tab nav nav-tabs" role="tablist">
                        <a v-if="showMenu1" id="nav-properties-tab" v-bind:class="{'menu-title': separatedMenus > 0, 'tab-title': separatedMenus == 0, 'active': showMenu1}" class="nav-item nav-link wrap-text overflow-hidden" data-toggle="tab" href=".nav-properties" role="tab" aria-controls="nav-properties" aria-selected="false" style="line-height: 1.5">
                            {{lang.keywords.properties}}
                        </a>
                        <a v-if="showMenu2" id="nav-tree-tab" v-bind:class="{'menu-title': separatedMenus > 0, 'tab-title': separatedMenus == 0, 'active': showMenu2 && separatedMenus > 0}" class="nav-item nav-link wrap-text overflow-hidden" data-toggle="tab" href=".nav-tree" role="tab" aria-controls="nav-tree" aria-selected="false" style="line-height: 1.5">
                            {{lang.keywords.el_tree}}
                        </a>
                    </div>
                </nav>
                <div class="nav-tab-content tab-content" v-bind:style="{'height': (viewportHeight - (separatedMenus == 0 ? 107 : 106)) + 'px'}">
                    <div v-if="showMenu1" id="properties-menu" class="nav-properties tab-pane custom-scrollbar fade show active" role="tabpanel" aria-labelledby="nav-properties-tab" v-bind:style="{'max-height': viewportHeight - 107 + 'px', 'width': dimensions.width}">
                        <div class="w-100 margin-top-5"></div>
                        <div class="row no-gutters adapt-font margin-bottom-10 padding-top-6 padding-right-6 padding-left-6">
                            {{lang.keywords.selected_number}}:&nbsp<b>{{selectionSize}}</b>
                        </div>
                        <!-- SOME ELEMENTS ARE SELECTED -->
                        <div v-if="selectionSize >= 1" class="container no-padding padding-right-6 padding-bottom-6 padding-left-6">
                            <div v-if="selectionSize == 1" class="row align-items-center no-gutters prop-row">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.position}}</span>
                                </div>
                                <div class="col-8 padding-left-3">
                                    <button class="btn btn-light custom-padding" @click="selectedUp" v-bind:disabled="getPrevious == null || isHidden || !isEditable">
                                        <i class="glyphicon glyphicon-arrow-up item-small"></i>
                                    </button>
                                    <button class="btn btn-light custom-padding" @click="selectedDown" v-bind:disabled="getNext == null || isHidden || !isEditable">
                                        <i class="glyphicon glyphicon-arrow-down item-small"></i>
                                    </button>
                                </div>
                            </div>
                            <div v-if="selectionSize == 1" class="row align-items-center no-gutters prop-row margin-top-4">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.order}}</span>
                                </div>
                                <div class="col-8 wrap-text padding-left-3">
                                    <input type="number" class="form-control no-shadow black no-border" v-model.number.lazy="selectedOrder" style="padding: 8px !important" v-bind:disabled="!isEditable" />
                                </div>
                            </div>
                            <div class="row align-items-center no-gutters prop-row margin-top-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.group}}</span>
                                </div>
                                <div class="col-8 relative-position padding-left-3">
                                    <div :key="lang.language + selectedGroup + groupStateId + isEditable">
                                        <select class="selectpicker full-width" v-model="selectedGroup" :data-live-search="groupNumber > 6" data-width="100%" data-size="6" data-style="background-white" v-bind:disabled="!isEditable">
                                            <option value="" class="font-14">{{lang.keywords.main_form}}</option>
                                            <option v-for="group in groupList" v-bind:selected="group.id == selectedGroup" v-bind:value="group.id" class="font-14">{{group.field}}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div v-if="showLayoutChoice" class="row align-items-center no-gutters prop-row margin-top-4">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.set_layout}}</span>
                                </div>
                                <div class="col-8 relative-position padding-left-3">
                                    <div :key="lang.language + 'layout' + selectedLayout + isEditableSelf">
                                        <select class="selectpicker full-width" v-model="selectedLayout" data-width="100%" data-style="background-white" v-bind:disabled="!isEditableSelf">
                                            <option v-for="(l, i) in lang.keywords.layout_types" v-bind:value="i" v-bind:selected="i == selectedLayout" class="font-14">{{l}}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div v-if="showLayoutChoice && selectedLayout == 1 || isRadio" class="row align-items-center no-gutters prop-row margin-top-4 margin-bottom-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.columns}}</span>
                                </div>
                                <div class="col-8 padding-left-3">
                                    <input type="number" class="form-control no-shadow black no-border" v-model.lazy="selectedColumns" style="padding: 8px !important" v-bind:disabled="!isEditable" />
                                </div>
                            </div>
                            <div v-if="showLayoutChoice" class="row align-items-center no-gutters prop-row margin-top-4">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.set_alignment}}</span>
                                </div>
                                <div class="col-8 relative-position padding-left-3">
                                    <div :key="lang.language + 'align' + selectedAlignment + selectedLayout + isEditableSelf + controlTypes">
                                        <select class="selectpicker full-width" v-model="selectedAlignment" data-width="100%" data-style="background-white" v-bind:disabled="!isEditableSelf">
                                            <option v-for="(a, i) in lang.keywords.alignment_types" v-if="showAlignmentOption(i)" v-bind:value="i" v-bind:selected="i == selectedAlignment" class="font-14">{{a}}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div v-if="maxCharacters !== undefined" class="row align-items-center no-gutters prop-row margin-top-4 margin-bottom-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.characters}}</span>
                                </div>
                                <div class="col-8 padding-left-3">
                                    <input type="number" class="form-control no-shadow black no-border" v-model.lazy="maxCharacters" style="padding: 8px !important" v-bind:disabled="!isEditable" />
                                </div>
                            </div>
                            <div v-if="labelText !== undefined" class="row align-items-center no-gutters prop-row margin-top-4 margin-bottom-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.label}}</span>
                                </div>
                                <div class="col-8 padding-left-3">
                                    <input type="text" class="form-control no-shadow black no-border" v-bind:value="labelText" @keydown="setLabelText" style="padding: 8px !important" v-bind:disabled="!isEditable" />
                                </div>
                            </div>
                            <div v-if="labelAlignment !== undefined" class="row align-items-center no-gutters prop-row margin-top-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.label_align}}</span>
                                </div>
                                <div class="col-8 relative-position padding-left-3">
                                    <div :key="lang.language + labelOptions.selected + isEditable">
                                        <select class="selectpicker full-width" v-model="labelOptions.selected" @change="setLabelAlignments" data-width="100%" data-style="background-white" v-bind:disabled="!isEditable">
                                            <option v-for="l in labelOptions.options" v-bind:value="l.id" v-bind:selected="l.id == labelAlignment" class="font-14">{{l.label}}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div v-if="lineNumber !== undefined" class="row align-items-center no-gutters prop-row margin-top-4 margin-bottom-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.lines}}</span>
                                </div>
                                <div class="col-8 padding-left-3">
                                    <input type="number" class="form-control no-shadow black no-border" v-model.lazy="lineNumber" style="padding: 8px !important" v-bind:disabled="!isEditable" />
                                </div>
                            </div>
                            <div v-if="areaWidth !== undefined" class="row align-items-center no-gutters prop-row margin-top-4 margin-bottom-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.image_width}}</span>
                                </div>
                                <div class="col-8 padding-left-3">
                                    <input type="number" class="form-control no-shadow black no-border" v-model.lazy="areaWidth" style="padding: 8px !important" v-bind:disabled="!isEditable" />
                                </div>
                            </div>
                            <div v-if="areaHeight !== undefined" class="row align-items-center no-gutters prop-row margin-top-4 margin-bottom-5">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.image_height}}</span>
                                </div>
                                <div class="col-8 padding-left-3">
                                    <input type="number" class="form-control no-shadow black no-border" v-model.lazy="areaHeight" style="padding: 8px !important" v-bind:disabled="!isEditable" />
                                </div>
                            </div>
                            <div v-if="selectionSize == 1" class="row align-items-center no-gutters prop-row margin-top-4">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.id}}</span>
                                </div>
                                <div class="col-8 wrap-text padding-left-3">
                                    <span>{{currentControl.tableName + '.' + currentControl.field}}</span>
                                </div>
                            </div>
                            <div v-if="controlTypes != ''" class="row align-items-center no-gutters prop-row margin-top-2">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.control_type}}</span>
                                </div>
                                <div class="col-8 wrap-text padding-left-3">
                                    <span>{{controlTypes}}</span>
                                </div>
                            </div>
                            <div v-if="dataTypes != ''" class="row align-items-center no-gutters prop-row margin-top-2">
                                <div class="col-4 wrap-text adapt-font">
                                    <span>{{lang.keywords.data_type}}</span>
                                </div>
                                <div class="col-8 wrap-text padding-left-3">
                                    <span>{{dataTypes}}</span>
                                </div>
                            </div>
                            <div class="row align-items-center no-gutters prop-row margin-top-4">
                                <div class="col-6 wrap-text adapt-font">
                                    <span>{{lang.keywords.is_hidden}}</span>
                                </div>
                                <div class="col-6 padding-left-3">
                                    <label class="switch">
                                        <input id="control-hide" type="checkbox" name="hide-option" v-model="isHidden" @click="toggleVisibility" v-bind:disabled="!isEditable" />
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            <div v-if="isGroup" class="row align-items-center no-gutters prop-row margin-top-2">
                                <div class="col-6 wrap-text adapt-font">
                                    <span>{{lang.keywords.is_collapsible}}</span>
                                </div>
                                <div class="col-6 padding-left-3">
                                    <label class="switch">
                                        <input id="control-collapse" type="checkbox" name="collapse-option" v-model="isCollapsible" @click="toggleCollapsibility" v-bind:disabled="!isEditable" />
                                        <span class="slider round"></span>
                                    </label>
                                </div>
                            </div>
                            <div v-if="htmlText !== undefined" class="row align-items-center no-gutters margin-top-8">
                                <div class="col-12 wrap-text adapt-font">
                                    <span>{{lang.keywords.static_text}}</span>
                                </div>
                                <div class="col-12 margin-top-1">
                                    <textarea class="full-width" rows="4" v-bind:value="htmlText" @keydown="setHtmlText" v-bind:disabled="!isEditable"></textarea>
                                </div>
                            </div>
                            <fieldset v-if="layoutType >= 0" class="row no-gutters no-margin margin-top-7 padding-right-6 padding-left-6 no-padding-top no-padding-bottom">
                                <legend class="no-margin auto-width display-table adapt-font">{{lang.keywords.layout_rules}}: <b>{{lang.keywords.layout_types[layoutType]}}</b></legend>
                                <div class="full-width">
                                    <div v-if="layoutType < 2" class="row align-items-center no-gutters prop-row margin-top-2">
                                        <div class="col-6 wrap-text adapt-font">
                                            <span>{{lang.keywords.line_break}}</span>
                                        </div>
                                        <div class="col-6 padding-left-3">
                                            <label class="switch">
                                                <input id="line-break" type="checkbox" name="format-option" v-model="existsBreak" @click="breakLine" v-bind:disabled="!isEditable" />
                                                <span class="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div v-if="layoutType != 1" class="row align-items-center no-gutters prop-row margin-top-2">
                                        <div class="col-6 wrap-text adapt-font">
                                            <span>{{lang.keywords.joined}}</span>
                                        </div>
                                        <div class="col-6 padding-left-3">
                                            <label class="switch">
                                                <input id="joined" type="checkbox" name="format-option" v-model="existsJoin" @click="joinLine" v-bind:disabled="!isEditable" />
                                                <span class="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="row align-items-center no-gutters prop-row margin-top-2 margin-bottom-2">
                                        <div class="col-6 wrap-text adapt-font">
                                            <span>{{lang.keywords.whole_line}}</span>
                                        </div>
                                        <div class="col-6 padding-left-3">
                                            <label class="switch">
                                                <input id="whole-line" type="checkbox" name="format-option" v-model="existsWholeLine" @click="fillLine" v-bind:disabled="!isEditable" />
                                                <span class="slider round"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>
                            <div class="w-100 margin-top-5"></div>
                        </div>
                        <!-- NO ELEMENTS ARE SELECTED -->
                        <div v-else>
                            <div class="container padding-left-6 padding-right-6 padding-bottom-4 border-bottom-1">
                                <div class="row align-items-center no-gutters prop-row">
                                    <div class="col-4 wrap-text adapt-font">
                                        <span>{{lang.keywords.set_layout}}</span>
                                    </div>
                                    <div class="col-8 relative-position padding-left-3">
                                        <div :key="'form-layout' + lang.language + formLayout">
                                            <select class="selectpicker full-width" v-model="formLayout" data-width="100%" data-style="background-white">
                                                <option v-for="(l, i) in lang.keywords.layout_types" v-bind:value="i" v-bind:selected="i == formLayout" class="font-14">{{l}}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="formLayout == 1" class="row align-items-center no-gutters prop-row margin-top-4 margin-bottom-5">
                                    <div class="col-4 wrap-text adapt-font">
                                        <span>{{lang.keywords.columns}}</span>
                                    </div>
                                    <div class="col-8 padding-left-3">
                                        <input type="number" class="form-control no-shadow black no-border" v-model.lazy="formColumns" style="padding: 8px !important" />
                                    </div>
                                </div>
                                <div class="row align-items-center no-gutters prop-row margin-top-4">
                                    <div class="col-4 wrap-text adapt-font">
                                        <span>{{lang.keywords.set_alignment}}</span>
                                    </div>
                                    <div class="col-8 relative-position padding-left-3">
                                        <div :key="'form-align' + lang.language + formAlignment + formLayout">
                                            <select class="selectpicker full-width" v-model="formAlignment" data-width="100%" data-style="background-white">
                                                <option v-for="(a, i) in lang.keywords.alignment_types" v-if="i > 0 && (i < 4 || formLayout != 1)" v-bind:value="i" v-bind:selected="i == formAlignment" class="font-14">{{a}}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row align-items-center no-gutters prop-row margin-top-2">
                                    <div class="col-4 wrap-text adapt-font">
                                        <span>{{lang.keywords.id}}</span>
                                    </div>
                                    <div class="col-8 wrap-text padding-left-3">
                                        <span>{{form.id}}</span>
                                    </div>
                                </div>
                                <div class="row align-items-center no-gutters prop-row margin-top-2">
                                    <div class="col-4 wrap-text adapt-font">
                                        <span>{{lang.keywords.title}}</span>
                                    </div>
                                    <div class="col-8 padding-left-3">
                                        <input type="text" class="form-control no-shadow black no-border" v-bind:value="form.title" @keydown="setFormTitle" style="padding: 8px !important" />
                                    </div>
                                </div>
                                <div class="row align-items-center no-gutters prop-row margin-top-2">
                                    <div class="col-4 wrap-text adapt-font">
                                        <span>{{lang.keywords.area}}</span>
                                    </div>
                                    <div class="col-8 wrap-text padding-left-3">
                                        <span>{{form.area}}</span>
                                    </div>
                                </div>
                            </div>
                            <form-field-list></form-field-list>
                        </div>
                    </div>
                    <div v-if="showMenu2" id="elements-tree" v-bind:class="{'show active': showMenu2 && separatedMenus > 0}" class="nav-tree tab-pane fade" role="tabpanel" aria-labelledby="nav-tree-tab">
                        <div id="search-container" class="relative-position full-width margin-top-10 padding-bottom-10 padding-left-6 padding-right-6 border-bottom-1">
                            <input id="search-bar" class="form-control full-width height-33 no-shadow black" type="text" :placeholder="lang.keywords.search" style="padding: 8px 8px 8px 28px !important" />
                        </div>
                        <div class="custom-scrollbar padding-right-6" v-bind:style="{'max-height': (viewportHeight - (separatedMenus == 0 ? 162 : 161)) + 'px'}">
                            <nested-tree></nested-tree>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </vue-draggable-resizable>
</template>

<script>
    import VueDraggableResizable from 'vue-draggable-resizable';
    import Vuex from 'vuex';

    import lib from '@/lib';

    export default
    {
        props: {
            viewportHeight: Number,
            dimensions: Object,
            resize: Function,
            leftSide: Boolean
        },
        components: {
            'vue-draggable-resizable': VueDraggableResizable
        },
        data: () => { return {} },
        computed: {
            ...Vuex.mapState([
                'lang',
                'form',
                'controls',
                'selectedControls',
                'menuLocked',
                'tabsLocked',
                'groupStateId',
                'separatedMenus'
            ]),
            ...Vuex.mapGetters([
                'controlTypes',
                'dataTypes',
                'selectionSize',
                'getPrevious',
                'getNext',
                'labelOptions',
                'layoutType',
                'isEditable',
                'isEditableSelf',
                'labelText'
            ]),
            currentControl: function()
            {
                if (this.selectionSize == 1)
                    return this.controls[Object.keys(this.selectedControls)[0]];
                else
                    return null;
            },
            groupList: function()
            {
                var groups = [];
                for (let i in this.$store.getters.groupList)
                    groups.push(this.controls[i]);
                return groups.sort(function(a, b) { return a.field > b.field ? 1 : -1; });
            },
            isRadio: function()
            {
                return this.controlTypes == lib.RADIO_GROUP;
            },
            isGroup: function()
            {
                return this.controlTypes == lib.GROUPBOX;
            },
            groupNumber: function()
            {
                return Object.keys(this.groupList).length;
            },
            showMenu1: function()
            {
                return this.separatedMenus == 0 || this.separatedMenus == 1 && this.leftSide || this.separatedMenus == 2 && !this.leftSide;
            },
            showMenu2: function()
            {
                return this.separatedMenus == 0 || this.separatedMenus == 2 && this.leftSide || this.separatedMenus == 1 && !this.leftSide;
            },
            handles: function()
            {
                var handles = [];
                if (this.leftSide)
                    handles.push('mr');
                else
                    handles.push('ml');
                return handles;
            },
            showLayoutChoice: function()
            {
                for (let i in this.selectedControls)
                    if (this.controls[i].ctrlType != lib.GROUPBOX && this.controls[i].ctrlType != lib.TAB)
                        return false;
                return true;
            },
            isHidden: {
                set: function() {},
                get: function()
                {
                    return this.$store.getters.isHidden;
                }
            },
            isCollapsible: {
                set: function() {},
                get: function()
                {
                    return this.$store.getters.isCollapsible;
                }
            },
            existsWholeLine: {
                set: function() {},
                get: function()
                {
                    return this.$store.getters.existsWholeLine;
                }
            },
            existsBreak: {
                set: function() {},
                get: function()
                {
                    return this.$store.getters.existsBreak;
                }
            },
            existsJoin: {
                set: function() {},
                get: function()
                {
                    return this.$store.getters.existsJoin;
                }
            },
            labelAlignment: {
                set: function() {},
                get: function()
                {
                    return this.$store.getters.labelAlignment;
                }
            },
            htmlText: {
                set: function() {},
                get: function()
                {
                    return this.$store.getters.htmlText;
                }
            },
            areaWidth: {
                set: function(width)
                {
                    this.$store.dispatch('setProperty', { prop: 'width', value: width });
                },
                get: function()
                {
                    return this.$store.getters.areaWidth;
                }
            },
            areaHeight: {
                set: function(height)
                {
                    this.$store.dispatch('setProperty', { prop: 'height', value: height });
                },
                get: function()
                {
                    return this.$store.getters.areaHeight;
                }
            },
            lineNumber: {
                set: function(lines)
                {
                    this.$store.dispatch('setLineNumber', lines);
                },
                get: function()
                {
                    return this.$store.getters.lineNumber;
                }
            },
            maxCharacters: {
                set: function(characters)
                {
                    this.$store.dispatch('setCharacterCount', characters);
                },
                get: function()
                {
                    var characters = this.$store.getters.maxCharacters;
                    return characters === undefined || characters > 0 ? characters : '';
                }
            },
            formColumns: {
                set: function(columns)
                {
                    this.$store.dispatch('setGridColumns', { controlId: '', columns });
                },
                get: function()
                {
                    var columns = this.form.columns;
                    if (!isNaN(columns) && columns < 1)
                        columns = 1;
                    return columns;
                }
            },
            selectedColumns: {
                set: function(columns)
                {
                    this.$store.dispatch('setGridColumns', { columns });
                },
                get: function()
                {
                    var columns = this.$store.getters.selectedColumns;
                    if (!isNaN(columns) && columns < 1)
                        columns = 1;
                    return columns;
                }
            },
            formLayout: {
                set: function(layout)
                {
                    this.$store.dispatch('setLayout', { controlId: '', layout });
                },
                get: function()
                {
                    return this.form.layout;
                }
            },
            selectedLayout: {
                set: function(layout)
                {
                    this.$store.dispatch('setLayout', { layout });
                },
                get: function()
                {
                    return this.$store.getters.selectedLayout;
                }
            },
            formAlignment: {
                set: function(alignment)
                {
                    this.$store.dispatch('alignFields', { controlId: '', alignment });
                },
                get: function()
                {
                    return this.form.childAlign;
                }
            },
            selectedAlignment: {
                set: function(alignment)
                {
                    this.$store.dispatch('alignFields', { alignment });
                },
                get: function()
                {
                    return this.$store.getters.selectedAlignment;
                }
            },
            selectedGroup: {
                set: function(group)
                {
                    this.$store.dispatch('changeGroup', group);
                },
                get: function()
                {
                    return this.$store.getters.selectedGroup;
                }
            },
            selectedOrder: {
                set: function(order)
                {
                    var controlId = this.controls[Object.keys(this.selectedControls)[0]].id;
                    this.$store.dispatch('setOrder', { controlId: controlId, order: order });
                },
                get: function()
                {
                    if (this.selectionSize != 1)
                        return '';
                    return this.controls[Object.keys(this.selectedControls)[0]].order;
                }
            }
        },
        methods: {
            ...Vuex.mapActions([
                'selectedUp',
                'selectedDown',
                'fillLine',
                'joinLine',
                'breakLine',
                'toggleVisibility',
                'toggleCollapsibility'
            ]),
            showAlignmentOption: function(index)
            {
                return (index < 4 || this.selectedLayout != 1) && (index != 0 || this.controlTypes != lib.TAB);
            },
            setLabelAlignments: function()
            {
                this.$store.dispatch('alignLabels', this.labelOptions.selected);
            },
            setFormTitle: function(evt)
            {
                if (evt.which == 13)
                    this.$store.dispatch('setFormTitle', evt.target.value);
            },
            setLabelText: function(evt)
            {
                if (evt.which == 13)
                    this.$store.dispatch('setProperty', { prop: 'label', value: evt.target.value });
            },
            setHtmlText: function(evt)
            {
                if (!evt.shiftKey && evt.which == 13)
                    this.$store.dispatch('setHtmlText', evt.target.value);
            }
        },
        updated: function()
        {
            lib.adaptFont(this.dimensions.width);
            $('select').selectpicker();
            lib.arrangeFlowLayout();
        }
    }
</script>

<style scoped>
    .custom-padding
    {
        padding: 6px 10px 1px 9px;
    }
</style>