import 'es6-promise/auto';
import Vue from 'vue';
import Vuex from 'vuex';

import cloneDeep from 'lodash/cloneDeep';

import portuguese from '@/lang/portuguese.json';
import english from '@/lang/english.json';

import lib from '@/lib';

Vue.use(Vuex);

// The IDs of the supported languages.
const COUNTRY_IDS = {
    pt: portuguese.language,
    us: english.language
};

// The supported languages.
const LANGS = setLangs();

// The default language.
const DEFAULT_LANG = english.language;

// All the supported label positionings.
const NO_LABEL = 'NL';
const LABEL_TOP_LEFT = 'TL';
const LABEL_TOP_CENTER = 'TC';
const LABEL_TOP_RIGHT = 'TR';
const LABEL_LEFT = 'L';
const LABEL_RIGHT = 'R';

//------------------------
// History management
//------------------------

var history = [];
var hIndex = -1;

var store;

/**
 * 
 */
function canUndo()
{
    return hIndex > 0;
}

/**
 * 
 */
function canRedo()
{
    return hIndex + 1 < history.length;
}

/**
 * 
 * @param {any} s
 */
function init(s)
{
    store = s;
}

/**
 *
 */
function resetHistory()
{
    store.state.savedStateId = 0;
    store.state.isSaved = true;
    history = [];
    hIndex = -1;
    window.onbeforeunload = function() {};
}

/**
 * 
 */
function updateActions()
{
    store.state.canUndo = canUndo();
    store.state.canRedo = canRedo();
    store.state.isSaved = hIndex == -1 || store.state.savedStateId == hIndex;
    if (store.state.isSaved)
        window.onbeforeunload = function() {};
    else
        window.onbeforeunload = function()
        {
            return '';
        };
}

/**
 * 
 * @param {any} state
 * @param {any} operation
 * @param {any} ignore
 */
function addState(state, operation, ignore)
{
    if (canRedo())
        history.splice(hIndex + 1);
    if (!ignore && store.state.savedStateId >= history.length)
        store.state.savedStateId = -1;
    var entry = {
        operation: operation,
        form: cloneDeep(state.form),
        controls: cloneDeep(state.controls)
    };
    history.push(entry);
    hIndex++;
    updateActions();
}

/**
 * 
 */
function setSelectedControls()
{
    var selected = store.state.selectedControls;
    store.state.selectedControls = {};
    for (let i in selected)
        if (store.state.controls[i] !== undefined)
            Vue.set(store.state.selectedControls, i, store.state.controls[i]);
}

/**
 * 
 */
function undo()
{
    if (!canUndo())
        return;
    var form = cloneDeep(history[hIndex - 1].form);
    store.state.form = form;
    store.state.formList[form.id] = form;
    store.state.controls = cloneDeep(history[hIndex - 1].controls);
    setSelectedControls();
    hIndex--;
    updateActions();
}

/**
 * 
 */
function redo()
{
    if (!canRedo())
        return;
    var form = cloneDeep(history[hIndex + 1].form);
    store.state.form = form;
    store.state.formList[form.id] = form;
    store.state.controls = cloneDeep(history[hIndex + 1].controls);
    setSelectedControls();
    hIndex++;
    updateActions();
}

/**
 * 
 * @param {any} store
 */
const undoRedoPlugin = (store) => {
    init(store);
}

//------------------------
// Utility functions
//------------------------

/**
 * 
 */
function setLangs()
{
    var langs = {};
    langs[COUNTRY_IDS.pt] = portuguese;
    langs[COUNTRY_IDS.us] = english;
    return langs;
}

/**
 * Checks if all selected controls are editable
 * @param {any} controls
 * @param {any} selectedControls
 * @param {any} checkItself
 */
function isEditable(controls, selectedControls, checkItself)
{
    for (let i in selectedControls)
        if (!lib.hasTabContainer(controls, i, checkItself))
            return true;
    return false;
}

/**
 * Selects the first visible tab
 * @param {any} controls
 * @param {any} currentTabId
 */
function selectOtherTab(controls, currentTabId)
{
    const tab = controls[currentTabId];
    const tabGroup = controls[tab.groupId];
    if (tabGroup.hidden)
        return;
    const children = tabGroup.children;
    for (let i = 0; i < children.length; i++)
        if (!controls[children[i]].hidden)
        {
            $('#' + children[i]).click();
            break;
        }
}

//------------------------
// State variables
//------------------------

const state = {
    editorIsReady: false,
    username: '',
    finishedCalls: {},
    lang: {},
    countryIds: COUNTRY_IDS,
    // Info about the current form.
    form: {},
    // The local storage.
    storage: {},
    // List of all available forms.
    formList: {},
    // All the controls in this form.
    controls: {},
    // Controls in the current selection.
    currentControls: {},
    // Controls selected before starting the current selection.
    previousControls: {},
    // All selected controls ((current ⋃ previous) \ (current ⋂ previous)).
    selectedControls: {},
    // Stores open/closed status of all containers in the component tree.
    openDroppables: {},
    selection: null,
    menu1Collapsed: false,
    menu2Collapsed: false,
    isSelecting: false,
    isResizing: false,
    isDragging: false,
    // True if the last drag operation made any changes to the order of the controls, false otherwise.
    changedByDrag: false,
    // The id of the component being dragged, null if isDragging == false.
    draggedEl: null,
    // The id of the element being hovered.
    hovered: '',
    groupStateId: 0,
    savedStateId: 0,
    formSelectId: 0,
    canUndo: canUndo(),
    canRedo: canRedo(),
    isSaved: true,
    isSaving: false,
    // Side menu is locked.
    menuLocked: false,
    // Tabs can be edited.
    tabsLocked: true,
    dragEnabled: true,
    // Side menu mode, it can be 0, 1 or 2. (0: both menus on the left, 1 and 2: one menu on the left and another on the right).
    separatedMenus: 0,
    // Canvas dimensions.
    previewDim: {
        width: 0,
        height: 0
    },
    labelAlignments: {
        hidden: NO_LABEL,
        topLeft: LABEL_TOP_LEFT,
        topCenter: LABEL_TOP_CENTER,
        topRight: LABEL_TOP_RIGHT,
        left: LABEL_LEFT,
        right: LABEL_RIGHT
    }
}

//------------------------
// Variable getters
//------------------------

const getters = {
    /**
     * Used for the progress bar. Stores alls the calls that must be done to load the necessary data from the server.
     * @param {any} state
     */
    totalCalls: function(state)
    {
        return Object.keys(state.finishedCalls).length;
    },

    /**
     * Used for the progress bar. Stores the calls that are still not finished.
     * @param {any} state
     */
    pendingCalls: function(state)
    {
        return Object.keys(state.finishedCalls).filter(c => !state.finishedCalls[c]).length;
    },

    /**
     * A tree of all the controls (used by nested-tree.vue).
     * @param {any} state
     */
    componentTree: function(state)
    {
        var componentList = [];
        lib.buildTree(componentList, state.controls, state.selectedControls, '', {}, state.openDroppables);
        return componentList;
    },

    /**
     * Returns an object with all the groups (including the main form), where the keys are
     * the IDs of the groups and the values are lists with their immediate children.
     * @param {any} state
     * @param {any} getters
     */
    groupChildren: function(state, getters)
    {
        var children = {};
        children[''] = lib.getGroupChildren(state.controls, '');
        for (let i in getters.groupList)
            children[i] = lib.getGroupChildren(state.controls, i);
        return children;
    },

    /**
     * Returns an object with all the groups, where the keys are the IDs of the groups and the
     * values are objects with a list of IDs of their parents and a list of IDs of their children.
     * @param {any} state
     */
    groupList: function(state)
    {
        var groups = {};
        var controlList = Object.values(state.controls).sort(function(a, b) { return a.field > b.field ? 1 : -1; });
        for (let i = 0; i < controlList.length; i++)
            if (lib.isContainer(controlList[i].ctrlType))
                groups[controlList[i].id] = { parents: [], children: [] };
        for (let id in groups)
        {
            let groupId = state.controls[id].groupId;
            while (groupId != '')
            {
                groups[id].parents.push(groupId);
                groups[groupId].children.push(id);
                groupId = state.controls[groupId].groupId;
            }
        }
        return groups;
    },

    /**
     * 
     * @param {any} state
     */
    selectionSize: function(state)
    {
        return Object.keys(state.selectedControls).length;
    },

    /**
     * 
     * @param {any} state
     */
    previousSelectionSize: function(state)
    {
        return Object.keys(state.previousControls).length;
    },

    /**
     * 
     * @param {any} state
     */
    currentSelectionSize: function(state)
    {
        return Object.keys(state.currentControls).length;
    },

    /**
     * 
     * @param {any} state
     * @param {any} getters
     */
    isHidden: function(state, getters)
    {
        return lib.hasProperty(state.selectedControls, getters.selectionSize, 'hidden');
    },

    /**
     * 
     * @param {any} state
     * @param {any} getters
     */
    existsWholeLine: function(state, getters)
    {
        return lib.hasProperty(state.selectedControls, getters.selectionSize, 'wholeLine');
    },

    /**
     * 
     * @param {any} state
     * @param {any} getters
     */
    existsBreak: function(state, getters)
    {
        return lib.hasProperty(state.selectedControls, getters.selectionSize, 'lineBreak');
    },

    /**
     * 
     * @param {any} state
     * @param {any} getters
     */
    existsJoin: function(state, getters)
    {
        return lib.hasProperty(state.selectedControls, getters.selectionSize, 'joined');
    },

    /**
     * Checks if all the selected controls are collapsible groups.
     * @param {any} state
     */
    isCollapsible: function(state)
    {
        var collapsible = lib.getProperty('collapsible', state.selectedControls, false);
        return collapsible === undefined ? false : collapsible;
    },

    /**
     * Returns the layout of the selected elements, or -1 if not all elements have the same layout.
     * @param {any} state
     */
    selectedLayout: function(state)
    {
        var layout = lib.getProperty('layout', state.selectedControls, -1);
        return layout === undefined ? -1 : layout;
    },

    /**
     * Returns the alignment of the selected elements, or -1 if not all elements have the same alignment.
     * @param {any} state
     */
    selectedAlignment: function(state)
    {
        var alignment = lib.getProperty('childAlign', state.selectedControls, -1);
        return alignment === undefined ? -1 : alignment;
    },

    /**
     * 
     * @param {any} state
     */
    selectedGroup: function(state)
    {
        return lib.getProperty('groupId', state.selectedControls, null);
    },

    /**
     * 
     * @param {any} state
     */
    htmlText: function(state)
    {
        return lib.getProperty('htmlText', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    selectedColumns: function(state)
    {
        return lib.getProperty('columns', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    lineNumber: function(state)
    {
        return lib.getProperty('lines', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    controlTypes: function(state)
    {
        return lib.getProperty('ctrlType', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    dataTypes: function(state)
    {
        return lib.getProperty('dataType', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    labelText: function(state)
    {
        return lib.getProperty('label', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    labelAlignment: function(state)
    {
        return lib.getProperty('labelAlign', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    areaWidth: function(state)
    {
        return lib.getProperty('width', state.selectedControls, '');
    },

    /**
     * 
     * @param {any} state
     */
    areaHeight: function(state)
    {
        return lib.getProperty('height', state.selectedControls, '');
    },

    /**
     * Returns the first element of the currently selected group. If no group is selected, or if multiple
     * groups are selected, returns the first element in the form.
     * @param {any} state
     * @param {any} getters
     */
    getFirst: function(state, getters)
    {
        const group = getters.selectionSize == 0 ? '' : getters.selectedGroup !== null ? getters.selectedGroup : '';
        return lib.findControl(state.controls, group, 'previous', false);
    },

    /**
     * Returns the last element of the currently selected group. If no group is selected, or if multiple
     * groups are selected, returns the last element in the form.
     * @param {any} state
     * @param {any} getters
     */
    getLast: function(state, getters)
    {
        const group = getters.selectionSize == 0 ? '' : getters.selectedGroup !== null ? getters.selectedGroup : '';
        return lib.findControl(state.controls, group, 'next', false);
    },

    /**
     * Returns the first visible element of the currently selected group. If no group is selected,
     * or if multiple groups are selected, returns the first element in the form.
     * @param {any} state
     * @param {any} getters
     */
    getFirstVisible: function(state, getters)
    {
        const group = getters.selectionSize == 0 ? '' : getters.selectedGroup !== null ? getters.selectedGroup : '';
        return lib.findControl(state.controls, group, 'previous', true);
    },

    /**
     * Returns the last visible element of the currently selected group. If no group is selected,
     * or if multiple groups are selected, returns the last element in the form.
     * @param {any} state
     * @param {any} getters
     */
    getLastVisible: function(state, getters)
    {
        const group = getters.selectionSize == 0 ? '' : getters.selectedGroup !== null ? getters.selectedGroup : '';
        return lib.findControl(state.controls, group, 'next', true);
    },

    /**
     * Returns the element previous to the selected one, or null if several or none are selected.
     * @param {any} state
     */
    getPrevious: function(state)
    {
        var selected = Object.keys(state.selectedControls);
        if (selected.length != 1)
            return null;
        return lib.getControl(state.controls, selected[0], 'previous');
    },

    /**
     * Returns the element next to the selected one, or null if several or none are selected.
     * @param {any} state
     */
    getNext: function(state)
    {
        var selected = Object.keys(state.selectedControls);
        if (selected.length != 1)
            return null;
        return lib.getControl(state.controls, selected[0], 'next');
    },

    /**
     * Checks if all the controls are currently selected.
     * @param {any} state
     * @param {any} getters
     */
    allAreSelected: function(state, getters)
    {
        var size = Object.keys(state.controls).length;
        return getters.selectionSize == size;
    },

    /**
     * Checks if no controls are currently selected.
     * @param {any} state
     * @param {any} getters
     */
    selectionIsClear: function(state, getters)
    {
        return getters.selectionSize == 0 && getters.previousSelectionSize == 0 && getters.currentSelectionSize == 0;
    },

    /**
     * 
     * @param {any} state
     * @param {any} getters
     */
    labelOptions: function(state, getters)
    {
        return {
            selected: getters.labelAlignment,
            options: [
                { id: state.labelAlignments.hidden, label: state.lang.keywords.label_hidden },
                { id: state.labelAlignments.topLeft, label: state.lang.keywords.top_left },
                { id: state.labelAlignments.topRight, label: state.lang.keywords.top_right },
                { id: state.labelAlignments.topCenter, label: state.lang.keywords.top_center },
                { id: state.labelAlignments.left, label: state.lang.keywords.left },
                { id: state.labelAlignments.right, label: state.lang.keywords.right }
            ]
        };
    },

    /**
     * The layout type of the selected controls, returns -1 if controls with different layouts are selected.
     * 0: flow, 1: grid, 2: list.
     * @param {any} state
     */
    layoutType: function(state)
    {
        var layout = -1;
        for (let i in state.selectedControls)
        {
            let groupId = state.controls[i].groupId;
            if (groupId == '')
            {
                if (layout == -1)
                    layout = state.form.layout;
                else if (layout != state.form.layout)
                    return -1;
            }
            else
            {
                if (layout == -1)
                    layout = state.controls[groupId].layout;
                else if (layout != state.controls[groupId].layout)
                    return -1;
            }
        }
        return layout;
    },

    /**
     * 
     * @param {any} state
     */
    isEditable: function(state)
    {
        if (!state.tabsLocked)
            return true;
        return isEditable(state.controls, state.selectedControls, false);
    },

    /**
     * 
     * @param {any} state
     */
    isEditableSelf: function(state)
    {
        if (!state.tabsLocked)
            return true;
        return isEditable(state.controls, state.selectedControls, true);
    },

    /**
     * Returns the number of characters of the selected controls. Returns 0 if the number of characters
     * differs between controls, or undefined if some control doesn't have the property "characters".
     * @param {any} state
     */
    maxCharacters: function(state)
    {
        if (lib.getProperty('characters', state.selectedControls) === undefined)
            return undefined;
        var characters;
        for (let i in state.selectedControls)
        {
            let length = state.controls[i].characters;
            if (characters === undefined)
                characters = length;
            else if (characters != length)
                return 0;
        }
        return characters;
    }
}

//------------------------
// Variable setters
//------------------------

/**
 * These mutations shouldn't be called directly outside this file, many
 * lack the necessary validations. Actions (below) should be used instead.
 */
const mutations = {
    /**
     * 
     * @param {any} state
     */
    incrementFormChangeId: function(state)
    {
        state.formSelectId++;
    },

    /**
     * 
     * @param {any} state
     * @param {any} call
     */
    setCall: function(state, call)
    {
        Vue.set(state.finishedCalls, call, false);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setCallState: function(state, { call, value })
    {
        state.finishedCalls[call] = value;
    },

    /**
     * 
     * @param {any} state
     */
    setEditorReady: function(state)
    {
        state.editorIsReady = true;
    },

    /**
     * 
     * @param {any} state
     * @param {any} username
     */
    setUsername: function(state, username)
    {
        state.username = username;
    },

    /**
     * 
     * @param {any} state
     * @param {any} lang
     */
    setLangData: function(state, lang)
    {
        state.lang = lang;
    },

    /**
     * 
     * @param {any} state
     * @param {any} storage
     */
    setStorageData: function(state, storage)
    {
        state.storage = storage;
        state.storage.setOptions({
            prefix: 'mesa_' + state.username + '_',
            driver: 'local',
            ttl: 31536000000
        });
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    storeValue: function(state, { key, value })
    {
        if (key === undefined || value === undefined)
            return;
        state.storage.set(key, value);
    },

    /**
     * If "force" is true, the entire storage is cleared, otherwise, only the values
     * whose key begins with the prefix specified in the settings will be deleted.
     * @param {any} state
     * @param {any} force
     */
    clearStorage: function(state, force)
    {
        state.storage.clear(force);
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    setSavingState: function(state, value)
    {
        state.isSaving = value;
    },

    /**
     * 
     * @param {any} state
     */
    saveState: function(state)
    {
        state.savedStateId = hIndex;
        state.isSaved = true;
    },

    /**
     * 
     * @param {any} state
     * @param {any} formList
     */
    setFormListData: function(state, formList)
    {
        state.formList = formList;
    },

    /**
     * 
     * @param {any} state
     * @param {any} form
     */
    setFormData: function(state, form)
    {
        state.form = form;
        resetHistory();
    },

    /**
     * 
     * @param {any} state
     * @param {any} title
     */
    setFormTitle: function(state, title)
    {
        state.form.title = title;
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    setMenuLocked: function(state, value)
    {
        state.menuLocked = value;
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    setTabLocked: function(state, value)
    {
        state.tabsLocked = value;
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    setMenuState: function(state, value)
    {
        state.separatedMenus = value;
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    menu1Collapse: function(state, value)
    {
        state.menu1Collapsed = value;
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    menu2Collapse: function(state, value)
    {
        state.menu2Collapsed = value;
    },

    /**
     * 
     * @param {any} state
     * @param {any} controls
     */
    setControls: function(state, controls)
    {
        state.controls = controls;
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    setResizing: function(state, value)
    {
        state.isResizing = value;
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setProperty: function(state, { prop, value })
    {
        var changedElements = 0;
        for (let i in state.selectedControls)
        {
            let control = state.controls[i];
            if (control[prop] !== undefined && control[prop] != value && (!state.tabsLocked || !lib.hasTabContainer(state.controls, i)))
            {
                control[prop] = value;
                changedElements++;
            }
        }
        if (changedElements == 0)
            throw 'No changes';
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setControlOrder: function(state, { controlId, order })
    {
        var control = state.controls[controlId];
        var index = control.order;
        var diff = index - order;
        if (diff == 0)
            return;
        if (diff < 0)
        {
            let next = control.next;
            let previous = control.previous;
            if (next === null)
            {
                control.order = order;
                control.order = index;
                return;
            }
            if (previous !== null)
                state.controls[previous].next = next;
            state.controls[next].previous = previous;
            while (next !== null)
            {
                state.controls[next].order = index++;
                let previous = next;
                next = state.controls[next].next;
                diff++;
                if (diff == 0 || next === null)
                {
                    control.order = index;
                    control.next = next;
                    control.previous = previous;
                    state.controls[previous].next = control.id;
                    if (next !== null)
                        state.controls[next].previous = control.id;
                    break;
                }
            }
        }
        else
        {
            let next = control.next;
            let previous = control.previous;
            if (previous === null)
            {
                control.order = order;
                control.order = index;
                return;
            }
            if (next !== null)
                state.controls[next].previous = previous;
            state.controls[previous].next = next;
            while (previous !== null)
            {
                state.controls[previous].order = index--;
                let next = previous;
                previous = state.controls[previous].previous;
                diff--;
                if (diff == 0 || previous === null)
                {
                    control.order = index;
                    control.next = next;
                    control.previous = previous;
                    state.controls[next].previous = control.id;
                    if (previous !== null)
                        state.controls[previous].next = control.id;
                    break;
                }
            }
        }
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setSelectedGroup: function(state, { groupId, groupList })
    {
        const group = state.controls[groupId];
        const orderedChildren = lib.getGroupChildren(state.controls, groupId);
        var lastChild = null;
        if (orderedChildren.length > 0)
            lastChild = orderedChildren[orderedChildren.length - 1].id;
        var controlList = [];
        for (let i in state.selectedControls)
            if (!state.tabsLocked || !lib.hasTabContainer(state.controls, i))
                controlList.push(state.controls[i]);
        controlList.sort(function(a, b) { return a.order - b.order; });
        var changedElements = 0;
        for (let i = 0; i < controlList.length; i++)
        {
            let control = state.controls[controlList[i].id];
            if (groupId == '' || lib.canBelongToGroup(control, group, groupList, false))
            {
                let previousGroup = control.groupId;
                control.groupId = groupId;
                let previousId = control.previous;
                let nextId = control.next;
                if (previousId !== null)
                    state.controls[previousId].next = nextId;
                if (nextId !== null)
                    state.controls[nextId].previous = previousId;
                lib.shiftControls(state.controls, nextId, control.order);
                if (groupId != '')
                    group.children.push(control.id);
                if (previousGroup != '')
                {
                    let previousChildren = state.controls[previousGroup].children;
                    let newChildren = [];
                    for (let j = 0; j < previousChildren.length; j++)
                        if (previousChildren[j] != control.id)
                            newChildren.push(previousChildren[j]);
                    state.controls[previousGroup].children = newChildren;
                }
                control.previous = lastChild;
                control.next = null;
                if (lastChild !== null)
                {
                    state.controls[lastChild].next = control.id;
                    control.order = state.controls[lastChild].order + 1;
                }
                else
                    control.order = 1;
                lastChild = control.id;
                changedElements++;
            }
            else
                state.groupStateId++;
        }
        if (changedElements == 0)
            throw 'No changes';
    },

    /**
     * 
     * @param {any} state
     * @param {any} group
     */
    addNewGroup: function(state, group)
    {
        var prevOrder = group.order;
        lib.parseControlTemplate(group);
        group.text = lib.getPlaceholderText(group);
        group.isContainer = true;
        group.children = [];
        group.order = 1;
        group.previous = null;
        group.next = null;
        let first = lib.findControl(state.controls, group.groupId, 'previous', false);
        let last = lib.findControl(state.controls, group.groupId, 'next', false);
        if (prevOrder.length == 0)
        {
            if (last !== null)
            {
                group.order = last.order + 1;
                group.previous = last.id;
            }
        }
        else
        {
            let order = parseInt(prevOrder);
            if (last !== null)
            {
                if (order < 1)
                    group.next = first.id;
                else if (order > last.order)
                    group.previous = last.id;
                else
                {
                    group.order = order;
                    let gap = 0;
                    for (let i in state.selectedControls)
                        if (state.controls[i].order < order)
                            gap++;
                    let nextControl = lib.getNthElement(state.controls, group.groupId, order + gap);
                    if (nextControl !== null)
                    {
                        group.previous = nextControl.previous;
                        group.next = nextControl.id;
                    }
                    else
                        group.previous = last.id;
                }
            }
            lib.shiftControls(state.controls, group.next, group.order + 1);
        }
        Vue.set(state.controls, group.id, group);
        if (group.previous !== null)
            state.controls[group.previous].next = group.id;
        if (group.next !== null)
            state.controls[group.next].previous = group.id;
        if (group.groupId != '')
            state.controls[group.groupId].children.push(group.id);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setFieldAlignment: function(state, { controlId, alignment })
    {
        if (controlId === undefined)
        {
            let changedElements = 0;
            for (let i in state.selectedControls)
                if (state.controls[i].childAlign != alignment && (!state.tabsLocked || !lib.hasTabContainer(state.controls, i)))
                {
                    state.controls[i].childAlign = alignment;
                    changedElements++;
                }
            if (changedElements == 0)
                throw 'No changes';
        }
        else if (controlId.length == 0)
            state.form.childAlign = alignment;
        else
            state.controls[controlId].childAlign = alignment;
    },

    /**
     * 
     * @param {any} state
     * @param {any} options
     */
    initSelectionState: function(state, options)
    {
        state.selection = Selection.create(options);
    },

    /**
     * 
     * @param {any} state
     */
    destroySelectionState: function(state)
    {
        if (state.selection !== null)
            state.selection.destroy();
        state.selection = null;
    },

    /**
     * 
     * @param {any} state
     */
    cancelSelectionState: function(state)
    {
        state.selection.cancel();
    },

    /**
     * 
     * @param {any} state
     */
    setAllSelected: function(state)
    {
        for (let i in state.controls)
            Vue.set(state.selectedControls, i, state.controls[i]);
    },

    /**
     * 
     * @param {any} state
     */
    setSelectionClear: function(state)
    {
        state.selectedControls = {};
        state.previousControls = {};
        state.currentControls = {};
    },

    /**
     * 
     * @param {any} state
     */
    setSelectionStart: function(state)
    {
        state.previousControls = {};
        state.currentControls = {};
        for (let i in state.selectedControls)
            Vue.set(state.previousControls, i, state.selectedControls[i]);
        state.isSelecting = true;
    },

    /**
     * 
     * @param {any} state
     */
    setSelectionStop: function(state)
    {
        state.previousControls = {};
        state.currentControls = {};
        state.isSelecting = false;
    },

    /**
     * 
     * @param {any} state
     * @param {any} id
     */
    setControlSelected: function(state, id)
    {
        Vue.set(state.currentControls, id, state.controls[id]);
        if (lib.containsControl(id, state.previousControls))
            Vue.delete(state.selectedControls, id);
        else
            Vue.set(state.selectedControls, id, state.controls[id]);
    },

    /**
     * 
     * @param {any} state
     * @param {any} id
     */
    setControlNotSelected: function(state, id)
    {
        Vue.delete(state.currentControls, id);
        if (lib.containsControl(id, state.previousControls))
            Vue.set(state.selectedControls, id, state.controls[id]);
        else
            Vue.delete(state.selectedControls, id);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setSelectedUp: function(state, { previous, next })
    {
        if (previous === null)
            return;
        let id = Object.keys(state.selectedControls)[0];
        let order = state.controls[id].order;
        state.controls[id].order = state.controls[previous].order;
        state.controls[previous].order = order;
        let newPrevious = state.controls[previous].previous;
        state.controls[id].previous = newPrevious;
        state.controls[previous].previous = id;
        state.controls[id].next = previous;
        state.controls[previous].next = next;
        if (next !== null)
            state.controls[next].previous = previous;
        if (newPrevious !== null)
            state.controls[newPrevious].next = id;
        lib.solveLineConflicts(state.controls[id], state.controls);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setSelectedDown: function(state, { previous, next })
    {
        if (next === null)
            return;
        let id = Object.keys(state.selectedControls)[0];
        let order = state.controls[id].order;
        state.controls[id].order = state.controls[next].order;
        state.controls[next].order = order;
        let newNext = state.controls[next].next;
        state.controls[id].next = newNext;
        state.controls[next].next = id;
        state.controls[id].previous = next;
        state.controls[next].previous = previous;
        if (previous !== null)
            state.controls[previous].next = next;
        if (newNext !== null)
            state.controls[newNext].previous = id;
        lib.solveLineConflicts(state.controls[id], state.controls);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    sendOutOfGroup: function(state, { controlList, groupId })
    {
        var parent;
        var parentId = groupId;
        while (parent === undefined)
        {
            let container = state.controls[parentId];
            parentId = container.groupId;
            if (parentId == '' || state.controls[parentId].ctrlType != lib.TAB_GROUP && state.controls[parentId].ctrlType != lib.ACCORDION)
                parent = container;
        }
        const group = state.controls[groupId];
        const groupPrevious = parent.previous;
        var order = parent.order;
        for (let i = 0; i < controlList.length; i++)
        {
            let previous = controlList[i].previous;
            let next = controlList[i].next;
            if (previous !== null)
                state.controls[previous].next = next;
            if (next !== null)  
                state.controls[next].previous = previous;
            if (controlList[i - 1] !== undefined)
                controlList[i].previous = controlList[i - 1].id;
            else
                controlList[i].previous = parent.previous;
            if (controlList[i + 1] !== undefined)
                controlList[i].next = controlList[i + 1].id;
            else
            {
                controlList[i].next = parent.id;
                parent.previous = controlList[i].id;
            }
            controlList[i].groupId = parentId;
            controlList[i].order = order++;
            lib.solveLineConflicts(controlList[i], state.controls);
        }
        var children = [];
        for (let i = 0; i < group.children.length; i++)
        {
            let found = false;
            for (let j = 0; j < controlList.length; j++)
                if (controlList[j].id == group.children[i])
                {
                    found = true;
                    break;
                }
            if (!found)
                children.push(group.children[i]);
        }
        group.children = children;
        if (groupPrevious !== null)
            state.controls[groupPrevious].next = controlList[0].id;
        var firstChild = lib.findControl(state.controls, groupId, 'previous', false);
        if (firstChild !== null)
            lib.shiftControls(state.controls, firstChild.id, 1);
        lib.shiftControls(state.controls, parent.id, order);
    },

    /**
     * 
     * @param {any} state
     * @param {any} id
     */
    setSelected: function(state, id)
    {
        Vue.set(state.selectedControls, id, state.controls[id]);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setWholeLine: function(state, { controlId, active })
    {
        if (controlId !== null)
        {
            let el = state.controls[controlId];
            el.wholeLine = active;
            lib.solveLineConflicts(el, state.controls);
        }
        else
            for (let i in state.selectedControls)
            {
                let el = state.controls[i];
                if (!state.tabsLocked || !lib.hasTabContainer(state.controls, i))
                    el.wholeLine = active;
                lib.solveLineConflicts(el, state.controls);
            }
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setJoined: function(state, { controlId, active, untoggle })
    {
        if (controlId !== null)
        {
            let el = state.controls[controlId];
            let layout = el.groupId == '' ? state.form.layout : state.controls[el.groupId].layout;
            if (layout != 1)
            {
                el.joined = active;
                lib.solveLineConflicts(el, state.controls);
            }
            else if (!untoggle)
                throw 'No changes';
        }
        else
        {
            let changedElements = 0;
            for (let i in state.selectedControls)
            {
                let el = state.controls[i];
                let layout = el.groupId == '' ? state.form.layout : state.controls[el.groupId].layout;
                if (layout != 1 && (!state.tabsLocked || !lib.hasTabContainer(state.controls, i)))
                {
                    el.joined = active;
                    changedElements++;
                }
                lib.solveLineConflicts(el, state.controls);
            }
            if (changedElements == 0 && !untoggle)
                throw 'No changes';
        }
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setLineBreak: function(state, { controlId, active, untoggle })
    {
        if (controlId !== null)
        {
            let el = state.controls[controlId];
            let layout = el.groupId == '' ? state.form.layout : state.controls[el.groupId].layout;
            if (layout < 2)
                el.lineBreak = active;
            else if (!untoggle)
                throw 'No changes';
        }
        else
        {
            let changedElements = 0;
            for (let i in state.selectedControls)
            {
                let el = state.controls[i];
                let layout = el.groupId == '' ? state.form.layout : state.controls[el.groupId].layout;
                if (layout < 2 && (!state.tabsLocked || !lib.hasTabContainer(state.controls, i)))
                {
                    el.lineBreak = active;
                    changedElements++;
                }
            }
            if (changedElements == 0 && !untoggle)
                throw 'No changes';
        }
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setHidden: function(state, { controlId, hidden })
    {
        if (controlId !== null)
        {
            let control = state.controls[controlId];
            control.hidden = hidden;
            if (control.hidden && control.ctrlType == lib.TAB)
                selectOtherTab(state.controls, control.id);
        }
        else
        {
            let changedElements = 0;
            for (let i in state.selectedControls)
            {
                let control = state.controls[i];
                if (!state.tabsLocked || !lib.hasTabContainer(state.controls, i))
                {
                    control.hidden = hidden;
                    changedElements++;
                }
                if (control.hidden && control.ctrlType == lib.TAB)
                    selectOtherTab(state.controls, control.id);
                lib.solveLineConflicts(control, state.controls);
            }
            if (changedElements == 0)
                throw 'No changes';
        }
    },

    /**
     * 
     * @param {any} state
     * @param {any} collapsible
     */
    setCollapsed: function(state, collapsible)
    {
        var changedElements = 0;
        for (let i in state.selectedControls)
        {
            let control = state.controls[i];
            if (control.collapsible != collapsible && (!state.tabsLocked || !lib.hasTabContainer(state.controls, i)))
            {
                control.collapsible = collapsible;
                lib.parseControlTemplate(state.controls[i]);
                if (collapsible)
                    control.dataType = 'ZC';
                else
                    control.dataType = 'ZN';
                control.helpType = control.dataType;
                changedElements++;
            }
        }
        if (changedElements == 0)
            throw 'No changes';
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    addControl: function(state, { controlId, row, index, groupId })
    {
        var siblings = [];
        if (groupId != '')
            siblings = state.controls[groupId].children;
        var control = state.controls[controlId];
        var previousId = control.previous;
        var nextId = control.next;
        var previous = row[index - 1];
        var next = row[index + 1];
        // Removes element from current group.
        if (previousId !== null)
            state.controls[previousId].next = nextId;
        if (nextId !== null)
        {
            state.controls[nextId].previous = previousId;
            lib.shiftControls(state.controls, nextId, control.order);
        }
        var oldGroup = control.groupId;
        if (oldGroup != '')
        {
            let elems = [];
            let oldChildren = state.controls[oldGroup].children;
            for (let i = 0; i < oldChildren.length; i++)
                if (oldChildren[i] != controlId)
                    elems.push(oldChildren[i]);
            state.controls[oldGroup].children = elems;
        }
        // Adds element to the new group.
        if (previous !== undefined)
        {
            let nextControl = previous.next;
            let order = previous.order + 1;
            previous.next = controlId;
            control.order = order++;
            control.next = nextControl;
            control.previous = previous.id;
            if (nextControl !== null)
                state.controls[nextControl].previous = controlId;
            lib.shiftControls(state.controls, nextControl, order);
        }
        else if (next !== undefined)
        {
            let previousControl = next.previous;
            let order = next.order;
            next.previous = controlId;
            control.order = order++;
            control.next = next.id;
            control.previous = previousControl;
            if (previousControl !== null)
                state.controls[previousControl].next = controlId;
            lib.shiftControls(state.controls, next.id, order);
        }
        else
        {
            control.order = 1;
            control.next = null;
            control.previous = null;
        }
        control.groupId = groupId;
        if (!lib.containsChild(siblings, controlId))
            siblings.push(controlId);
        if (nextId !== null)
            lib.solveLineConflicts(state.controls[nextId], state.controls);
        lib.solveLineConflicts(control, state.controls);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    moveControl: function(state, { controlId, row, oldIndex, newIndex })
    {
        var control = state.controls[controlId];
        var previousId = control.previous;
        var nextId = control.next;
        var newPreviousId = null;
        var newNextId = null;
        if (row[newIndex - 1] !== undefined)
        {
            newPreviousId = row[newIndex - 1].id;
            newNextId = row[newIndex - 1].next;
        }
        else if (row[newIndex + 1] !== undefined)
        {
            newPreviousId = row[newIndex + 1].previous;
            newNextId = row[newIndex + 1].id;
        }
        if (previousId !== null)
            state.controls[previousId].next = nextId;
        if (nextId !== null)
        {
            state.controls[nextId].previous = previousId;
            lib.solveLineConflicts(state.controls[nextId], state.controls);
        }
        if (newPreviousId !== null)
            state.controls[newPreviousId].next = controlId;
        if (newNextId !== null)
            state.controls[newNextId].previous = controlId;
        control.previous = newPreviousId;
        control.next = newNextId;
        var start = oldIndex > newIndex ? newIndex + 1 : newIndex;
        var startId = oldIndex > newIndex ? control.id : nextId;
        lib.shiftControls(state.controls, startId, row[start].order);
        lib.solveLineConflicts(control, state.controls);
    },

    /**
     * 
     * @param {any} state
     */
    dragStart: function(state)
    {
        state.selection.disable();
        state.isDragging = true;
    },

    /**
     * 
     * @param {any} state
     */
    dragEnd: function(state)
    {
        state.isDragging = false;
        state.selection.enable();
    },

    /**
     * 
     * @param {any} state
     * @param {any} value
     */
    setChangedByDrag: function(state, value)
    {
        state.changedByDrag = value;
    },

    /**
     * 
     * @param {any} state
     * @param {any} draggedEl
     */
    setDragged: function(state, draggedEl)
    {
        state.draggedEl = draggedEl;
    },

    /**
     * 
     * @param {any} state
     * @param {any} hovered
     */
    setHovered: function(state, hovered)
    {
        var control = state.controls[hovered];
        // If "hovered" corresponds to the id of a Tab, or a group that's inside an accordion,
        // sets "state.hovered" as the Tab group or the accordion, respectively.
        if (control !== undefined && control.groupId != '' && (control.ctrlType == lib.TAB || state.controls[control.groupId].ctrlType == lib.ACCORDION))
            state.hovered = control.groupId;
        else
            state.hovered = hovered;
    },

    /**
     * 
     * @param {any} state
     */
    resetDroppables: function(state)
    {
        state.openDroppables = {};
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    toggleDroppable: function(state, { id, value })
    {
        Vue.set(state.openDroppables, id, value);
    },

    /**
     * 
     * @param {any} state
     * @param {any} controlsTree
     */
    treeChange: function(state, controlsTree)
    {
        // Small hack to force the refresh of the elements tree.
        if (controlsTree === null)
        {
            let controls = state.controls;
            state.controls = {};
            state.controls = controls;
        }
        else
            state.controls = lib.buildControlsFromTree(controlsTree, state.controls);
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setColumns: function(state, { controlId, columns })
    {
        if (controlId === undefined)
        {
            let changedElements = 0;
            for (let i in state.selectedControls)
            {
                let control = state.controls[i];
                if (control.columns != columns && (!state.tabsLocked || !lib.hasTabContainer(state.controls, i)))
                {
                    control.columns = columns;
                    changedElements++;
                }
            }
            if (changedElements == 0)
                throw 'No changes';
        }
        else if (controlId.length == 0)
        {
            if (state.form.columns != columns)
                state.form.columns = columns;
            else
                throw 'No changes';
        }
        else if (state.controls[controlId].columns != columns)
            state.controls[controlId].columns = columns;
        else
            throw 'No changes';
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setCurrentLayout: function(state, { controlId, layout })
    {
        if (controlId === undefined)
        {
            let changedElements = 0;
            for (let i in state.selectedControls)
            {
                let control = state.controls[i];
                if (control.layout != layout && (!state.tabsLocked || !lib.hasTabContainer(state.controls, i)))
                {
                    control.layout = layout;
                    changedElements++;
                }
            }
            if (changedElements == 0)
                throw 'No changes';
        }
        else if (controlId.length == 0)
            state.form.layout = layout;
        else
            state.controls[controlId].layout = layout;
    },

    /**
     * 
     * @param {any} state
     * @param {any} drag
     */
    setDraggingMode: function(state, drag)
    {
        state.dragEnabled = drag;
    },

    /**
     * 
     * @param {any} state
     * @param {any} param1
     */
    setPreviewDim: function(state, { width, height })
    {
        state.previewDim.width = width;
        state.previewDim.height = height;
    },

    /**
     * 
     * @param {any} state
     */
    updateGroupList: function(state)
    {
        state.groupStateId++;
    },

    /**
     * 
     * @param {any} state
     * @param {any} controlId
     */
    deleteControl: function(state, controlId)
    {
        var control = state.controls[controlId];
        var previousId = control.previous;
        var nextId = control.next;
        if (previousId !== null)
            state.controls[previousId].next = nextId;
        if (nextId !== null)
            state.controls[nextId].previous = previousId;
        if (control.groupId != '')
        {
            let children = [];
            let group = state.controls[control.groupId];
            for (let i = 0; i < group.children.length; i++)
                if (group.children[i] != controlId)
                    children.push(group.children[i]);
            group.children = children;
        }
        lib.shiftControls(state.controls, nextId, control.order);
        Vue.delete(state.selectedControls, controlId);
        Vue.delete(state.controls, controlId);
    }
}

//------------------------
// Actions
//------------------------

const actions = {
    /**
     * 
     * @param {any} param0
     * @param {any} storage
     */
    initFormEditor: function({ state, commit, dispatch }, storage)
    {
        return Vue.axios.get(PATHS.getUsername).then(response =>
        {
            commit('setUsername', response.data.Data);
            commit('setCallState', { call: 'setUsername', value: true });
            dispatch('setStorage', storage);
            dispatch('setLang', false);
            dispatch('setupData');
        }).catch(response =>
        {
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.network_error);
        });
    },

    /**
     * 
     * @param {any} param0
     */
    setupData: async function({ dispatch })
    {
        await dispatch('setFormList');
        dispatch('setForm');
    },

    /**
     * 
     * @param {any} param0
     * @param {any} useDefault
     */
    setLang: function({ state, commit, dispatch }, useDefault)
    {
        if (useDefault)
        {
            commit('setLangData', LANGS[DEFAULT_LANG]);
            commit('setCallState', { call: 'setLang', value: true });
        }
        else if (state.storage.has('langId'))
        {
            var lang = state.storage.get('langId');
            if (LANGS[lang] === undefined)
            {
                lang = DEFAULT_LANG;
                dispatch('storeLang', lang);
            }
            commit('setLangData', LANGS[lang]);
            commit('setCallState', { call: 'setLang', value: true });
        }
        else
        {
            Vue.axios.get(PATHS.getLang).then(response =>
            {
                var lang = response.data.Data;
                if (LANGS[lang] === undefined)
                    lang = DEFAULT_LANG;
                commit('setLangData', LANGS[lang]);
                dispatch('storeLang', lang);
                commit('setCallState', { call: 'setLang', value: true });
            }).catch(response =>
            {
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.network_error);
            });
        }
    },

    /**
     * 
     * @param {any} param0
     */
    setFormList: function({ state, commit })
    {
        return Vue.axios.get(PATHS.formList).then(response =>
        {
            var formList = lib.initFormList(response.data.Data);
            commit('setFormListData', formList);
            commit('setCallState', { call: 'setFormList', value: true });
        }).catch(response =>
        {
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.network_error);
        });
    },

    /**
     * Loads the controls of the desired form. If a form guid is passed as an argument in the url, the form with that
     * guid will be loaded, otherwise it searches for a guid in the local storage and loads the respective form.
     * If no guid is found or no form has that guid, it will load the first form in the system, by alphabetical order.
     * @param {any} param0
     * @param {any} form
     */
    setForm: function({ state, commit }, form)
    {
        var storageKey = 'mesa_' + state.username + '_form';
        if (form === undefined)
        {
            let f = null;
            let url = new URL(window.location.href);
            let formGuid = url.searchParams.get('form');
            if (formGuid === null)
                formGuid = localStorage.getItem(storageKey);
            if (formGuid !== null)
                for (let i in state.formList)
                    if (state.formList[i].formGuid == formGuid)
                    {
                        f = state.formList[i];
                        break;
                    }
            if (f === null)
                form = state.formList[Object.keys(state.formList)[0]];
            else
                form = f;
        }

        return Vue.axios.get(PATHS.loadForm + '?guid=' + form.formGuid).then(response =>
        {
            var controls = lib.initControls(response.data.Data);
            if (Object.keys(state.form).length > 0 && !state.isSaved)
            {
                $('#leave-confirm-window').dialog({
                    draggable: true,
                    resizable: false,
                    autoOpen: true,
                    modal: true,
                    buttons: [
                        {
                            text: state.lang.keywords.no,
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
                            text: state.lang.keywords.yes,
                            open: function()
                            {
                                $(this).addClass('dialog-success-button');
                            },
                            click: function()
                            {
                                commit('setSelectionClear');
                                commit('setFormData', form);
                                commit('setControls', controls);
                                commit('resetDroppables');
                                addState(state, 'setForm', true);
                                localStorage.setItem(storageKey, form.formGuid);
                                $(this).dialog('close');
                            }
                        }
                    ],
                    show: lib.DIALOG_CONFIG,
                    hide: lib.DIALOG_CONFIG
                });
                lib.arrangeDialog();
                $('.ui-button').attr('title', '');
                $('#leave-confirm-window').on('dialogclose', function()
                {
                    commit('incrementFormChangeId');
                });
            }
            else
            {
                commit('setSelectionClear');
                commit('setFormData', form);
                commit('setControls', controls);
                commit('resetDroppables');
                addState(state, 'setForm', true);
                localStorage.setItem(storageKey, form.formGuid);
            }
            $(document).ready(lib.arrangeFlowLayout);
            commit('setCallState', { call: 'setForm', value: true });
            commit('setEditorReady');
        }).catch(response =>
        {
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.network_error);
        });
    },

    /**
     * 
     * @param {any} param0
     */
    saveChanges: function({ state, commit })
    {
        if (!state.isSaved && !state.isSaving)
        {
            commit('setSavingState', true);
            const headers = {
                '__RequestVerificationToken': $('[name="__RequestVerificationToken"]').first().val()
            };
            let form = cloneDeep(state.form);
            form.controls = lib.getControlList(cloneDeep(state.controls));
            Vue.axios.post(PATHS.saveForm, { form: JSON.stringify(form) }, { headers }).then(response =>
            {
                if (response.data.Success)
                {
                    commit('saveState');
                    window.onbeforeunload = function() {};
                    lib.showNotification('success', state.lang.keywords.success_title, state.lang.keywords.save_success_text);
                }
                else
                    lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.save_error_text);
                commit('setSavingState', false);
            }).catch(response =>
            {
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.network_error);
                commit('setSavingState', false);
            });
        }
    },

    /**
     * 
     * @param {any} param0
     * @param {any} title
     */
    setFormTitle: function({ state, commit }, title)
    {
        if (state.isSaving)
            return;
        if (state.form.title != title)
        {
            commit('setFormTitle', title);
            addState(state, 'setFormTitle');
        }
    },

    /**
     * 
     * @param {any} param0
     * @param {any} storage
     */
    setStorage: function({ commit }, storage)
    {
        commit('setStorageData', storage);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} data
     */
    setProperty: function({ state, getters, commit }, data)
    {
        if (state.isSaving)
            return;
        if (getters.isEditable)
        {
            try
            {
                commit('setProperty', data);
                addState(state, 'setProperty');
            }
            catch (e)
            {}
        }
        else
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} data
     */
    setOrder: function({ state, commit }, data)
    {
        if (state.isSaving)
            return;
        if (!state.tabsLocked || !lib.hasTabContainer(state.controls, data.controlId))
        {
            let order = state.controls[data.controlId].order;
            commit('setControlOrder', data);
            if (order != state.controls[data.controlId].order)
            {
                addState(state, 'setOrder');
                $(document).ready(function()
                {
                    lib.scrollToElement(state.controls, data.controlId, true, true);
                });
            }
        }
        else
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} groupId
     */
    changeGroup: function({ state, getters, commit, dispatch }, groupId)
    {
        if (state.isSaving)
            return;
        try
        {
            if (!state.tabsLocked || !lib.hasTabContainer(state.controls, groupId, true))
            {
                commit('setSelectedGroup', { groupId: groupId, groupList: getters.groupList });
                let focusedId = getters.getLastVisible.id;
                dispatch('openDroppablePath', focusedId);
                addState(state, 'changeGroup');
                $(document).ready(function()
                {
                    lib.scrollToElement(state.controls, focusedId, !state.menu2Collapsed || state.separatedMenus != 1, true);
                });
            }
            else
            {
                commit('updateGroupList');
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            }
        }
        catch (e)
        {
            commit('updateGroupList');
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.group_change_error);
        }
    },

    /**
     * Used by mesa-draggable.vue, it's called when the user drags an element that isn't joined with another.
     * @param {any} param0
     * @param {any} data
     */
    addControl: function({ state, commit }, data)
    {
        if (state.isSaving)
            return;
        if (!state.tabsLocked || !lib.hasTabContainer(state.controls, data.controlId) && (data.groupId == '' || !lib.hasTabContainer(state.controls, data.groupId, true)))
        {
            for (var i = 0; i < data.row.length; i++)
                if (data.row[i].id == data.controlId)
                    break;
            var order = data.row[i].order;
            var group = data.row[i].groupId;
            commit('addControl', data);
            if (order != data.row[i].order || group != data.row[i].groupId)
            {
                commit('setChangedByDrag', true);
                addState(state, 'addControl');
                $(document).ready(function()
                {
                    lib.scrollToElement(state.controls, data.controlId, !state.menu2Collapsed || state.separatedMenus != 1, false);
                });
            }
        }
        else
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
    },

    /**
     * Used by mesa-draggable.vue, it's called when the user drags an element that is joined with another.
     * @param {any} param0
     * @param {any} data
     */
    moveControl: function({ state, commit }, data)
    {
        if (state.isSaving)
            return;
        if (!state.tabsLocked || !lib.hasTabContainer(state.controls, data.controlId))
        {
            for (var i = 0; i < data.row.length; i++)
                if (data.row[i].id == data.controlId)
                    break;
            var order = data.row[i].order;
            var group = data.row[i].groupId;
            commit('moveControl', data);
            if (order != data.row[i].order || group != data.row[i].groupId)
            {
                commit('setChangedByDrag', true);
                addState(state, 'moveControl');
                $(document).ready(function()
                {
                    lib.scrollToElement(state.controls, data.controlId, !state.menu2Collapsed || state.separatedMenus != 1, false);
                });
            }
        }
        else
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} options
     */
    initSelection: function({ commit }, options)
    {
        commit('initSelectionState', options);
        commit('setSelectionClear');
    },

    /**
     * 
     * @param {any} param0
     */
    destroySelection: function({ commit })
    {
        commit('setSelectionClear');
        commit('destroySelectionState');
    },

    /**
     * 
     * @param {any} param0
     */
    clearSelection: function({ state, getters, commit })
    {
        if (!getters.selectionIsClear && !state.isDragging)
            commit('setSelectionClear');
    },

    /**
     * 
     * @param {any} param0
     */
    startSelecting: function({ state, commit })
    {
        if (!state.isDragging)
            commit('setSelectionStart');
    },

    /**
     * 
     * @param {any} param0
     */
    stopSelecting: function({ commit })
    {
        commit('setSelectionStop');
    },

    /**
     * 
     * @param {any} param0
     */
    cancelSelection: function({ state, commit })
    {
        if (state.isSelecting)
        {
            for (let i in state.currentControls)
                commit('setControlNotSelected', i);
            commit('setSelectionStop');
            commit('cancelSelectionState');
        }
    },

    /**
     * 
     * @param {any} param0
     * @param {any} id
     */
    selectControl: function({ state, commit, dispatch }, id)
    {
        if (!state.isDragging)
        {
            commit('setControlSelected', id);
            dispatch('openDroppablePath', id);
        }
    },

    /**
     * 
     * @param {any} param0
     * @param {any} id
     */
    unselectControl: function({ state, commit, dispatch }, id)
    {
        if (!state.isDragging)
        {
            commit('setControlNotSelected', id);
            dispatch('openDroppablePath', id);
        }
    },

    /**
     * 
     * @param {any} param0
     * @param {any} id
     */
    updateSelectionFromTree: function({ state, dispatch }, id)
    {
        if (lib.containsControl(id, state.selectedControls))
            dispatch('unselectControl', id);
        else
            dispatch('selectControl', id);
        lib.scrollToElement(state.controls, id, false, true);
        $(document).ready(function()
        {
            lib.animateElement('#' + id, 'pulse');
        });
    },

    /**
     * 
     * @param {any} param0
     * @param {any} id
     */
    updateSelection: function({ state, dispatch }, id)
    {
        if (lib.containsControl(id, state.currentControls))
            dispatch('unselectControl', id);
        else
            dispatch('selectControl', id);
        const style = $('.selection').attr('style');
        if (style !== undefined && style.indexOf('display') == -1 || !$('.selection').is(':visible'))
        {
            lib.scrollToElement(state.controls, id, !state.menu2Collapsed || state.separatedMenus != 1, false);
            $(document).ready(function()
            {
                lib.animateElement('#branch-' + id, 'shake');
            });
        }
    },

    /**
     * 
     * @param {any} param0
     */
    selectAll: function({ getters, commit })
    {
        if (!getters.allAreSelected)
        {
            commit('setSelectionClear');
            commit('setAllSelected');
        }
    },

    /**
     * 
     * @param {any} param0
     */
    selectPrevious: function({ state, getters, commit, dispatch })
    {
        if (getters.selectionSize == 0)
            dispatch('selectLast');
        else if (getters.selectionSize == 1)
        {
            if (getters.getPrevious === null)
                dispatch('selectLast');
            else
            {
                const id = getters.getPrevious.id;
                commit('setSelectionClear');
                commit('setSelected', id);
                dispatch('openDroppablePath', id);
                lib.scrollToElement(state.controls, id, !state.menu2Collapsed || state.separatedMenus != 1, true);
            }
        }
    },

    /**
     * 
     * @param {any} param0
     */
    selectNext: function({ state, getters, commit, dispatch })
    {
        if (getters.selectionSize == 0)
            dispatch('selectFirst');
        else if (getters.selectionSize == 1)
        {
            if (getters.getNext === null)
                dispatch('selectFirst');
            else
            {
                const id = getters.getNext.id;
                commit('setSelectionClear');
                commit('setSelected', id);
                dispatch('openDroppablePath', id);
                lib.scrollToElement(state.controls, id, !state.menu2Collapsed || state.separatedMenus != 1, true);
            }
        }
    },

    /**
     * 
     * @param {any} param0
     */
    selectFirst: function({ state, getters, commit, dispatch })
    {
        const id = getters.getFirstVisible.id;
        commit('setSelectionClear');
        commit('setSelected', id);
        dispatch('openDroppablePath', id);
        lib.scrollToElement(state.controls, id, !state.menu2Collapsed || state.separatedMenus != 1, true);
    },

    /**
     * 
     * @param {any} param0
     */
    selectLast: function({ state, getters, commit, dispatch })
    {
        const id = getters.getLastVisible.id;
        commit('setSelectionClear');
        commit('setSelected', id);
        dispatch('openDroppablePath', id);
        lib.scrollToElement(state.controls, id, !state.menu2Collapsed || state.separatedMenus != 1, true);
    },

    /**
     * If the currently selected element is a group, selects the first element inside that group instead.
     * @param {any} param0
     */
    goIn: function({ state, getters, commit, dispatch })
    {
        if (getters.selectionSize == 1)
        {
            let groupId = Object.keys(state.selectedControls)[0];
            let group = state.controls[groupId];
            if (group.isContainer && group.children.length > 0)
            {
                let id = lib.findControl(state.controls, groupId, 'previous', true).id;
                commit('setSelectionClear');
                commit('setSelected', id);
                dispatch('openDroppablePath', id);
                lib.scrollToElement(state.controls, id, !state.menu2Collapsed || state.separatedMenus != 1, true);
            }
        }
    },

    /**
     * If all the currently selected elements are inside the same group, selects that group instead.
     * @param {any} param0
     */
    comeOut: function({ state, getters, commit, dispatch })
    {
        if (getters.selectedGroup !== null && getters.selectedGroup != '')
        {
            let id = Object.keys(state.selectedControls)[0];
            commit('setSelectionClear');
            commit('setSelected', state.controls[id].groupId);
            dispatch('openDroppablePath', state.controls[id].groupId);
            lib.scrollToElement(state.controls, state.controls[id].groupId, !state.menu2Collapsed || state.separatedMenus != 1, true);
        }
    },

    /**
     * Switches the currently selected element with the previous one.
     * @param {any} param0
     */
    selectedUp: function({ state, getters, commit, dispatch })
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize > 0)
            if (getters.selectionSize == 1 && !getters.isHidden)
            {
                let controlId = Object.keys(state.selectedControls)[0];
                if (!state.tabsLocked || !lib.hasTabContainer(state.controls, controlId))
                {
                    let previous = getters.getPrevious;
                    let next = getters.getNext;
                    if (previous !== null)
                    {
                        commit('setSelectedUp', { previous: previous.id, next: next !== null ? next.id : null });
                        dispatch('openDroppablePath', controlId);
                        addState(state, 'selectedUp');
                        $(document).ready(function()
                        {
                            lib.scrollToElement(state.controls, controlId, !state.menu2Collapsed || state.separatedMenus != 1, true);
                        });
                    }
                    else
                        lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
                }
                else
                    lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            }
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
    },

    /**
     * Switches the currently selected element with the next one.
     * @param {any} param0
     */
    selectedDown: function({ state, getters, commit, dispatch })
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize > 0)
            if (getters.selectionSize == 1 && !getters.isHidden)
            {
                let controlId = Object.keys(state.selectedControls)[0];
                if (!state.tabsLocked || !lib.hasTabContainer(state.controls, controlId))
                {
                    let previous = getters.getPrevious;
                    let next = getters.getNext;
                    if (next !== null)
                    {
                        commit('setSelectedDown', { previous: previous !== null ? previous.id : null, next: next.id });
                        dispatch('openDroppablePath', controlId);
                        addState(state, 'selectedDown');
                        $(document).ready(function()
                        {
                            lib.scrollToElement(state.controls, controlId, !state.menu2Collapsed || state.separatedMenus != 1, true);
                        });
                    }
                    else
                        lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
                }
                else
                    lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            }
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
    },

    /**
     * If all the currently selected elements are inside the same group, they are taken out of that group, making them siblings instead of children.
     * The elements are inserted before the group and their order is maintained.
     * @param {any} param0
     */
    changeLevelUp: function({ state, getters, commit, dispatch })
    {
        if (state.isSaving)
            return;
        const groupId = getters.selectedGroup;
        if (getters.selectionSize > 0)
            if (!getters.isHidden && groupId !== null && groupId != '')
                if (getters.isEditable)
                {
                    let controlList = [];
                    for (let i in state.selectedControls)
                        if (!state.tabsLocked || !lib.hasTabContainer(state.controls, i))
                            controlList.push(state.controls[i]);
                    if (controlList.length == 0)
                        return;
                    controlList.sort(function(a, b) { return a.order - b.order; });
                    commit('sendOutOfGroup', { controlList: controlList, groupId: groupId });
                    dispatch('openDroppablePath', controlList[0].id);
                    addState(state, 'changeLevelUp');
                    $(document).ready(function()
                    {
                        lib.scrollToElement(state.controls, controlList[0].id, !state.menu2Collapsed || state.separatedMenus != 1, true);
                    });
                }
                else
                    lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
    },

    /**
     * If the element immediately after the currently selected one is a group, makes the selected element a child of that group, inserting it at the end.
     * @param {any} param0
     */
    changeLevelDown: function({ state, getters, commit, dispatch })
    {
        if (state.isSaving)
            return;
        const next = getters.getNext;
        if (getters.selectionSize > 0)
            if (getters.selectionSize == 1 && !getters.isHidden && next !== null && next.isContainer)
                if (!state.tabsLocked || !lib.hasTabContainer(state.controls, next.id, true))
                {
                    let currentId = next.previous;
                    commit('setSelectedGroup', { groupId: next.id, groupList: getters.groupList });
                    lib.solveLineConflicts(state.controls[currentId], state.controls);
                    dispatch('openDroppablePath', Object.keys(state.selectedControls)[0]);
                    addState(state, 'changeLevelDown');
                    $(document).ready(function()
                    {
                        lib.scrollToElement(state.controls, Object.keys(state.selectedControls)[0], !state.menu2Collapsed || state.separatedMenus != 1, true);
                    });
                }
                else
                    lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
    },

    /**
     * 
     * @param {any} param0
     */
    toggleMenuLock: function({ state, commit })
    {
        commit('setMenuLocked', !state.menuLocked);
    },

    /**
     * 
     * @param {any} param0
     */
    toggleTabLock: function({ state, commit })
    {
        commit('setTabLocked', !state.tabsLocked);
    },

    /**
     * Toggles the specified option box, which can be any of the layout rule boxes (line break, joined or whole line).
     * @param {any} param0
     * @param {any} param1
     */
    toggleBoxes: function({ state, getters, commit }, { controlId, isChecked, toggle, untoggles, force })
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize > 0 || force)
            if (getters.isEditable || force)
                if (controlId === null || !state.tabsLocked || !lib.hasTabContainer(state.controls, controlId))
                {
                    let values = {};

                    // Keeps old values of selected elements.
                    if (controlId === null)
                        for (let i in state.selectedControls)
                        {
                            let control = state.controls[i];
                            values[i] = { 'break': control.lineBreak, 'join': control.joined, 'fill': control.wholeLine };
                        }

                    try
                    {
                        for (let i = 0; i < untoggles.length; i++)
                            commit(untoggles[i], { controlId: controlId, active: false, untoggle: true });
                        commit(toggle, { controlId: controlId, active: !isChecked, untoggle: false });
                        addState(state, toggle);
                    }
                    catch (e)
                    {
                        // Restores old values of selected elements when something goes wrong.
                        for (let i in values)
                        {
                            let control = state.controls[i];
                            control.lineBreak = values[i].break;
                            control.wholeLine = values[i].fill;
                            control.joined = values[i].join;
                        }
                        lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
                    }
                }
                else
                    lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} param1
     */
    fillLine: function({ state, getters, dispatch }, { id, force })
    {
        var controlId = typeof id == 'string' ? id : null;
        var isChecked = controlId === null ? getters.existsWholeLine : state.controls[controlId].wholeLine;
        dispatch('toggleBoxes', { controlId: controlId, isChecked: isChecked, toggle: 'setWholeLine', untoggles: ['setLineBreak', 'setJoined'], force: force });
    },

    /**
     * 
     * @param {any} param0
     * @param {any} param1
     */
    joinLine: function({ state, getters, dispatch }, { id, force })
    {
        var controlId = typeof id == 'string' ? id : null;
        var isChecked = controlId === null ? getters.existsJoin : state.controls[controlId].joined;
        dispatch('toggleBoxes', { controlId: controlId, isChecked: isChecked, toggle: 'setJoined', untoggles: ['setLineBreak', 'setWholeLine'], force: force });
    },

    /**
     * 
     * @param {any} param0
     * @param {any} param1
     */
    breakLine: function({ state, getters, dispatch }, { id, force })
    {
        var controlId = typeof id == 'string' ? id : null;
        var isChecked = controlId === null ? getters.existsBreak : state.controls[controlId].lineBreak;
        dispatch('toggleBoxes', { controlId: controlId, isChecked: isChecked, toggle: 'setLineBreak', untoggles: ['setJoined', 'setWholeLine'], force: force });
    },

    /**
     * 
     * @param {any} param0
     * @param {any} param1
     */
    toggleVisibility: function({ state, getters, commit }, { id, force })
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize > 0 || force)
            if (getters.isEditable || force)
            {
                let controlId = typeof id == 'string' ? id : null;
                let hidden = controlId !== null ? !state.controls[controlId].hidden : !getters.isHidden;
                try
                {
                    commit('setHidden', { controlId, hidden });
                    addState(state, 'toggleVisibility');
                }
                catch (e)
                {}
            }
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
    },

    /**
     * 
     * @param {any} param0
     */
    toggleCollapsibility: function({ state, getters, commit })
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize > 0)
            if (getters.controlTypes == lib.GROUPBOX)
                if (getters.isEditable)
                {
                    try
                    {
                        commit('setCollapsed', !getters.isCollapsible);
                        addState(state, 'toggleCollapsibility');
                    }
                    catch (e)
                    {}
                }
                else
                    lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} labelAlign
     */
    alignLabels: function({ state, getters, commit }, labelAlign)
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize > 0)
            if (getters.isEditable)
            {
                try
                {
                    commit('setProperty', { prop: 'labelAlign', value: labelAlign });
                    addState(state, 'alignLabels');
                }
                catch (e)
                {}
            }
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} param1
     */
    alignFields: function({ state, getters, commit }, { controlId, alignment })
    {
        if (state.isSaving)
            return;
        if (controlId === undefined && getters.selectionSize == 0)
            return;
        if (controlId !== undefined && controlId.length > 0 && state.tabsLocked && lib.hasTabContainer(state.controls, controlId))
        {
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            return;
        }
        try
        {
            commit('setFieldAlignment', { controlId, alignment });
            addState(state, 'alignFields');
            lib.showNotification('success', state.lang.keywords.success_title, state.lang.keywords.alignment_change + ' ' + state.lang.keywords.alignment_types[alignment]);
        }
        catch (e)
        {
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
        }
    },

    /**
     * 
     * @param {any} param0
     */
    startDrag: function({ state, getters, commit })
    {
        if (!state.isDragging && !state.isSelecting && getters.selectionSize == 1)
        {
            commit('dragStart');
            commit('setChangedByDrag', false);
        }
    },

    /**
     * 
     * @param {any} param0
     */
    endDrag: function({ state, commit })
    {
        if (state.isDragging)
            commit('dragEnd');
    },

    /**
     * 
     * @param {any} param0
     * @param {any} param1
     */
    changeTree: function({ state, getters, commit }, { control, group, tree })
    {
        if (state.isSaving)
            return;
        var success = false;
        if (lib.canBelongToGroup(control, group, getters.groupList, true))
            if ((group === undefined || !state.tabsLocked || !lib.hasTabContainer(state.controls, group.id, true)) && (control === undefined || !state.tabsLocked || !lib.hasTabContainer(state.controls, control.id)))
            {
                commit('treeChange', tree);
                addState(state, 'changeTree');
                success = true;
            }
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
        else
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
        if (!success)
            commit('treeChange', null);
    },

    /**
     * 
     * @param {any} param0
     */
    undo: function({ state })
    {
        if (state.isSaving)
            return;
        if (canUndo())
            undo();
    },

    /**
     * 
     * @param {any} param0
     */
    redo: function({ state })
    {
        if (state.isSaving)
            return;
        if (canRedo())
            redo();
    },

    /**
     * 
     * @param {any} param0
     * @param {any} lang
     */
    storeLang: function({ commit }, lang)
    {
        commit('storeValue', { key: 'langId', value: lang });
    },

    /**
     * 
     * @param {any} param0
     * @param {any} settings
     */
    storeSettings: function({ commit }, settings)
    {
        commit('storeValue', { key: 'settings', value: settings });
    },

    /**
     * 
     * @param {any} param0
     * @param {any} dimensions
     */
    storeMenuDimensions: function({ commit }, dimensions)
    {
        commit('storeValue', { key: 'dimensions', value: dimensions });
    },

    /**
     * 
     * @param {any} param0
     * @param {any} group
     */
    createGroup: function({ state, getters, commit, dispatch }, group)
    {
        if (state.isSaving)
            return;
        commit('addNewGroup', group);
        try
        {
            commit('setSelectedGroup', { groupId: group.id, groupList: getters.groupList });
        }
        catch (e)
        {}
        dispatch('openDroppablePath', group.id);
        addState(state, 'createGroup');
        lib.callDialogsOp('close');
        $(document).ready(function()
        {
            lib.scrollToElement(state.controls, group.id, !state.menu2Collapsed || state.separatedMenus != 1, true);
        });
        lib.showNotification('success', state.lang.keywords.success_title, state.lang.keywords.group_create_success);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} groupId
     */
    deleteGroup: function({ state, commit, dispatch }, groupId)
    {
        if (state.isSaving)
            return;
        if (groupId !== undefined && groupId != '' && state.controls[groupId].ctrlType == lib.GROUPBOX)
            if (!state.tabsLocked || !lib.hasTabContainer(state.controls, groupId))
            {
                let controlList = [];
                let group = state.controls[groupId];
                for (let i = 0; i < group.children.length; i++)
                    if (!state.tabsLocked || !lib.hasTabContainer(state.controls, group.children[i]))
                        controlList.push(state.controls[group.children[i]]);
                let focusedId;
                if (controlList.length > 0)
                {
                    controlList.sort(function(a, b) { return a.order - b.order; });
                    commit('sendOutOfGroup', { controlList: controlList, groupId: groupId });
                    focusedId = controlList[0].id;
                }
                else if (group.previous !== null)
                    focusedId = group.previous;
                else if (group.next !== null)
                    focusedId = group.next;
                commit('deleteControl', groupId);
                addState(state, 'deleteGroup');
                if (focusedId !== undefined)
                {
                    dispatch('openDroppablePath', focusedId);
                    $(document).ready(function()
                    {
                        lib.scrollToElement(state.controls, focusedId, !state.menu2Collapsed || state.separatedMenus != 1, true);
                    });
                }
            }
            else
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
        else
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.change_error);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} param1
     */
    setLayout: function({ state, getters, commit }, { controlId, layout })
    {
        if (state.isSaving)
            return;
        if (controlId === undefined && getters.selectionSize == 0)
            return;
        if (controlId !== undefined && controlId.length > 0 && state.tabsLocked && lib.hasTabContainer(state.controls, controlId))
        {
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            return;
        }
        if (controlId === undefined || controlId == '' && state.form.layout != layout || controlId != '' && state.controls[controlId].layout != layout)
        {
            try
            {
                commit('setCurrentLayout', { controlId, layout });
                addState(state, 'setLayout');
                lib.showNotification('success', state.lang.keywords.success_title, state.lang.keywords.layout_change + ' ' + state.lang.keywords.layout_types[layout]);
            }
            catch (e)
            {
                lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.layout_change_error);
            }
        }
        else
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.layout_change_error);
    },

    /**
     * Sets the number of columns of the control with "controlId", or of the currently selected controls if "controlId" is undefined.
     * This can be used in radio button groups or groups that use the grid layout.
     * @param {any} param0
     * @param {any} param1
     */
    setGridColumns: function({ state, getters, commit }, { controlId, columns })
    {
        if (state.isSaving)
            return;
        if (controlId === undefined && getters.selectionSize == 0)
            return;
        columns = parseInt(columns);
        if (isNaN(columns))
            return;
        var max = 12;
        if (getters.controlTypes == lib.RADIO_GROUP)
            for (let i in state.selectedControls)
            {
                let control = state.controls[i];
                if (control.options.length < max)
                    max = control.options.length;
            }
        if (columns < 1)
            columns = 1;
        else if (columns > max)
            columns = max;
        if (controlId !== undefined && controlId.length > 0 && state.tabsLocked && lib.hasTabContainer(state.controls, controlId))
        {
            lib.showNotification('error', state.lang.keywords.error_title, state.lang.keywords.tab_edit);
            return;
        }
        try
        {
            commit('setColumns', { controlId, columns });
            addState(state, 'setGridColumns');
        }
        catch (e)
        {
            commit('setColumns', { controlId, columns: 0 });
            commit('setColumns', { controlId, columns });
        }
    },

    /**
     * Sets the number of characters of the currently selected controls.
     * This can be used in textfields, lookups, dates or textareas.
     * @param {any} param0
     * @param {any} characters
     */
    setCharacterCount: function({ state, getters, commit }, characters)
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize == 0)
            return;
        characters = parseInt(characters);
        if (isNaN(characters))
            return;
        if (characters < 1)
            characters = 1;
        else if (characters > 255)
            characters = 255;
        try
        {
            commit('setProperty', { prop: 'characters', value: characters });
            addState(state, 'setCharacterCount');
        }
        catch (e)
        {
            commit('setProperty', { prop: 'characters', value: 0 });
            commit('setProperty', { prop: 'characters', value: characters });
        }
    },

    /**
     * Sets the line number of the currently selected controls.
     * This can be used in lists or textareas.
     * @param {any} param0
     * @param {any} lines
     */
    setLineNumber: function({ state, getters, commit }, lines)
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize == 0)
            return;
        lines = parseInt(lines);
        if (isNaN(lines))
            return;
        if (lines < 1)
            lines = 1;
        try
        {
            commit('setProperty', { prop: 'lines', value: lines });
            addState(state, 'setLineNumber');
        }
        catch (e)
        {
            commit('setProperty', { prop: 'lines', value: 0 });
            commit('setProperty', { prop: 'lines', value: lines });
        }
    },

    /**
     * Sets the text of any selected static text controls.
     * @param {any} param0
     * @param {any} text
     */
    setHtmlText: function({ state, getters, commit }, text)
    {
        if (state.isSaving)
            return;
        if (getters.selectionSize == 0)
            return;
        try
        {
            commit('setProperty', { prop: 'htmlText', value: text });
            addState(state, 'setHtmlText');
        }
        catch (e)
        {}
    },

    /**
     * When an element is selected, if the path to it is collapsed in the elements tree, it becomes visible.
     * @param {any} param0
     * @param {any} id
     */
    openDroppablePath: function({ state, commit }, id)
    {
        var parent = state.controls[id].groupId;
        if (Object.keys(state.openDroppables).length > 0)
            while (parent != '')
            {
                if (state.openDroppables[parent] !== undefined && !state.openDroppables[parent])
                    commit('toggleDroppable', { id: parent, value: true });
                parent = state.controls[parent].groupId;
            }
    },

    /**
     * Sets the element being currently hovered.
     * @param {any} param0
     * @param {any} controlId
     */
    hoverControl: function({ state, getters, commit }, controlId)
    {
        if (getters.selectionSize == 0 || state.isDragging || state.isSelecting)
            return;
        if (state.hovered != '')
        {
            let control = state.controls[controlId];
            if (control.isContainer)
            {
                let hoveredControl = state.controls[state.hovered];
                let groupId = hoveredControl.id;
                let found = false;
                while (groupId != '')
                {
                    if (groupId == state.hovered)
                    {
                        found = true;
                        break;
                    }
                    groupId = state.controls[groupId].groupId;
                }
                if (!found)
                    commit('setHovered', controlId);
            }
            else
                commit('setHovered', controlId);
        }
        else
            commit('setHovered', controlId);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} drag
     */
    setDragging: function({ commit }, drag)
    {
        commit('setDraggingMode', drag);
    },

    /**
     * 
     * @param {any} param0
     * @param {any} dim
     */
    resizePreview: function({ commit }, dim)
    {
        commit('setPreviewDim', dim);
    }
}

//------------------------
// Store export
//------------------------

export default new Vuex.Store({
    plugins: [undoRedoPlugin],
    state,
    getters,
    mutations,
    actions
});