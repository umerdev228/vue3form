<template>
    <div id="mesa" class="relative-position" @contextmenu.prevent="openMenu" v-shortcuts="shortcuts">
        <div id="loading-bar">
            <div id="progress-bar" v-bind:style="{'width': loadingBarWidth + 'vw', 'transition-duration': '1s'}"></div>
        </div>
        <div v-show="editorIsReady" id="mesa-container" v-bind:style="{'height': availableHeight + 'px'}">
            <nav id="mesa-navbar" class="navbar navbar-expand-md navbar-dark gradient-dark-bg absolute-position full-width height-60 no-padding no-justify">
                <div id="toggle-menu1-button-container" class="full-height margin-left-10 margin-right-10 width-64 padding-top-4">
                    <div v-show="showNavOption" class="full-height full-width">
                        <button v-if="menu1Collapsed" id="toggle-menu1-button" class="navbar-brand btn btn-link background-metal metal-button toggle-menu-button no-border full-height full-width" v-on:click.left.exact="showMenu('menu1')">
                            <i class="glyphicon glyphicon-chevron-right item-large"></i>
                        </button>
                        <button v-else id="toggle-menu1-button" class="navbar-brand btn btn-link background-metal metal-button toggle-menu-button no-border full-height full-width" v-on:click.left.exact="hideMenu('menu1')">
                            <i class="glyphicon glyphicon-chevron-left item-large"></i>
                        </button>
                    </div>
                </div>

                <div v-show="showNavOption" id="choose-form-container" v-bind:style="{'left': (menu1Collapsed && !collapsingMenu ? 74 : 84) + 'px'}">
                    <div id="form-select-container" class="margin-right-10 relative-position" :key="form.title + formSelectId">
                        <select id="form-select" class="selectpicker" v-model="form" data-live-search="true" data-width="100%" data-size="10" data-style="background-white height-33">
                            <option v-for="f in formList" v-bind:value="f" v-bind:selected="f.id == form.id" v-bind:data-subtext="f.title" class="font-14">{{f.id}}</option>
                        </select>
                    </div>
                </div>

                <div class="collapse navbar-collapse full-height">
                    <ul class="navbar-nav mr-auto full-height">
                        <li class="nav-item full-height margin-right-10">
                            <div class="btn-group btn-group-toggle full-height padding-top-6 padding-bottom-9">
                                <button class="nav-link btn btn-link background-metal metal-button salient-button salient-button-normal no-border full-height white center padding-top-11 padding-left-15 padding-right-15" data-toggle="tooltip" data-placement="bottom" :data-original-title="lang.keywords.save" v-on:click.left.exact="saveChanges" v-bind:disabled="isSaved">
                                    <span v-show="!isSaving" class="item-medium">
                                        <i class="material-icons-round">save</i>
                                    </span>
                                    <span v-show="isSaving" class="ld ld-ring ld-spin spinner"></span>
                                </button>
                            </div>
                        </li>
                        <li class="nav-item full-height margin-right-10">
                            <div class="btn-group btn-group-toggle full-height padding-top-6 padding-bottom-9">
                                <button v-bind:class="{'saving': isSaving}" class="nav-link btn btn-link salient-button salient-button-left background-metal metal-button no-border border-right-1 full-height white center padding-top-11 padding-left-15 padding-right-15" data-toggle="tooltip" data-placement="bottom" :data-original-title="lang.keywords.undo" v-on:click.left.exact="undo" v-bind:disabled="!canUndo">
                                    <span class="item-medium">
                                        <i class="material-icons-round">undo</i>
                                    </span>
                                </button>
                                <button v-bind:class="{'saving': isSaving}" class="nav-link btn btn-link salient-button salient-button-right background-metal metal-button no-border border-left-1 full-height white center padding-top-11 padding-left-15 padding-right-15" data-toggle="tooltip" data-placement="bottom" :data-original-title="lang.keywords.redo" v-on:click.left.exact="redo" v-bind:disabled="!canRedo">
                                    <span class="item-medium">
                                        <i class="material-icons-round">redo</i>
                                    </span>
                                </button>
                            </div>
                        </li>
                        <li class="nav-item full-height margin-right-10">
                            <div class="btn-group btn-group-toggle full-height padding-top-6 padding-bottom-9">
                                <button class="nav-link btn btn-link background-metal metal-button salient-button salient-button-normal no-border full-height white center padding-top-11 padding-left-15 padding-right-15" data-toggle="tooltip" data-placement="bottom" :data-original-title="lang.keywords.create_group" v-on:click.left.exact="createGroup">
                                    <span class="item-medium">
                                        <i class="material-icons-round">create_new_folder</i>
                                    </span>
                                </button>
                            </div>
                        </li>
                        <li class="nav-item full-height margin-right-10">
                            <div class="btn-group btn-group-toggle full-height padding-top-6 padding-bottom-9">
                                <button class="nav-link btn btn-link background-metal metal-button salient-button salient-button-normal no-border full-height white center padding-top-11 padding-left-15 padding-right-15" data-toggle="tooltip" data-placement="bottom" :data-original-title="lang.keywords.help" v-on:click.left.exact="showHelp">
                                    <span class="item-medium">
                                        <i class="material-icons-round">help</i>
                                    </span>
                                </button>
                            </div>
                        </li>
                        <li class="nav-item full-height margin-right-10">
                            <div class="btn-group btn-group-toggle full-height padding-top-6 padding-bottom-9">
                                <button class="nav-link btn btn-link background-metal metal-button salient-button salient-button-normal no-border full-height white center padding-top-11 padding-left-15 padding-right-15" data-toggle="tooltip" data-placement="bottom" :data-original-title="lang.keywords.settings" v-on:click.left.exact="showSettings">
                                    <span class="item-medium">
                                        <i class="material-icons-round">settings</i>
                                    </span>
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>

                <div id="navbar-supported-content" class="collapse navbar-collapse gradient-darker-bg white full-width" role="navigation" style="margin-right: -10px">
                    <ul class="nav navbar-nav col-xs-12 no-padding d-md-none">
                        <li class="nav-option mobile-nav-option" v-bind:class="{'disabled': isSaved}" v-on:click.left.exact="saveChanges">
                            <i v-show="!isSaving" class="material-icons-round">save</i>
                            <span v-show="isSaving" class="ld ld-ring ld-spin spinner white"></span>
                            <span class="full-height padding-left-6">{{lang.keywords.save}}</span>
                        </li>
                        <li class="nav-option mobile-nav-option" v-bind:class="{'disabled': !canUndo}" v-on:click.left.exact="undo">
                            <i class="material-icons-round">undo</i>
                            <span class="full-height padding-left-6">{{lang.keywords.undo}}</span>
                        </li>
                        <li class="nav-option mobile-nav-option" v-bind:class="{'disabled': !canRedo}" v-on:click.left.exact="redo">
                            <i class="material-icons-round">redo</i>
                            <span class="full-height padding-left-6">{{lang.keywords.redo}}</span>
                        </li>
                        <li class="nav-option mobile-nav-option" v-on:click.left.exact="createGroup">
                            <i class="material-icons-round">create_new_folder</i>
                            <span class="full-height padding-left-6">{{lang.keywords.create_group}}</span>
                        </li>
                        <li class="nav-option mobile-nav-option" v-on:click.left.exact="showHelp">
                            <i class="material-icons-round">help</i>
                            <span class="full-height padding-left-6">{{lang.keywords.help}}</span>
                        </li>
                        <li class="nav-option mobile-nav-option" v-on:click.left.exact="showSettings">
                            <i class="material-icons-round">settings</i>
                            <span class="full-height padding-left-6">{{lang.keywords.settings}}</span>
                        </li>
                    </ul>
                </div>

                <div v-show="showNavOption" id="lang-select" :key="langId" v-bind:class="{'lang-select-separated': separatedMenus > 0, 'lang-select-joined': separatedMenus == 0}" class="full-height pull-right margin-right-10">
                    <select class="selectpicker" data-width="fit" data-size="5" v-model="langId">
                        <option :value="countryIds.us" class="font-15 lang-item" data-content="<span class='flag-icon flag-icon-us font-15'></span>" v-bind:selected="langId == countryIds.us"></option>
                        <option :value="countryIds.pt" class="font-15 lang-item" data-content="<span class='flag-icon flag-icon-pt font-15'></span>" v-bind:selected="langId == countryIds.pt"></option>
                    </select>
                </div>

                <button v-bind:class="{'menu-toggler-separated': separatedMenus > 0, 'menu-toggler-joined': separatedMenus == 0}" id="menu-toggler" type="button" class="navbar-toggler item-medium absolute-position" data-toggle="collapse" data-target="#navbar-supported-content" aria-controls="navbar-supported-content" aria-expanded="false">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div v-if="separatedMenus > 0" id="toggle-menu2-button-container" class="full-height pull-right margin-right-10 width-64 padding-top-4">
                    <div v-show="showNavOption" class="full-height full-width">
                        <button v-if="menu2Collapsed" id="toggle-menu2-button" class="navbar-brand btn btn-link background-metal metal-button toggle-menu-button no-border full-height full-width" v-on:click.left.exact="showMenu('menu2')">
                            <i class="glyphicon glyphicon-chevron-left item-large"></i>
                        </button>
                        <button v-else id="toggle-menu2-button" class="navbar-brand btn btn-link background-metal metal-button toggle-menu-button no-border full-height full-width" v-on:click.left.exact="hideMenu('menu2')">
                            <i class="glyphicon glyphicon-chevron-right item-large"></i>
                        </button>
                    </div>
                </div>
            </nav>

            <config-menu id="mesa-properties-container-menu1" :key="separatedMenus" :left-side="true" :dimensions="menu1Dimensions" :resize="menu1Resize" :viewport-height="availableHeight"></config-menu>

            <div id="preview-container" v-bind:style="{'width': canvasWidth + 'px', 'left': (menu1Collapsed ? 0 : menu1Dimensions.wpercentage) + '%'}">
                <div id="canvas-container" class="padding-top-60">
                    <fullscreen id="fullscreen-canvas" ref="fullscreen" @change="fullscreenChange">
                        <ul v-show="optionsMenu.viewMenu" id="right-click-menu" ref="right-menu" tabindex="-1" v-bind:style="{top: optionsMenu.top, left: optionsMenu.left}">
                            <li @click="optionsMenu.viewMenu = true" class="full-width mobile-nav-option font-12 context-menu-header">
                                <div class="full-width">
                                    <span v-if="optionsMenu.element !== null && optionsMenu.element != ''" class="full-height">{{contextMenuTitle}}</span>
                                    <span v-else class="full-height">{{lang.keywords.main_form}}</span>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt < 3" @click="createGroup" class="full-width mobile-nav-option start-group font-12">
                                <div class="full-width">
                                    <i class="material-icons-round position-absolute font-18">create_new_folder</i>
                                    <span class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.create_group}}</span>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt < 3 && optionsMenu.element != '' && optionsMenu.elType != tabType" @click="deleteGroup" class="full-width mobile-nav-option font-12">
                                <div class="full-width">
                                    <i class="material-icons-round position-absolute font-18">delete_forever</i>
                                    <span class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.delete_group}}</span>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt < 3" @click="setLayout(0)" class="full-width mobile-nav-option start-group font-12" v-bind:class="{'disabled': optionsMenu.layout == 0}">
                                <div class="full-width">
                                    <i class="material-icons position-absolute font-18">sort</i>
                                    <span class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.flow_layout}}</span>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt < 3" @click="setLayout(1)" class="full-width mobile-nav-option font-12" v-bind:class="{'disabled': optionsMenu.layout == 1}">
                                <div class="full-width">
                                    <i class="material-icons-round position-absolute font-18">grid_on</i>
                                    <span class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.grid_layout}}</span>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt < 3" @click="setLayout(2)" class="full-width mobile-nav-option font-12" v-bind:class="{'disabled': optionsMenu.layout == 2}">
                                <div class="full-width">
                                    <i class="material-icons position-absolute font-18">list</i>
                                    <span class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.list_layout}}</span>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt > 1 && optionsMenu.menuOpt < 4" @click="fillLine({ id: optionsMenu.element, force: true })" class="full-width mobile-nav-option start-group font-12" style="padding-left: 5px">
                                <div class="full-width">
                                    <i class="material-icons-round position-absolute font-18">arrow_back</i>
                                    <i class="material-icons-round position-absolute font-18" style="margin-left: 5px">arrow_forward</i>
                                    <span class="full-height padding-left-6" style="margin-left: 21px">{{lang.keywords.whole_line}}</span>
                                    <i v-if="optionsMenu.wholeLine" class="material-icons-round font-18 pull-right">check</i>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt > 1 && optionsMenu.menuOpt < 4 && optionsMenu.groupLayout < 2" @click="breakLine({ id: optionsMenu.element, force: true })" class="full-width mobile-nav-option font-12">
                                <div class="full-width">
                                    <i class="material-icons-round position-absolute font-18">subdirectory_arrow_left</i>
                                    <span class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.line_break}}</span>
                                    <i v-if="optionsMenu.lineBreak" class="material-icons-round font-18 pull-right">check</i>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt > 1 && optionsMenu.menuOpt < 4 && optionsMenu.groupLayout != 1" @click="joinLine({ id: optionsMenu.element, force: true })" class="full-width mobile-nav-option font-12">
                                <div class="full-width">
                                    <i class="material-icons-round position-absolute font-18">arrow_forward</i>
                                    <span class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.joined}}</span>
                                    <i v-if="optionsMenu.joined" class="material-icons-round font-18 pull-right">check</i>
                                </div>
                            </li>
                            <li v-show="optionsMenu.menuOpt > 1" @click="toggleVisibility({ id: optionsMenu.element, force: true })" class="full-width mobile-nav-option font-12">
                                <div class="full-width">
                                    <i v-if="!optionsMenu.hidden" class="material-icons position-absolute font-18">visibility_off</i>
                                    <i v-else class="material-icons-round position-absolute font-18">visibility</i>
                                    <span v-if="!optionsMenu.hidden" class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.hide_element}}</span>
                                    <span v-else class="full-height padding-left-6" style="margin-left: 18px">{{lang.keywords.show_element}}</span>
                                </div>
                            </li>
                        </ul>
                        <div id="fullscreen-menu" class="text-right">
                            <button id="fullscreen-button" class="btn btn-light" v-on:click.left.exact="toggleFullscreen">
                                <i v-if="fullscreen" class="material-icons-round item-large">fullscreen_exit</i>
                                <i v-else class="material-icons-round item-large">fullscreen</i>
                            </button>
                        </div>
                        <div id="canvas">
                            <vue-draggable-resizable :draggable="false" :resizable="true" :enable-native-drag="true" :handles="['br']" :w="canvasDimensions.width" :h="canvasDimensions.height" class-name-handle="canvas-handle" class-name-active="active-canvas" class-name="mesa-canvas" @resizing="onPreviewResize">
                                <div id="mesa-preview" class="preview-container">
                                    <div id="mesa-preview-pane" class="custom-scrollbar padding-8">
                                        <mesa-form class="full-width full-height flex-container"></mesa-form>
                                    </div>
                                </div>
                            </vue-draggable-resizable>
                        </div>
                        <div id="selection-container"></div>
                        <notifications group="mesa-notifications" class="mesa-notification" position="top center" />
                    </fullscreen>
                </div>
            </div>

            <config-menu v-if="separatedMenus > 0" id="mesa-properties-container-menu2" :left-side="false" :dimensions="menu2Dimensions" :resize="menu2Resize" :viewport-height="availableHeight"></config-menu>

            <div id="help-window" class="mesa-dialog" :title="lang.keywords.shortcuts" style="display: none">
                <div class="container no-padding">
                    <div class="row padding-left-15 padding-right-15">
                        <div class="col-sm-4 col-md-3 offset-md-1 bold right">{{lang.keywords.command}}</div>
                        <div class="col-sm-8 col-md-5 offset-md-1 bold left">{{lang.keywords.effect}}</div>
                    </div>
                    <div v-for="e in lang.keywords.effects_text" class="row padding-left-15 padding-right-15">
                        <div class="col-sm-4 col-md-3 offset-md-1 margin-top-5 right">{{e[0]}}</div>
                        <div class="col-sm-8 col-md-5 offset-md-1 margin-top-5 left">{{e[1]}}</div>
                    </div>
                </div>
            </div>

            <div id="settings-window" class="mesa-dialog" :title="lang.keywords.settings_title" style="display: none">
                <div class="container no-padding">
                    <div class="row padding-left-15 padding-right-15" :key="'menu' + langId + separatedMenus">
                        <label class="wrap-text" for="layout-select">{{lang.keywords.menu_layout_label}}</label>
                        <select id="layout-select" class="selectpicker" v-model="separatedMenus" data-width="100%" data-style="background-white height-33">
                            <option v-for="(l, i) in lang.keywords.menu_layouts" v-bind:value="i" v-bind:selected="i == separatedMenus" class="font-14">{{l}}</option>
                        </select>
                    </div>
                    <hr style="border-color: white" />
                    <div class="row padding-left-15 padding-right-15 margin-top-15" :key="'canvas' + langId + canvasMode">
                        <label class="wrap-text" for="canvas-size">{{lang.keywords.canvas_size}}</label>
                        <select id="canvas-size" class="selectpicker" @change="setCanvasMode(canvasMode)" v-model="canvasMode" data-width="100%" data-style="background-white height-33">
                            <option v-bind:value="1" v-bind:selected="canvasMode == 1" class="font-14">{{lang.keywords.fit_canvas}}</option>
                            <option v-bind:value="2" v-bind:selected="canvasMode == 2" class="font-14">{{lang.keywords.mobile_size}}</option>
                            <option v-bind:value="3" v-bind:selected="canvasMode == 3" class="font-14">{{lang.keywords.custom_size}}</option>
                        </select>
                    </div>
                    <div class="row padding-left-15 padding-right-15 margin-top-15">
                        <div class="col-6 no-padding-left">
                            <label for="canvas-width">{{lang.keywords.width}}</label>
                            <input type="number" id="canvas-width" class="form-control no-border black" v-model.number.lazy="canvasDimensions.width" v-bind:readonly="canvasMode != 3" />
                        </div>
                        <div class="col-6 no-padding-right">
                            <label for="canvas-height">{{lang.keywords.height}}</label>
                            <input type="number" id="canvas-height" class="form-control no-border black" v-model.number.lazy="canvasDimensions.height" v-bind:readonly="canvasMode != 3" />
                        </div>
                    </div>
                    <hr style="border-color: white" />
                    <div class="row no-gutters margin-top-15">
                        <div class="col-12 col-sm-6 wrap-text mobile-nav-option">
                            <div class="col-12 dialog-check-option no-padding padding-right-15 no-padding-xs">
                                <label for="menu-lock" class="margin-right-25">{{lang.keywords.lock_menu}}:</label>
                                <label class="switch margin-left-10 pull-right">
                                    <input id="menu-lock" type="checkbox" name="lock-option" v-model="menuLocked" />
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>
                        <div class="col-12 col-sm-6 wrap-text mobile-nav-option">
                            <div class="col-12 dialog-check-option no-padding padding-left-15 no-padding-xs">
                            <!--
                            <label for="tab-lock" class="margin-right-25">{{lang.keywords.lock_tab}}:</label>
                            <label class="switch margin-left-10 pull-right" :key="'tab-lock' + tabLockState">
                                <input id="tab-lock" type="checkbox" name="tab-lock-option" v-model="tabsLocked" />
                                <span class="slider round"></span>
                            </label>
                            -->
                            </div>
                        </div>
                    </div>
                    <div class="row no-gutters">
                        <div class="col-12 col-sm-6 wrap-text mobile-nav-option">
                            <div class="col-12 dialog-check-option no-padding padding-right-15 no-padding-xs">
                                <label for="component-drag" class="margin-right-25">{{lang.keywords.drag_enabled}}:</label>
                                <label class="switch margin-left-10 pull-right">
                                    <input id="component-drag" type="checkbox" name="drag-option" v-model="dragEnabled" />
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="tab-lock-confirm-window" class="mesa-dialog" :title="lang.keywords.warning" style="display: none">
                <p>{{lang.keywords.tab_lock_warning}}</p>
                {{lang.keywords.confirm}}
            </div>

            <div id="leave-confirm-window" class="mesa-dialog" :title="lang.keywords.warning" style="display: none">
                {{lang.keywords.leave_confirm}}
            </div>

            <div id="group-creation-window" class="mesa-dialog" :title="lang.keywords.create_group" style="display: none">
                <div class="container no-padding">
                    <div :key="langId + optionsMenu.element + groupCreationState" class="row padding-left-15 padding-right-15">
                        <label class="wrap-text" for="group-select">{{lang.keywords.parent_group}}</label>
                        <select id="group-select" class="selectpicker full-width" data-width="100%" data-size="6" data-style="background-white">
                            <option value="" class="font-14">{{lang.keywords.main_form}}</option>
                            <option v-for="(group, id) in groupList" v-bind:value="id" v-bind:selected="id == optionsMenu.element" class="font-14">{{controls[id].field}}</option>
                        </select>
                    </div>
                    <div class="row margin-top-15">
                        <div :key="'group-layout' + langId" class="col-6">
                            <label for="element-layout">{{lang.keywords.group_layout}}</label>
                            <select id="element-layout" class="selectpicker full-width" data-width="100%" data-style="background-white">
                                <option v-for="(l, i) in lang.keywords.layout_types" v-bind:value="i" class="font-14">{{l}}</option>
                            </select>
                        </div>
                        <div :key="'group-label' + langId" class="col-6">
                            <label for="element-child-align">{{lang.keywords.set_alignment}}</label>
                            <select id="element-child-align" class="selectpicker full-width" data-width="100%" data-style="background-white">
                                <option v-for="(al, i) in lang.keywords.alignment_types" v-bind:value="i" class="font-14">{{al}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="row padding-left-15 padding-right-15 margin-top-15">
                        <label for="element-id">{{lang.keywords.id}}</label>
                        <input v-model="currentGroupId" id="element-id" type="text" class="form-control no-border black" style="padding: 8px !important" />
                    </div>
                    <div class="row margin-top-15">
                        <div class="col-6">
                            <label for="element-order">{{lang.keywords.order}}</label>
                            <input id="element-order" type="number" class="form-control no-border black" style="padding: 8px !important" />
                        </div>
                        <div class="col-6 display-grid">
                            <label for="element-collapsible" class="fit-width">{{lang.keywords.is_collapsible}}</label>
                            <label class="switch no-margin-bottom margin-top-5">
                                <input id="element-collapsible" type="checkbox" />
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div class="row margin-top-15 padding-left-15 padding-right-15">
                        <label for="element-label">{{lang.keywords.label}}</label>
                        <input id="element-label" type="text" class="form-control no-border black" style="padding: 8px !important" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Vuex from 'vuex';

    import lib from '@/lib';

    // Canvas default measures.
    const CWIDTH = 900;
    const CHEIGHT = 600;

    // Canvas default mobile measures.
    const MWIDTH = 342;
    const MHEIGHT = 608;

    // Canvas size mode.
    const FIT = 1;
    const MOBILE = 2;
    const CUSTOM = 3;

    // The main app.
    var app;

    //------------------------
    // Selection handling
    //------------------------

    var containers = [];
    var previousId;

    /**
     *
     * @param {any} evt
     */
    function getPath(evt)
    {
        var path = evt.path || (evt.composedPath && evt.composedPath());
        if (path === undefined)
            return null;
        return path;
    }

    /**
     *
     * @param {any} evt
     * @param {any} el
     * @param {any} level
     */
    function searchElement(evt, el, level)
    {
        var path = getPath(evt);
        if (path !== null)
        {
            var count = 0;
            for (let i = 0; i < path.length; i++)
            {
                let className = $(path[i]).attr('class');
                if (className !== undefined && className.indexOf(el) != -1)
                {
                    if (count < level)
                    {
                        count++;
                        continue;
                    }
                    return $(path[i]).attr('id');
                }
            }
        }
        return null;
    }

    /**
     *
     * @param {any} evt
     * @param {any} level
     * @param {any} goDeeper
     */
    function getElement(evt, level, goDeeper)
    {
        var el = 'mesa-control';
        if (level == -1)
            el = 'preview-container';
        var element = searchElement(evt, el, level);
        if (element !== null)
            return element;
        if (goDeeper)
        {
            el = 'branch-element';
            element = searchElement(evt, el, level);
            if (element !== null)
                return element.replace('branch-', '');
        }
        return null;
    }

    /**
     *
     * @param {object} evt
     */
    function selectElement(evt)
    {
        var event = evt.originalEvent;
        if (!event.ctrlKey && !event.metaKey)
            app.clearSelection();
        app.startSelecting();
        const id = getElement(event, 0);
        if (id !== null)
            app.updateSelection(id);
    }

    /**
     *
     */
    const selectOptions = {
        class: 'selection',
        boundaries: ['#mesa-preview-pane'],
        containers: ['#mesa-preview-pane'],
        selectables: ['.mesa-control'],
        selectionAreaContainer: '#selection-container',
        singleClick: true,
        startThreshold: 5,

        validateStart(evt)
        {
            return !app.isDragging && !app.isResizing && evt.which == 1;
        },

        onStart(evt)
        {
            selectElement(evt);
            evt.selectedElements.forEach(s => {
                if (s.classList.contains('mesa-control') && !lib.containsChild(containers, s.id))
                    containers.push(s.id);
            });
            previousId = '';
        },

        onSelect(evt)
        {
            selectElement(evt);
            app.stopSelecting();
        },

        onMove(evt)
        {
            if (app.isSelecting)
            {
                const currentId = getElement(evt.originalEvent, 0);
                if (currentId != previousId && (currentId === null || lib.containsChild(containers, currentId)))
                {
                    let found = false;
                    for (let i = containers.length - 1; i >= 0; i--)
                    {
                        if (found && lib.containsControl(containers[i], app.currentControls))
                            app.unselectControl(containers[i]);
                        else if (!found && !lib.containsControl(containers[i], app.currentControls))
                            app.selectControl(containers[i]);
                        if (containers[i] == currentId)
                            found = true;
                    }
                    previousId = currentId;
                }

                evt.changedElements.added.forEach(s => {
                    if (s.classList.contains('mesa-control') && !lib.containsControl(s.id, app.currentControls))
                        app.selectControl(s.id);
                });

                evt.changedElements.removed.forEach(s => {
                    if (s.classList.contains('mesa-control') && lib.containsControl(s.id, app.currentControls))
                        app.unselectControl(s.id);
                });
            }
        },

        onStop()
        {
            app.stopSelecting();
            containers = [];
        }
    };

    //------------------------
    // Utility functions
    //------------------------

    /**
     *
     * @param {any} controls
     * @param {any} callback
     */
    function getSearchOptions(controls, callback)
    {
        var data = [];
        for (let i in controls)
            data.push(controls[i]);

        return {
            data: data,

            getValue: 'searchIndex',

            list: {
                showAnimation: {
                    type: 'slide',
                    time: 300
                },

                hideAnimation: {
                    type: 'slide',
                    time: 300
                },

                match: {
                    enabled: true
                },

                maxNumberOfElements: 6,

                onChooseEvent: function()
                {
                    var cache = $('#search-bar').getSelectedItemData();
                    callback(cache.id);
                }
            },
            template: {
                type: 'description',

                fields: {
                    description: 'label'
                }
            }
        };
    }

    /**
     * Configurates the aspect and behavior of the search bar in the elements tree.
     * @param {any} controls
     * @param {any} callback
     * @param {any} force
     */
    function configSearchBar(controls, callback, force)
    {
        if ($('#search-bar').first().attr('autocomplete') === undefined || force)
        {
            $('#eac-container-search-bar').remove();
            $('#search-bar').easyAutocomplete(getSearchOptions(controls, callback));
        }
        $('#search-icon').remove();
        $('#search-bar').val('');
        $('<span>', { id: 'search-icon', class: 'glyphicon glyphicon-search darkgrey' }).insertAfter('#search-bar');
        $('.easy-autocomplete').attr('style', 'color: black');
    }

    /**
     * Calculates the dimensions of the side menus.
     * @param {any} menu
     * @param {any} pd
     * @param {any} vw
     * @param {any} vh
     */
    function getMenuDimensions(menu, pd, vw, vh)
    {
        var width = vw * pd.wpercentage / 100;
        var height = vh * pd.hpercentage / 100;
        return lib.setMenuDimensions(menu, pd, width, height, pd.wpercentage, pd.hpercentage);
    }

    /**
     *
     * @param {any} menu
     * @param {any} w
     */
    function getMenuHideProperties(menu, w)
    {
        if (menu == 'menu1')
            return { 'left': '-' + w + '%' };
        else
            return { 'right': '-' + w + '%' };
    }

    /**
     *
     * @param {any} menu
     */
    function getMenuShowProperties(menu)
    {
        if (menu == 'menu1')
            return { 'left': '0' };
        else
            return { 'right': '0' };
    }

    /**
     *
     * @param {any} menu
     * @param {any} cw
     */
    function getCanvasHideProperties(menu, cw)
    {
        var cwp = cw * 100 / getWidth();
        if (menu == 'menu1')
            return { 'width': cwp + '%', 'left': '0' };
        else
            return { 'width': cwp + '%', 'right': '0' };
    }

    /**
     *
     * @param {any} menu
     * @param {any} cw
     * @param {any} w
     */
    function getCanvasShowProperties(menu, cw, w)
    {
        var cwp = cw * 100 / getWidth();
        if (menu == 'menu1')
            return { 'width': (cwp - w) + '%', 'left': w + '%' };
        else
            return { 'width': (cwp - w) + '%', 'right': w + '%' };
    }

    /**
     * Hides the button that controls the visibility of the side menus.
     * @param {any} menu
     * @param {any} css
     * @param {any} time
     */
    function hideMenuButton(menu, css, time)
    {
        $('#toggle-' + menu + '-button').css(css);
        $('#toggle-' + menu + '-button-container').animate({ 'padding-bottom': '4px' }, {
            duration: time,

            complete: function()
            {
                app.collapsingMenu = false;
            }
        });
    }

    /**
     * Shows the button that controls the visibility of the side menus.
     * @param {any} menu
     * @param {any} css
     * @param {any} time
     */
    function showMenuButton(menu, css, time)
    {
        $('#toggle-' + menu + '-button-container').animate(css, {
            duration: time,

            complete: function()
            {
                app.collapsingMenu = false;
            }
        });
        $('#toggle-' + menu + '-button').css({ 'border-radius': '0.25rem 0.25rem 0 0' });
    }

    /**
     * Calculates the available height for the Form Editor to occupy.
     * @param {any} height
     */
    function calculateHeight(height)
    {
        /*
        const headerHeight = $('#header').length > 0 ? $('#header').height() : $('#header-container').height();
        const footerHeight = $('#footer_').height();
        return height - headerHeight - footerHeight;
        */
        return height;
    }

    /**
     * Gets the window height.
     */
    function getHeight()
    {
        return $(window).height();
    }

    /**
     * Gets the window width.
     */
    function getWidth()
    {
        return $(window).width()/* - 50*/;
    }

    //------------------------
    // Main view
    //------------------------

    export default
        {
            name: 'editor',

            head: {
                link: [
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/material-icons/material-icons.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/font-awesome/css/font-awesome.min.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/flag-icons/css/flag-icon.min.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/easy-autocomplete.min.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/easy-autocomplete.themes.min.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/bootstrap-select.min.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/loading.min.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/glyphicons.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/normalize.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/animate.css' },
                    { rel: 'stylesheet', href: STYLE_FOLDER + '/mesa.css' }
                ]
            },

            data: function()
            {
                return {
                    availableHeight: 0,
                    canvasMode: 0,
                    currentGroupId: '',
                    fullscreen: false,
                    collapsingMenu: false,
                    showMenuButton: true,
                    viewportWidth: getWidth(),
                    viewportHeight: getHeight(),
                    groupCreationState: 0,
                    tabLockState: 0,
                    tabType: lib.TAB,
                    menu1Dimensions: lib.setMenuDimensions('menu1', null, getWidth() * 0.2, 1, 20, 100),
                    menu2Dimensions: lib.setMenuDimensions('menu2', null, getWidth() * 0.2, 1, 20, 100),
                    canvasDimensions: {
                        width: CWIDTH,
                        height: CHEIGHT
                    },
                    // Properties of the context menu.
                    optionsMenu: {
                        viewMenu: false,
                        wholeLine: false,
                        joined: false,
                        lineBreak: false,
                        hidden: false,
                        layout: -1,
                        groupLayout: -1,
                        menuOpt: 0,
                        element: null,
                        elType: '',
                        top: '0',
                        left: '0'
                    }
                }
            },

            computed: {
                ...Vuex.mapState([
                    'editorIsReady',
                    'lang',
                    'countryIds',
                    'storage',
                    'formList',
                    'controls',
                    'currentControls',
                    'isSelecting',
                    'isDragging',
                    'isResizing',
                    'formSelectId',
                    'menu1Collapsed',
                    'menu2Collapsed',
                    'canUndo',
                    'canRedo',
                    'isSaving',
                    'isSaved'
                ]),

                ...Vuex.mapGetters([
                    'groupList',
                    'labelOptions',
                    'totalCalls',
                    'pendingCalls'
                ]),

                langId: {
                    set: function(lang)
                    {
                        this.$store.dispatch('storeLang', lang);
                        this.$store.dispatch('setLang', false);
                        lib.callDialogsOp('destroy');
                    },
                    get: function()
                    {
                        return this.$store.state.lang.language;
                    }
                },

                menuLocked: {
                    set: function()
                    {
                        this.toggleMenuLock();
                    },
                    get: function()
                    {
                        return this.$store.state.menuLocked;
                    }
                },

                tabsLocked: {
                    set: function(val)
                    {
                        if (!val)
                        {
                            $('div[aria-describedby="settings-window"]').addClass('index-500');
                            $('#tab-lock-confirm-window').dialog({
                                draggable: true,
                                resizable: false,
                                autoOpen: true,
                                modal: true,
                                buttons: [
                                    {
                                        text: app.lang.keywords.no,

                                        open: function()
                                        {
                                            $(this).addClass('dialog-error-button');
                                        },

                                        click: function()
                                        {
                                            $(this).dialog('close');
                                        }
                                    },

                                    {
                                        text: app.lang.keywords.yes,

                                        open: function()
                                        {
                                            $(this).addClass('dialog-success-button');
                                        },

                                        click: function()
                                        {
                                            app.toggleTabLock();
                                            $(this).dialog('close');
                                        }
                                    }
                                ],
                                show: lib.DIALOG_CONFIG,
                                hide: lib.DIALOG_CONFIG
                            });
                            lib.arrangeDialog();
                            $('.ui-button').attr('title', '');

                            $('#tab-lock-confirm-window').on('dialogclose', function()
                            {
                                $('div[aria-describedby="settings-window"]').removeClass('index-500');
                                app.tabLockState++;
                            });
                        }
                        else
                            this.toggleTabLock();
                    },
                    get: function()
                    {
                        return this.$store.state.tabsLocked;
                    }
                },

                dragEnabled: {
                    set: function(drag)
                    {
                        this.setDragging(drag);
                    },
                    get: function()
                    {
                        return this.$store.state.dragEnabled;
                    }
                },

                separatedMenus: {
                    set: function(menuLayout)
                    {
                        if (this.menu1Collapsed)
                            this.showMenu('menu1', 0);
                        if (this.menu2Collapsed)
                            this.showMenu('menu2', 0);
                        this.$store.commit('setMenuState', menuLayout);
                    },
                    get: function()
                    {
                        return this.$store.state.separatedMenus;
                    }
                },

                form: {
                    set: function(form)
                    {
                        this.$store.dispatch('setForm', form);
                    },
                    get: function()
                    {
                        return this.$store.state.form;
                    }
                },

                contextMenuTitle: function()
                {
                    const control = this.controls[this.optionsMenu.element];
                    return control !== undefined ? control.searchIndex : '';
                },

                // Indicates if the options in the navbar should be currently visible.
                showNavOption: function()
                {
                    return this.viewportWidth > 767 || this.showMenuButton;
                },

                loadingBarWidth: function()
                {
                    const ratio = this.totalCalls / this.pendingCalls;
                    const result = Math.round(100 - 100 / (isNaN(ratio) || ratio == 0 ? 1 : ratio));
                    if (result >= 98)
                        setTimeout(function()
                        {
                            $('#loading-bar').hide('slow');
                        }, 1600);
                    return result;
                },

                canvasWidth: function()
                {
                    if (this.menu1Collapsed)
                        if (this.menu2Collapsed || this.separatedMenus == 0)
                            return this.viewportWidth;
                        else
                            return this.viewportWidth - this.menu2Dimensions.width;
                    else if (this.menu2Collapsed || this.separatedMenus == 0)
                        return this.viewportWidth - this.menu1Dimensions.width;
                    else
                        return this.viewportWidth - this.menu1Dimensions.width - this.menu2Dimensions.width;
                },

                shortcuts: function()
                {
                    return [
                        { shortcut: ['ctrl', 'arrowup'], once: true, callback: this.changeLevelUp },
                        { shortcut: ['ctrl', 'arrowdown'], once: true, callback: this.changeLevelDown },
                        { shortcut: ['ctrl', 'arrowleft'], once: true, callback: this.selectedUp },
                        { shortcut: ['ctrl', 'arrowright'], once: true, callback: this.selectedDown },
                        { shortcut: ['ctrl', 'f'], once: true, callback: this.toggleFullscreen },
                        { shortcut: ['ctrl', 'r'], once: true, callback: this.toggleVisibility },
                        { shortcut: ['ctrl', 'o'], once: true, callback: this.showSettings },
                        { shortcut: ['ctrl', 's'], once: true, callback: this.saveChanges },
                        { shortcut: ['ctrl', 'a'], once: true, callback: this.selectAll },
                        { shortcut: ['ctrl', 'b'], once: true, callback: this.breakLine },
                        { shortcut: ['ctrl', 'j'], once: true, callback: this.joinLine },
                        { shortcut: ['ctrl', 'l'], once: true, callback: this.fillLine },
                        { shortcut: ['ctrl', 'h'], once: true, callback: this.showHelp },
                        { shortcut: ['ctrl', 'z'], once: true, callback: this.undo },
                        { shortcut: ['ctrl', 'y'], once: true, callback: this.redo },
                        { shortcut: ['tab'], once: true, callback: this.selectNext },
                        { shortcut: ['arrowup'], once: true, callback: this.comeOut },
                        { shortcut: ['arrowdown'], once: true, callback: this.goIn },
                        { shortcut: ['arrowright'], once: true, callback: this.selectNext },
                        { shortcut: ['arrowleft'], once: true, callback: this.selectPrevious }
                    ];
                }
            },

            methods: {
                ...Vuex.mapActions([
                    'saveChanges',
                    'storeSettings',
                    'initSelection',
                    'destroySelection',
                    'clearSelection',
                    'startSelecting',
                    'stopSelecting',
                    'cancelSelection',
                    'updateSelection',
                    'selectAll',
                    'selectControl',
                    'unselectControl',
                    'selectedUp',
                    'selectedDown',
                    'selectPrevious',
                    'selectNext',
                    'goIn',
                    'comeOut',
                    'changeLevelUp',
                    'changeLevelDown',
                    'fillLine',
                    'joinLine',
                    'breakLine',
                    'toggleVisibility',
                    'toggleMenuLock',
                    'toggleTabLock',
                    'openDroppablePath',
                    'startDrag',
                    'endDrag',
                    'setDragging'
                ]),

                /**
                 * Hides the side menu.
                 * @param {any} menu
                 * @param {any} duration
                 */
                hideMenu: function(menu, duration)
                {
                    if (!this.collapsingMenu)
                    {
                        var time = duration == undefined ? 'slow' : duration;
                        this.collapsingMenu = true;
                        if ($('#navbar-supported-content').is(':visible'))
                            $('#navbar-supported-content').collapse('hide');
                        var pd = this[menu + 'Dimensions'];

                        $('#mesa-properties-container-' + menu).animate(getMenuHideProperties(menu, pd.wpercentage), {
                            duration: time,

                            start: function()
                            {
                                app.$store.commit(menu + 'Collapse', true);
                            }
                        });

                        if (menu == 'menu1')
                            $('#toggle-menu1-button-container').animate({ 'margin-left': '0' }, time);
                        else if (menu == 'menu2')
                            $('#toggle-menu2-button-container').animate({ 'margin-right': '0' }, time);

                        $('#preview-container').animate(getCanvasHideProperties(menu, this.canvasWidth), {
                            duration: time,

                            complete: function()
                            {
                                if (menu == 'menu1')
                                    hideMenuButton(menu, { 'border-radius': '0 0.25rem 0.25rem 0' }, time);
                                else if (menu == 'menu2')
                                    hideMenuButton(menu, { 'border-radius': '0.25rem 0 0 0.25rem' }, time);
                            }
                        });
                    }
                },

                /**
                 * Shows the side menu.
                 * @param {any} menu
                 * @param {any} duration
                 */
                showMenu: function(menu, duration)
                {
                    if (!this.collapsingMenu)
                    {
                        var time = duration == undefined ? 'slow' : duration;
                        this.collapsingMenu = true;
                        if ($('#navbar-supported-content').is(':visible'))
                            $('#navbar-supported-content').collapse('hide');
                        var pd = this[menu + 'Dimensions'];

                        $('#mesa-properties-container-' + menu).animate(getMenuShowProperties(menu), {
                            duration: time,

                            start: function()
                            {
                                if (menu == 'menu1')
                                    $('#toggle-menu1-button-container').animate({ 'padding-bottom': '0' }, time);
                                else if (menu == 'menu2')
                                    $('#toggle-menu2-button-container').animate({ 'padding-bottom': '0' }, time);
                                $('#preview-container').animate(getCanvasShowProperties(menu, app.canvasWidth, pd.previouswp), time);
                                app[menu + 'Dimensions'] = lib.setMenuDimensions(pd.menu, pd, pd.previousw, pd.height, pd.wpercentage, pd.hpercentage);
                                app.$store.commit(menu + 'Collapse', false);
                            },

                            complete: function()
                            {
                                if (menu == 'menu1')
                                    showMenuButton(menu, { 'margin-left': '10px' }, time);
                                else if (menu == 'menu2')
                                    showMenuButton(menu, { 'margin-right': '10px' }, time);
                            }
                        });
                    }
                },

                /**
                 *
                 */
                toggleFullscreen: function()
                {
                    this.$refs['fullscreen'].toggle();
                },

                /**
                 *
                 * @param {any} fullscreen
                 */
                fullscreenChange: function(fullscreen)
                {
                    this.fullscreen = fullscreen;
                },

                /**
                 * Sets up the context menu.
                 * @param {any} left
                 * @param {any} top
                 */
                setMenu: function(left, top)
                {
                    let largestHeight = window.innerHeight - this.$refs['right-menu'].offsetHeight - 25;
                    let largestWidth = window.innerWidth - this.$refs['right-menu'].offsetWidth - 25;
                    if (top > largestHeight)
                        top = largestHeight;
                    if (left > largestWidth)
                        left = largestWidth;
                    this.optionsMenu.top = top + 'px';
                    this.optionsMenu.left = left + 'px';
                },

                /**
                 * Closes the context menu.
                 */
                closeMenu: function()
                {
                    this.optionsMenu.viewMenu = false;
                },

                /**
                 * Opens the context menu.
                 * @param {any} evt
                 */
                openMenu: function(evt)
                {
                    const element = getElement(evt, 0, true);
                    this.optionsMenu.menuOpt = 0;
                    this.optionsMenu.element = null;
                    this.closeMenu();
                    if (element !== null)
                    {
                        if (this.tabsLocked && lib.hasTabContainer(this.controls, element))
                            return;

                        let control = this.controls[element];
                        if (control.ctrlType == lib.GROUPBOX)
                        {
                            this.optionsMenu.menuOpt = 2;
                            this.optionsMenu.layout = control.layout;
                        }
                        else if (control.ctrlType == lib.TAB)
                        {
                            if (this.tabsLocked && lib.hasTabContainer(this.controls, element, true))
                                this.optionsMenu.menuOpt = 4;
                            else
                                this.optionsMenu.menuOpt = 2;
                            this.optionsMenu.layout = control.layout;
                        }
                        else
                            this.optionsMenu.menuOpt = 3;

                        this.optionsMenu.groupLayout = control.groupId == '' ? this.form.layout : this.controls[control.groupId].layout;
                        this.optionsMenu.element = element;
                        this.optionsMenu.elType = control.ctrlType;
                        this.optionsMenu.wholeLine = control.wholeLine;
                        this.optionsMenu.joined = control.joined;
                        this.optionsMenu.lineBreak = control.lineBreak;
                        this.optionsMenu.hidden = control.hidden;
                    }
                    else if (getElement(evt, -1) !== null)
                    {
                        this.optionsMenu.menuOpt = 1;
                        this.optionsMenu.element = '';
                        this.optionsMenu.layout = this.form.layout;
                    }
                    else
                        return;

                    this.optionsMenu.viewMenu = true;
                    Vue.nextTick(function()
                    {
                        this.$refs['right-menu'].focus();
                        this.setMenu(evt.x, evt.y);
                    }.bind(this));
                    evt.preventDefault();
                },

                /**
                 * Stores the dimensions of the side menus in the local storage.
                 */
                storeDimensions: function()
                {
                    var dimensions = {
                        menu1: this.menu1Dimensions,
                        menu2: this.menu2Dimensions
                    };
                    this.$store.dispatch('storeMenuDimensions', dimensions);
                },

                /**
                 * Resizes the left side menu.
                 * @param {any} x
                 * @param {any} y
                 * @param {any} width
                 * @param {any} height
                 */
                menu1Resize: function(x, y, width, height)
                {
                    var pd = this.menu1Dimensions;
                    this.menu1Dimensions = lib.setMenuDimensions(pd.menu, pd, width, height, width / this.viewportWidth * 100, pd.hpercentage);
                    this.storeDimensions();
                },

                /**
                 * Resizes the right side menu.
                 * @param {any} x
                 * @param {any} y
                 * @param {any} width
                 * @param {any} height
                 */
                menu2Resize: function(x, y, width, height)
                {
                    var pd = this.menu2Dimensions;
                    this.menu2Dimensions = lib.setMenuDimensions(pd.menu, pd, width, height, width / this.viewportWidth * 100, pd.hpercentage);
                    this.storeDimensions();
                },

                /**
                 * After a search, selects the chosen element, both in the canvas and in the elements tree.
                 * @param {any} id
                 */
                selectElement: function(id)
                {
                    $('#search-bar').val('');
                    this.clearSelection();
                    this.openDroppablePath(id);
                    this.selectControl(id);
                    lib.scrollToElement(this.controls, id, true, true);

                    $(document).ready(function()
                    {
                        lib.animateElement('#' + id, 'pulse');
                        lib.animateElement('#branch-' + id, 'shake');
                    });
                },

                /**
                 * Shows the help menu.
                 */
                showHelp: function()
                {
                    $('#help-window').dialog({
                        draggable: true,
                        resizable: false,
                        autoOpen: true,
                        modal: true,
                        width: this.viewportWidth < 750 ? this.viewportWidth : 750,
                        height: this.viewportHeight < 625 ? this.viewportHeight : 625,
                        show: lib.DIALOG_CONFIG,
                        hide: lib.DIALOG_CONFIG
                    });
                    lib.arrangeDialog();
                    $('.ui-button').attr('title', '');
                },

                /**
                 * Shows the settings menu.
                 */
                showSettings: function()
                {
                    $('#settings-window').dialog({
                        draggable: true,
                        resizable: false,
                        autoOpen: true,
                        modal: true,
                        width: this.viewportWidth < 650 ? this.viewportWidth : 650,
                        height: this.viewportHeight < 456 ? this.viewportHeight : 456,
                        buttons: [
                            {
                                text: this.lang.keywords.save_settings,

                                open: function()
                                {
                                    $(this).addClass('dialog-success-button');
                                },

                                click: function()
                                {
                                    var settings = {
                                        canvasDimensions: app.canvasDimensions,
                                        separatedMenus: app.separatedMenus,
                                        menuLocked: app.menuLocked,
                                        tabsLocked: app.tabsLocked,
                                        dragEnabled: app.dragEnabled
                                    };
                                    app.storeSettings(settings);
                                    lib.showNotification('success', app.lang.keywords.success_title, app.lang.keywords.settings_saved);
                                }
                            }
                        ],
                        show: lib.DIALOG_CONFIG,
                        hide: lib.DIALOG_CONFIG
                    });
                    lib.arrangeDialog();
                    $('.ui-button').attr('title', '');
                },

                /**
                 * Recalculates the dimensions of the side menus.
                 */
                adjustMenuDimensions: function()
                {
                    this.menu1Dimensions = getMenuDimensions('menu1', this.menu1Dimensions, this.viewportWidth, this.availableHeight);
                    this.menu2Dimensions = getMenuDimensions('menu2', this.menu2Dimensions, this.viewportWidth, this.availableHeight);
                },

                /**
                 *
                 */
                createGroup: function()
                {
                    if (this.optionsMenu.element === null)
                        this.groupCreationState++;
                    var groupNumber = Object.keys(this.groupList).length;
                    var i = groupNumber + 1;
                    var id = 'NEWGR' + i;
                    for (; this.controls[id] !== undefined; i++)
                        id = 'NEWGR' + i;
                    this.currentGroupId = id;
                    $('#group-creation-window').dialog({
                        draggable: true,
                        resizable: false,
                        autoOpen: true,
                        modal: true,
                        width: this.viewportWidth < 650 ? this.viewportWidth : 650,
                        height: this.viewportHeight < 486 ? this.viewportHeight : 486,
                        buttons: [
                            {
                                text: this.lang.keywords.create_group,

                                open: function()
                                {
                                    $(this).addClass('dialog-success-button');
                                },

                                click: function()
                                {
                                    // Checks if "currentGroupId" is unique.
                                    if (app.controls[lib.DEFAULT_TABLE + '_' + app.currentGroupId] === undefined)
                                    {
                                        if (app.currentGroupId.length > 0 && app.currentGroupId.length < 9)
                                        {
                                            const groupId = $('#group-select').val();
                                            if (groupId == '' || !app.tabsLocked || !lib.hasTabContainer(app.controls, groupId, true))
                                            {
                                                let collapsible = $('#element-collapsible').is(':checked');
                                                let group = {
                                                    id: lib.DEFAULT_TABLE + '_' + app.currentGroupId,
                                                    fieldGuid: null,
                                                    tableName: lib.DEFAULT_TABLE,
                                                    pos: -1,
                                                    ctrlType: lib.GROUPBOX,
                                                    dataType: collapsible ? 'ZC' : 'ZN',
                                                    helpType: collapsible ? 'ZC' : 'ZN',
                                                    field: app.currentGroupId,
                                                    label: $('#element-label').val(),
                                                    groupId: groupId,
                                                    lineBreak: false,
                                                    joined: false,
                                                    wholeLine: false,
                                                    hidden: false,
                                                    length: 0,
                                                    collapsible: collapsible,
                                                    layout: parseInt($('#element-layout').val()),
                                                    childAlign: parseInt($('#element-child-align').val()),
                                                    columns: 0,
                                                    order: $('#element-order').val(),
                                                    searchIndex: lib.DEFAULT_TABLE + '.' + app.currentGroupId
                                                };
                                                $('#element-label').val('');
                                                $('#element-order').val('');
                                                app.$store.dispatch('createGroup', group);
                                            }
                                            else
                                                lib.showNotification('error', app.lang.keywords.error_title, app.lang.keywords.change_error);
                                        }
                                        else
                                            lib.showNotification('error', app.lang.keywords.error_title, app.lang.keywords.id_size_error);
                                    }
                                    else
                                        lib.showNotification('error', app.lang.keywords.error_title, app.lang.keywords.group_id_not_unique);
                                    app.optionsMenu.element = null;
                                }
                            }
                        ],
                        show: lib.DIALOG_CONFIG,
                        hide: lib.DIALOG_CONFIG
                    });
                    lib.arrangeDialog();
                    $('.ui-button').attr('title', '');
                },

                /**
                 *
                 */
                deleteGroup: function()
                {
                    const groupId = this.optionsMenu.element;
                    if (groupId !== null && groupId != '')
                        this.$store.dispatch('deleteGroup', groupId);
                },

                /**
                 *
                 * @param {any} mode
                 */
                setCanvasMode: function(mode)
                {
                    if (mode == FIT)
                    {
                        this.canvasDimensions.width = screen.width;
                        this.canvasDimensions.height = screen.height;
                    }
                    else if (mode == MOBILE)
                    {
                        this.canvasDimensions.width = MWIDTH;
                        this.canvasDimensions.height = MHEIGHT;
                    }
                },

                /**
                 *
                 */
                getCanvasMode: function()
                {
                    var width = this.canvasDimensions.width;
                    var height = this.canvasDimensions.height;
                    if (width == this.viewportWidth && height == this.viewportHeight)
                        return FIT;
                    else if (width == MWIDTH && height == MHEIGHT)
                        return MOBILE;
                    else
                        return CUSTOM;
                },

                /**
                 * Updates the canvas's width and height when it's resized.
                 * @param {any} x
                 * @param {any} y
                 * @param {any} width
                 * @param {any} height
                 */
                onPreviewResize: function(x, y, width, height)
                {
                    var dim = {
                        width: width,
                        height: height
                    };
                    this.$store.dispatch('resizePreview', dim);
                },

                /**
                 * Sets the layout of the clicked element.
                 * @param {any} layout
                 */
                setLayout: function(layout)
                {
                    var controlId = this.optionsMenu.element;
                    this.$store.dispatch('setLayout', { controlId: controlId, layout: layout });
                    if (layout == this.optionsMenu.layout)
                        this.optionsMenu.viewMenu = true;
                },

                /**
                 * Reduces the font size of the properties menu when it's width is too small.
                 */
                adaptFont: function()
                {
                    if (this.separatedMenus <= 1)
                        lib.adaptFont(this.menu1Dimensions.width);
                    else
                        lib.adaptFont(this.menu2Dimensions.width);
                },

                /**
                 *
                 */
                undo: function()
                {
                    this.closeMenu();
                    this.$store.dispatch('undo');
                },

                /**
                 *
                 */
                redo: function()
                {
                    this.closeMenu();
                    this.$store.dispatch('redo');
                }
            },

            watch: {
                controls: function()
                {
                    configSearchBar(this.controls, this.selectElement, true);
                },

                viewportWidth: function()
                {
                    lib.callDialogsOp('close');
                    this.adjustMenuDimensions();
                },

                viewportHeight: function()
                {
                    lib.callDialogsOp('close');
                    this.adjustMenuDimensions();
                },

                availableHeight: function()
                {
                    this.adjustMenuDimensions();
                }
            },

            created: async function()
            {
                // Prepares the calls that will be made, to show the loading status in the progress bar.
                this.$store.commit('setCall', 'setUsername');
                this.$store.commit('setCall', 'setLang');
                this.$store.commit('setCall', 'setFormList');
                this.$store.commit('setCall', 'setForm');

                // Loads the data from the server (language, username, form list and form controls) and initializes it.
                this.$store.dispatch('setLang', true);
                await this.$store.dispatch('initFormEditor', this.$storage);

                // If there are any settings, for this user, saved in the local storage, retrieves and uses them.
                var settings = this.storage.get('settings');
                if (settings !== null)
                {
                    this.$store.commit('setMenuLocked', settings.menuLocked);
                    this.$store.commit('setTabLocked', settings.tabsLocked);
                    this.$store.commit('setMenuState', settings.separatedMenus);
                    this.canvasDimensions = settings.canvasDimensions;
                    this.setDragging(settings.dragEnabled);
                }

                // Sets the dimensions of the side menus.
                var menuDim = this.storage.get('dimensions');
                if (menuDim !== null)
                {
                    this.menu1Dimensions = lib.setMenuDimensions('menu1', null, menuDim.menu1.width, this.menu1Dimensions.height, menuDim.menu1.wp, 100);
                    this.menu2Dimensions = lib.setMenuDimensions('menu2', null, menuDim.menu2.width, this.menu2Dimensions.height, menuDim.menu2.wp, 100);
                }

                this.adaptFont();
            },

            mounted: function()
            {
                // Makes the current Vue scope available outside Vue components.
                // NOTE: This shouldn't be needed and the code should be refactored to remove it's need.
                app = this;
                this.canvasMode = this.getCanvasMode();

                // Initializes the element selection feature.
                this.initSelection(selectOptions);
                $('[data-toggle="tooltip"]').tooltip();

                $(document).mouseup(function(evt)
                {
                    $('.tooltip').tooltip('hide');
                    if (evt.which == 1)
                    {
                        app.endDrag();
                        app.closeMenu();
                    }
                });

                $(document).keydown(function(evt)
                {
                    if (evt.ctrlKey)
                    {
                        $('input').blur();
                        return false;
                    }
                    else if (evt.which == 27)
                    {
                        $('.tooltip').tooltip('hide');
                        if ($('.mesa-dialog').is(':visible'))
                            return;
                        if (app.isSelecting)
                            app.cancelSelection();
                        else
                            app.clearSelection();
                    }
                });

                $('button[data-toggle="tooltip"]').click(function()
                {
                    $('.tooltip').tooltip('hide');
                });

                $('.mesa-canvas').resizable({
                    start: function()
                    {
                        app.$store.commit('setResizing', true);
                    },

                    stop: function(evt, ui)
                    {
                        app.$store.commit('setResizing', false);
                        app.canvasDimensions.width = ui.size.width;
                        app.canvasDimensions.height = ui.size.height;
                        app.canvasMode = app.getCanvasMode();
                    }
                });

                $(window).resize(function()
                {
                    app.viewportWidth = getWidth();
                    app.viewportHeight = getHeight();
                    app.availableHeight = calculateHeight(app.viewportHeight);
                });

                $('#navbar-supported-content').on('hidden.bs.collapse', function()
                {
                    app.showMenuButton = true;
                });

                $('#navbar-supported-content').on('show.bs.collapse', function()
                {
                    app.showMenuButton = false;
                });

                $(document).ready(function()
                {
                    app.availableHeight = calculateHeight(app.viewportHeight);
                });
            },

            beforeUpdate: function()
            {
                if (this.form.id !== undefined)
                    this.formList[this.form.id].title = this.form.title;
            },

            updated: function()
            {
                this.adaptFont();
                configSearchBar(this.controls, this.selectElement, false);

                $('#form-select').attr('style', 'display: none !important');
                $('select').selectpicker();
                $('.dropdown').unbind();

                $('.dropdown').on('shown.bs.dropdown', function()
                {
                    $(this).find('.dropdown-menu li.active a').focus();
                });

                $(document).ready(function()
                {
                    $('.dropdown-toggle').attr('title', '');
                });
            }
        }
</script>

<style scoped></style>