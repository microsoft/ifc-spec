const file_selector = document.getElementById('file-selector');
const title = document.getElementById('title');
const output = document.getElementById('output');

// Sidebar
const name_filter = document.getElementById('name-filter');
const sort_filter = document.getElementById('sort-filter');
const center_view = document.getElementById('center-view');
const prop_filter_exported = document.getElementById('prop-filter-exported');
const prop_filter_non_exported = document.getElementById('prop-filter-non-exported');

// Options dialog
const decl_color_dropdown = document.getElementById('decl-color-dropdown');
const decl_color_selector = document.getElementById('decl-color-selector');
const reset_decl_colors_btn = document.getElementById('reset-decl-colors');
const transpose_graph_toggle = document.getElementById('transpose-graph-toggle');
const class_color_dropdown = document.getElementById('class-color-dropdown');
const class_color_selector = document.getElementById('class-color-selector');
const reset_class_colors_btn = document.getElementById('reset-class-colors');
const filter_opacity_edit = document.getElementById('filter-opacity-edit');
const bad_filter_opacity_text = document.getElementById('bad-filter-opacity-text');
const graph_fps_toggle = document.getElementById('graph-fps-toggle');

// IFC explorer dialog
const ifc_explorer = {
    button: document.getElementById('ifc-explorer-button'),
    decls: {
        tab: '#ifc-explorer-decls-tab',
        content: document.getElementById('ifc-explorer-content-decls'),
        sort_dropdown: document.getElementById('ifc-explorer-content-decls-sort-dropdown'),
        index_edit: document.getElementById('ifc-explorer-content-decls-index-edit'),
        load: document.getElementById('ifc-explorer-content-decls-load')
    },
    types: {
        tab: '#ifc-explorer-types-tab',
        content: document.getElementById('ifc-explorer-content-types'),
        sort_dropdown: document.getElementById('ifc-explorer-content-types-sort-dropdown'),
        index_edit: document.getElementById('ifc-explorer-content-types-index-edit'),
        load: document.getElementById('ifc-explorer-content-types-load')
    },
    exprs: {
        tab: '#ifc-explorer-exprs-tab',
        content: document.getElementById('ifc-explorer-content-exprs'),
        sort_dropdown: document.getElementById('ifc-explorer-content-exprs-sort-dropdown'),
        index_edit: document.getElementById('ifc-explorer-content-exprs-index-edit'),
        load: document.getElementById('ifc-explorer-content-exprs-load')
    },
    toc: {
        content: document.getElementById('ifc-explorer-content-toc')
    },
    header: {
        content: document.getElementById('ifc-explorer-content-ifc-header')
    }
};

// Scripting globals
var graph_filter = new GraphFilter();
var options = null;
var sgraph = { resolver: null, header: null };