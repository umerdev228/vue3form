const Vue = require('vue');

const MAXW = 650;
const MINW = 200;

const TOAST_DURATION = 2000;

const DEFAULT_TABLE = 'PSEUD';

const DIALOG_CONFIG = {
    effect: 'fade',
    duration: 500
};

//------------------------
// Control types
//------------------------

const FIELD = 'Field';
const CHECKBOX = 'Checkbox';
const RADIO_GROUP = 'RadioGroup';
const LOOKUP = 'Lookup';
const LOOKUP_BUTTON = 'LookupButton';
const DROPDOWN = 'Dropdown';
const BUTTON = 'Button';
const LIST = 'List';
const SELECTABLE_LIST = 'SelectableList';
const EDITABLE_LIST = 'EditableList';
const VALUE_LIST = 'ValueList';
const TEXTAREA = 'Textarea';
const STATIC_TEXT = 'StaticText';
const IMAGE = 'Image';
const DOCUMENT = 'Document';
const GROUPBOX = 'Groupbox';
const ACCORDION = 'Accordion';
const TAB = 'Tab';
const TAB_GROUP = 'TabGroup';

//------------------------
// Auxiliary functions
//------------------------

/**
 * 
 * @param {any} control
 * @param {any} controls
 */
function getVisiblePrevious(control, controls)
{
    if (!control.hidden)
        return control;
    if (control.previous === null)
        return null;
    return getVisiblePrevious(controls[control.previous], controls);
}

/**
 * 
 * @param {any} control
 * @param {any} controls
 */
function getVisibleNext(control, controls)
{
    if (!control.hidden)
        return control;
    if (control.next === null)
        return null;
    return getVisibleNext(controls[control.next], controls);
}

/**
 * 
 * @param {any} control
 * @param {any} controls
 */
function getVisibleControl(control, controls)
{
    if (!control.hidden)
        return control;
    if (control.previous !== null)
        return getVisiblePrevious(controls[control.previous], controls);
    if (control.next !== null)
        return getVisibleNext(controls[control.next], controls)
    return null;
}

/**
 * 
 * @param {any} control1
 * @param {any} control2
 */
function setControlOrder(control1, control2)
{
    if (!control1.hidden && control2.hidden)
        control2.previous = control1.id;
    else if (!control2.hidden && control1.hidden)
        control1.next = control2.id;
    else if (!control2.hidden && !control1.hidden || control2.hidden && control1.hidden)
    {
        control2.previous = control1.id;
        control1.next = control2.id;
    }
}

/**
 * 
 * @param {any} element
 * @param {any} remove
 * @param {any} add
 */
function setLines(element, remove, add)
{
    var elClass = element.attr('class');
    if (elClass.indexOf(remove) != -1 && elClass.indexOf('fixed-row-group') == -1)
    {
        var removeExp = new RegExp(remove, 'g');
        element.attr('class', elClass.replace(removeExp, add));
        setLines(element.parent(), remove, add);
    }
}

/**
 * 
 * @param {any} tree
 * @param {any} groupId
 * @param {any} newControls
 * @param {any} oldControls
 */
function buildControlsHelper(tree, groupId, newControls, oldControls)
{
    if (groupId != '')
        oldControls[groupId].children = [];
    for (let i = 0; i < tree.length; i++)
    {
        oldControls[tree[i].id].groupId = groupId;
        newControls[tree[i].id] = oldControls[tree[i].id];
        if (tree[i].children.length > 0)
            buildControlsHelper(tree[i].children, tree[i].id, newControls, oldControls);
    }
    return newControls;
}

/**
 * Removes tab groups and any properties added to the controls on the client side, in
 * order to avoid putting a useless overhead in the communication with the server.
 * @param {object} controls Stores all the controls in the form
 * @param {array} controlList Stores the already processed controls
 * @param {string} group The current group id
 * @param {number} pos The current position
 */
function getPositionsInGroup(controls, controlList, group, pos)
{
    var children = getGroupChildren(controls, group);
    for (let i = 0; i < children.length; i++)
    {
        if (children[i].ctrlType != TAB_GROUP)
        {
            children[i].pos = pos++;
            controlList.push(children[i]);
        }
        let groupId = children[i].groupId;
        if (children[i].ctrlType == TAB)
            children[i].groupId = controls[groupId].groupId;
        else if (groupId != '')
            if (controls[groupId].ctrlType == TAB)
                children[i].groupId = '';
            else
                children[i].groupId = children[i].groupId.split('_')[1];   
        if (children[i].isContainer)
            if (children[i].ctrlType == TAB)
                getPositionsInGroup(controls, controlList, children[i].id, 1);
            else
                pos = getPositionsInGroup(controls, controlList, children[i].id, pos);
        delete children[i].columnValues;
        delete children[i].children;
        delete children[i].order;
        delete children[i].next;
        delete children[i].previous;
        delete children[i].searchIndex;
        delete children[i].isContainer;
        delete children[i].options;
        delete children[i].text;
        delete children[i].view;
        delete children[i].icon;
        delete children[i].id;
    }
    return pos;
}

/**
 * Scrolls the canvas and the elements tree to bring into view the
 * element with the specified id.
 * @param {string} id The id of the element we want to bring into view
 * @param {boolean} scrollTree Indicates if the elements tree should be scrolled
 * @param {boolean} scrollCanvas Indicates if the canvas should be scrolled
 * @param {number} tries The number of times the function will try to scroll before quitting
 */
function freeScroll(id, scrollTree, scrollCanvas, tries)
{
    const el = $('#' + id);
    if (el.is(':visible'))
    {
        setTimeout(function()
        {
            if (scrollTree && $('#branch-' + id).is(':visible'))
                if (!scrollCanvas)
                    $('.custom-scrollbar').scrollTo('#branch-' + id, 600);
                else
                    $('#branch-' + id)[0].scrollIntoView({
                        block: 'start'
                    });
            if (scrollCanvas)
                el[0].scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
        }, 300);
    }
    else if (tries !== undefined && tries < 5)
        setTimeout(function()
        {
            freeScroll(id, scrollTree, scrollCanvas, tries + 1);
        }, 100);
}

/**
 * If the element with the provided id is inside a tab or a collapsible group,
 * this function will open/focus those containers.
 * @param {object} controls Stores all the controls in the form
 * @param {string} id The id of the element we want to bring into view
 * @param {function} callback Function that will be called when all the containers are open
 * @param {boolean} scrollTree Indicates if the elements tree should be scrolled
 * @param {boolean} scrollCanvas Indicates if the canvas should be scrolled
 */
function openParents(controls, id, callback, scrollTree, scrollCanvas)
{
    var groupId = controls[id].groupId
    if (groupId != '')
    {
        if (controls[groupId].ctrlType == TAB)
            $('#' + groupId).click();
        else
            $('#content' + groupId).collapse('show');
        if (controls[groupId].groupId != '')
            openParents(controls, groupId);
    }
    if (callback !== undefined)
        callback(id, scrollTree, scrollCanvas, 0);
}

//------------------------
// Public functions
//------------------------

/**
 * Makes the correspondence between the control type and it's vue template.
 * Whenever a new type of control/template is added, this function will need to be updated.
 * @param {object} value Represents a control
 */
function parseControlTemplate(value)
{
    if (value.ctrlType == FIELD)
    {
        if (value.dataType == 'D' || value.dataType == 'OD' || value.dataType == 'ED' || value.dataType == 'DT')
        {
            value.view = 'date';
            value.icon = 'date_range';
        }
        else
        {
            value.view = 'mesa-textfield';
            value.icon = 'short_text';
        }
    }
    else if (value.ctrlType == CHECKBOX)
    {
        value.view = 'checkbox';
        value.icon = 'check_box';
    }
    else if (value.ctrlType == RADIO_GROUP)
    {
        value.view = 'radio-group';
        value.icon = 'radio_button_checked';
    }
    else if (value.ctrlType == LOOKUP)
    {
        value.view = 'lookup';
        value.icon = 'search';
    }
    else if (value.ctrlType == LOOKUP_BUTTON)
    {
        value.view = 'lookup-button';
        value.icon = 'search';
    }
    else if (value.ctrlType == DROPDOWN)
    {
        value.view = 'dropdown';
        value.icon = 'arrow_drop_down_circle';
    }
    else if (value.ctrlType == BUTTON)
    {
        value.view = 'mesa-button';
        value.icon = 'indeterminate_check_box';
    }
    else if (value.ctrlType == LIST)
    {
        value.view = 'list';
        value.icon = 'table_chart';
    }
    else if (value.ctrlType == SELECTABLE_LIST)
    {
        value.view = 'selectable-list';
        value.icon = 'table_chart';
    }
    else if (value.ctrlType == EDITABLE_LIST)
    {
        value.view = 'editable-list';
        value.icon = 'table_chart';
    }
    else if (value.ctrlType == VALUE_LIST)
    {
        value.view = 'value-list';
        value.icon = 'list_alt';
    }
    else if (value.ctrlType == TEXTAREA)
    {
        value.view = 'mesa-textarea';
        value.icon = 'notes';
    }
    else if (value.ctrlType == STATIC_TEXT)
    {
        value.view = 'static-text';
        value.icon = 'code';
    }
    else if (value.ctrlType == IMAGE)
    {
        value.view = 'mesa-image';
        value.icon = 'image';
    }
    else if (value.ctrlType == DOCUMENT)
    {
        value.view = 'document';
        value.icon = 'attach_file';
    }
    else if (value.ctrlType == GROUPBOX)
    {
        if (value.collapsible)
            value.view = 'collapsible-groupbox';
        else
            value.view = 'groupbox';
    }
    else if (value.ctrlType == ACCORDION)
        value.view = 'accordion';
    else if (value.ctrlType == TAB)
        value.view = 'tab';
    else if (value.ctrlType == TAB_GROUP)
        value.view = 'tab-group';
    else
    {
        value.view = null;
        value.icon = 'error';
    }
}

/**
 * Defines the placeholder text shown on each control visible in the canvas,
 * depending on the control type.
 * @param {object} control Represents a control
 */
function getPlaceholderText(control)
{
    if (control.dataType == 'D' || control.dataType == 'OD' || control.dataType == 'ED')
        return '__/__/____';
    else if (control.dataType == 'DT')
        return '__/__/____ __:__';
    else if (control.dataType == 'T')
        return '__:__';
    else if (control.dataType == 'Y')
        return '0000';
    else if (control.dataType == '$' || control.dataType == '$D')
        return '0'.repeat(control.characters < 4 ? 1 : control.characters - 3) + '.00€';
    else if (control.dataType == 'N' || control.dataType == 'ND')
        return '0'.repeat(control.characters);
    else
        return 'x'.repeat(control.characters);
}

/**
 * Checks if the specified type of control is a container.
 * @param {string} controlType The type of the control
 */
function isContainer(controlType)
{
    return controlType == GROUPBOX || controlType == ACCORDION || controlType == TAB || controlType == TAB_GROUP;
}

/**
 * Checks if any of the controls have the property "prop".
 * @param {any} controls
 * @param {any} selectionSize
 * @param {any} prop
 */
function hasProperty(controls, selectionSize, prop)
{
    if (selectionSize == 0)
        return false;
    for (let i in controls)
        if (!controls[i][prop])
            return false;
    return true;
}

/**
 * Returns the value of the property "prop", if it's the same for all the controls,
 * otherwise returns "init".
 * @param {any} prop
 * @param {any} controls
 * @param {any} init
 */
function getProperty(prop, controls, init)
{
    var res = init;
    var differs = false;
    for (let i in controls)
    {
        // If one of the selected controls doesn't have the property, returns undefined.
        if (controls[i][prop] === undefined)
            return undefined;
        // If one of the selected controls's property has a different value than the rest, sets "differs" to "true".
        if (res != init && res != controls[i][prop])
            differs = true;
        res = controls[i][prop];
    }
    if (differs)
        return init;
    return res;
}

/**
 * Returns a list of the children in "group", ordered by their positions.
 * @param {any} controls
 * @param {any} group
 */
function getGroupChildren(controls, group)
{
    var list = [];
    for (let i in controls)
        if (controls[i].groupId == group)
            list.push(controls[i]);
    return list.sort(function(a, b) { return a.order - b.order; });
}

/**
 * Checks if "control" can belong to "group".
 * @param {any} control
 * @param {any} group
 * @param {any} groupList
 * @param {any} canBeSame
 */
function canBelongToGroup(control, group, groupList, canBeSame)
{
    if (group === undefined)
        if (control.ctrlType == TAB)
            return false;
        else
            return true;
    if (control.id == group.id)
        return false;
    if (control.groupId == group.id && !canBeSame)
        return false;
    if (control.isContainer && $.inArray(group.id, groupList[control.id].children) != -1)
        return false;
    if (group.ctrlType == ACCORDION && control.ctrlType != GROUPBOX)
        return false;
    if (group.ctrlType == TAB_GROUP && control.ctrlType != TAB)
        return false;
    if (group.ctrlType != TAB_GROUP && control.ctrlType == TAB)
        return false;
    return true;
}

/**
 * Checks if the element with id "id" is inside a tab.
 * @param {any} controls
 * @param {any} id
 * @param {any} checkItself
 */
function hasTabContainer(controls, id, checkItself)
{
    if (checkItself !== undefined && checkItself && controls[id].ctrlType == TAB)
        return true;
    var groupId = controls[id].groupId;
    while (groupId != '')
    {
        if (controls[groupId].ctrlType == TAB)
            return true;
        groupId = controls[groupId].groupId;
    }
    return false;
}

/**
 * Returns either the last or the first element on group "group", depending on the "prop" ("previous" or "next").
 * @param {any} controls
 * @param {any} group
 * @param {any} prop
 * @param {any} visible
 */
function findControl(controls, group, prop, visible)
{
    for (let i in controls)
        if (controls[i].groupId == group && controls[i][prop] === null)
            if (visible)
                return getVisibleControl(controls[i], controls);
            else
                return controls[i];
    return null;
}

/**
 * Returns either the previous or the next visible element, depending on the "prop" ("previous" or "next").
 * @param {any} controls
 * @param {any} id
 * @param {any} prop
 */
function getControl(controls, id, prop)
{
    var controlId = controls[id][prop];
    while (controlId !== null)
    {
        if (!controls[controlId].hidden)
            return controls[controlId];
        controlId = controls[controlId][prop];
    }
    return null;
}

/**
 * 
 * @param {any} controls
 * @param {any} group
 * @param {any} n
 */
function getNthElement(controls, group, n)
{
    for (let i in controls)
        if (controls[i].groupId == group && controls[i].order == n)
            return controls[i];
    return null;
}

/**
 * 
 * @param {any} id
 * @param {any} obj
 */
function containsControl(id, obj)
{
    if ($.isArray(obj))
    {
        for (let i = 0; i < obj.length; i++)
            if (obj[i].id == id)
                return true;
        return false;
    }
    else
        return obj.hasOwnProperty(id);
}

/**
 * 
 * @param {any} group
 * @param {any} child
 */
function containsChild(group, child)
{
    for (let i = 0; i < group.length; i++)
        if (group[i] == child)
            return true;
    return false;
}

/**
 * Arranges components, when flow layout is being used, according to the specified rules.
 * A better solution should probably be considered, since this is kind of a hack.
 */
function arrangeFlowLayout()
{
    $('.fill-line').each(function()
    {
        if ($(this).hasClass('flow-group'))
            setLines($(this).parent(), 'mesa-join-group', 'mesa-row-group');
    });
    $('.wrap-element').each(function()
    {
        if ($(this).hasClass('flow-group'))
            setLines($(this).parent(), 'mesa-row-group', 'mesa-join-group');
    });
}

/**
 * Receives a list of forms, transforms it into an object of forms and returns it.
 * If formList is not a list, the function simply returns it.
 * @param {array} formList List of all the forms in the system
 */
function initFormList(formList)
{
    if ($.isArray(formList))
    {
        formList.sort(function(a, b) { return a.id > b.id ? 1 : -1; });
        let forms = {};
        for (let i = 0; i < formList.length; i++)
            forms[formList[i].id] = formList[i];
        return forms;
    }
    else
        return formList;
}

/**
 * Receives raw data and returns an object with usable data for the editor.
 * @param {any} controlList This function assumes that if "controlList" is a list, the data is raw and comes directly from the server, otherwise, it should be an object with the controls, in need of being reinitialized for some reason
 */
function initControls(controlList)
{
    var rawControls = {};
    // If controlList is an array, instead of an object, the rawControls need to be formatted.
    if ($.isArray(controlList))
    {
        let tabGroup = { tabs: [], n: 1 };
        controlList.sort(function(a, b) { return a.pos - b.pos; });
        for (let i = 0; i < controlList.length; i++)
        {
            if (controlList[i].ctrlType == TAB)
            {
                let containerField = 'TABGROUP' + tabGroup.n;
                let containerId = DEFAULT_TABLE + '_' + containerField;
                let groupId = controlList[i].groupId;
                if (tabGroup.tabs.length == 0)
                {
                    let tabsContainer = {
                        id: containerId,
                        pos: -1,
                        tableName: DEFAULT_TABLE,
                        ctrlType: TAB_GROUP,
                        dataType: 'TG',
                        field: containerField,
                        groupId: groupId == '' ? '' : DEFAULT_TABLE + '_' + groupId,
                        lineBreak: false,
                        joined: false,
                        wholeLine: false,
                        hidden: false
                    };
                    rawControls[containerId] = tabsContainer;
                }
                controlList[i].groupId = containerField;
                tabGroup.tabs.push(i);
            }
            else if (tabGroup.tabs.length > 0)
            {
                tabGroup.tabs = [];
                tabGroup.n++;
            }
            if (controlList[i].groupId != '')
                controlList[i].groupId = DEFAULT_TABLE + '_' + controlList[i].groupId;
            rawControls[controlList[i].id] = controlList[i];
        }
    }
    else
        rawControls = controlList;

    // After rawControls is in the correct format, the values can be initialized.
    var controls = {};
    var lastVisibleElInGroup = {};
    var j = null;
    var order = 1;
    var groups = {};
    for (let i in rawControls)
    {
        rawControls[i].text = getPlaceholderText(rawControls[i]);
        rawControls[i].isContainer = isContainer(rawControls[i].ctrlType);
        rawControls[i].searchIndex = rawControls[i].tableName + '.' + rawControls[i].field;
        parseControlTemplate(rawControls[i]);
        if (rawControls[i].isContainer && groups[i] === undefined)
        {
            rawControls[i].children = [];
            groups[i] = true;
        }
        let group = rawControls[i].groupId;
        if (group != '')
        {
            if (groups[group] === undefined)
            {
                rawControls[group].children = [];
                groups[group] = true;
            }
            if (!containsChild(rawControls[group].children, i))
            {
                rawControls[i].previous = null;
                rawControls[i].next = null;
                if (rawControls[group].children.length > 0)
                {
                    let p = rawControls[group].children.slice(-1)[0];
                    if (rawControls[i].hidden)
                        setControlOrder(rawControls[p], rawControls[i]);
                    else if (lastVisibleElInGroup[group] !== undefined)
                        setControlOrder(rawControls[lastVisibleElInGroup[group].id], rawControls[i]);
                }
                rawControls[i].order = rawControls[group].children.length + 1;
                rawControls[group].children.push(i);
                if (!rawControls[i].hidden)
                    if (lastVisibleElInGroup[group] !== undefined)
                    {
                        if (lastVisibleElInGroup[group].order < rawControls[i].order)
                            lastVisibleElInGroup[group] = { id: i, order: rawControls[i].order };
                    }
                    else
                        lastVisibleElInGroup[group] = { id: i, order: rawControls[i].order };
            }
        }
        else
        {
            rawControls[i].order = order++;
            rawControls[i].previous = null;
            rawControls[i].next = null;
            if (j !== null)
                setControlOrder(rawControls[j], rawControls[i]);
            j = i;
        }
        solveLineConflicts(rawControls[i], rawControls);
        controls[i] = rawControls[i];
    }
    return controls;
}

/**
 * 
 * @param {string} menu The menu name
 * @param {object} dim The dimensions
 * @param {number} w The width
 * @param {number} h The height
 * @param {number} wp The width percentage
 * @param {number} hp The height percentage
 */
function setMenuDimensions(menu, dim, w, h, wp, hp)
{
    if (w < MINW)
        w = MINW;
    if (w > MAXW)
        w = MAXW;
    wp = Math.round(w) / ($(window).width() - 50) * 100;
    return {
        menu: menu,
        width: Math.round(w),
        height: Math.round(h),
        wpercentage: wp,
        hpercentage: hp,
        max: dim !== null ? dim.max : MAXW,
        min: dim !== null ? dim.min : MINW,
        previousw: dim !== null ? dim.width : w,
        previoush: dim !== null ? dim.height : h,
        previouswp: dim !== null ? dim.wpercentage : wp,
        previoushp: dim !== null ? dim.hpercentage : hp
    };
}

/**
 * When a control is set as "joined", the next one can't occupy the whole line, on the
 * other hand, when a control is set as "wholeLine", the previous one can't be joined.
 * @param {any} c
 * @param {any} controls
 */
function solveLineConflicts(c, controls)
{
    if (!c.hidden)
    {
        if (c.joined)
        {
            let next = controls[c.next];
            if (c.next !== null && next.wholeLine)
                next.wholeLine = false;
        }
        else if (c.wholeLine)
        {
            let previous = controls[c.previous];
            if (c.previous !== null && previous.joined)
                previous.joined = false;
        }
    }
    else if (c.previous !== null)
        solveLineConflicts(controls[c.previous], controls);
}

/**
 * Arranges the controls in the canvas, based on the elements in the tree.
 * @param {any} tree
 * @param {any} controls
 */
function buildControlsFromTree(tree, controls)
{
    controls = buildControlsHelper(tree, '', {}, controls);
    return initControls(controls);
}

/**
 * Builds a tree of all the controls, based on the elements in the canvas.
 * @param {any} tree
 * @param {any} controls
 * @param {any} selectedControls
 * @param {any} group
 * @param {any} leftovers
 * @param {any} openDroppables
 */
function buildTree(tree, controls, selectedControls, group, leftovers, openDroppables)
{
    var indexes = {};
    for (let i in controls)
    {
        let groupId = controls[i].groupId;
        if (groupId == group)
        {
            if (controls[i].isContainer)
                indexes[i] = tree.length;
            tree.push({
                id: i,
                parent: group,
                icon: controls[i].icon,
                order: controls[i].order,
                label: controls[i].label,
                draggable: !controls[i].hidden,
                droppable: controls[i].isContainer,
                open: openDroppables[i] === undefined || openDroppables[i],
                selected: containsControl(i, selectedControls),
                nodeName: controls[i].searchIndex,
                children: []
            });
        }
        else
        {
            if (leftovers[groupId] === undefined)
                leftovers[groupId] = {};
            leftovers[groupId][i] = controls[i];
        }
    }
    for (let g in leftovers)
        if (indexes[g] !== undefined)
        {
            let c = leftovers[g];
            delete leftovers[g];
            buildTree(tree[indexes[g]].children, c, selectedControls, g, leftovers, openDroppables);
        }
    tree.sort(function(a, b) { return a.order - b.order; });
}

/**
 * Returns a list of the controls ordered by their absolute positions, which is required in order to save.
 * @param {any} controls
 */
function getControlList(controls)
{
    var controlList = [];
    getPositionsInGroup(controls, controlList, '', 1);
    return controlList;
}

/**
 * 
 * @param {any} controls
 * @param {any} nextControl
 * @param {any} order
 */
function shiftControls(controls, nextControl, order)
{
    while (nextControl !== null)
    {
        controls[nextControl].order = order;
        nextControl = controls[nextControl].next;
        order++;
    }
}

/**
 * Searches in all the controls for the immediate siblings (next and previous) of the element with id "id".
 * @param {any} controls
 * @param {any} id
 */
function getImmediateSiblings(controls, id)
{
    var order = controls[id].order;
    var group = controls[id].groupId;
    var previous = null;
    var next = null;
    for (let i in controls)
        if (!controls[i].hidden && controls[i].groupId == group && controls[i].order != order)
            if (controls[i].order < order)
                if (previous !== null)
                {
                    if (controls[i].order > controls[previous].order)
                        previous = controls[i].id;
                }
                else
                    previous = controls[i].id;
            else if (next !== null)
            {
                if (controls[i].order < controls[next].order)
                    next = controls[i].id;
            }
            else
                next = controls[i].id;
    return { previous: previous, next: next };
}

/**
 * 
 * @param {any} id
 * @param {any} animationName
 * @param {any} callback
 */
function animateElement(id, animationName, callback)
{
    const node = document.querySelector(id);
    if (node === null)
        return;
    node.classList.add('animated', animationName);
    function handleAnimationEnd()
    {
        node.classList.remove('animated', animationName);
        node.removeEventListener('animationend', handleAnimationEnd);
        if (typeof callback === 'function')
            callback();
    }
    node.addEventListener('animationend', handleAnimationEnd);
}

/**
 * 
 * @param {any} controls
 * @param {any} id
 * @param {any} scrollTree
 * @param {any} scrollCanvas
 */
function scrollToElement(controls, id, scrollTree, scrollCanvas)
{
    if (id == '')
        return;
    const el = $('#' + id);
    if (el.length > 0)
    {
        if (!el.is(':visible'))
            openParents(controls, id, freeScroll, scrollTree, scrollCanvas);
        else
            freeScroll(id, scrollTree, scrollCanvas)
    }
}

/**
 * Arranges the open dialog in the page.
 */
function arrangeDialog()
{
    $('button.ui-dialog-titlebar-close').attr('class', 'ui-button ui-corner-all ui-widget ui-button-icon-only ui-dialog-titlebar-close');
    $('button.ui-dialog-titlebar-close').html($('<span>', { class: 'ui-button-icon ui-icon ui-icon-closethick' }));
    $('button.ui-dialog-titlebar-close').append($('<span>', { class: 'ui-button-icon-space' }));
    $('div.ui-dialog-buttonset').find('button').addClass('ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only');
    $('.ui-button').click(function()
    {
        $('.tooltip').tooltip('hide');
    });
}

/**
 * Calls operation "op" on all dialogs. "op" can be a "close", "destroy" or other supported operation.
 * @param {any} op
 */
function callDialogsOp(op)
{
    $('.mesa-dialog').each(function()
    {
        try
        {
            $(this).dialog(op);
        }
        catch (e)
        {}
    });
}

/**
 * Takes advantage of the library vue-notification to present a notification to the user.
 * @param {string} type Specifies if it's an "error" or a "success" notification
 * @param {string} title The title of the notification
 * @param {string} text The text of the notification
 */
function showNotification(type, title, text)
{
    Vue.notify({
        group: 'mesa-notifications',
        type: type,
        title: title,
        text: text,
        duration: TOAST_DURATION
    });
}

/**
 * 
 * @param {any} width
 */
function adaptFont(width)
{
    var size = 14;
    if (width <= 225)
        size = 10;
    else if (width <= 250)
        size = 11;
    else if (width <= 275)
        size = 12;
    else if (width <= 300)
        size = 13;
    $('#properties-menu .adapt-font').css({'font-size': size + 'px'});
}

module.exports = {
    FIELD,
    CHECKBOX,
    RADIO_GROUP,
    LOOKUP,
    LOOKUP_BUTTON,
    DROPDOWN,
    BUTTON,
    LIST,
    SELECTABLE_LIST,
    EDITABLE_LIST,
    VALUE_LIST,
    TEXTAREA,
    STATIC_TEXT,
    IMAGE,
    DOCUMENT,
    GROUPBOX,
    ACCORDION,
    TAB,
    TAB_GROUP,
    DEFAULT_TABLE,
    DIALOG_CONFIG,
    parseControlTemplate,
    getPlaceholderText,
    isContainer,
    hasProperty,
    getProperty,
    getGroupChildren,
    canBelongToGroup,
    hasTabContainer,
    findControl,
    getControl,
    getNthElement,
    containsControl,
    containsChild,
    arrangeFlowLayout,
    initFormList,
    initControls,
    setMenuDimensions,
    solveLineConflicts,
    buildControlsFromTree,
    buildTree,
    getControlList,
    shiftControls,
    getImmediateSiblings,
    animateElement,
    scrollToElement,
    arrangeDialog,
    callDialogsOp,
    showNotification,
    adaptFont
}