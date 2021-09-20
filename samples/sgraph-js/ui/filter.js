const PropertyFilters = {
    None:         0,
    Exported:     1 << 0, // Filter out exported declarations.
    NonExported:  1 << 1, // Filter out non-exported declarations.
    OnlyCLinkage: 1 << 2  // Only show declarations with C-linkage.
};

class GraphFilter {
    constructor() {
        this.name = '';
        this.sort = -1;
        this.prop_filters = PropertyFilters.None;
    }

    reset() {
        this.name = '';
        this.sort = -1;
        this.prop_filters = PropertyFilters.None;
    }

    empty() {
        return !this.filter_name() && !this.filter_sort() && this.filter_props() == PropertyFilters.None;
    }

    filter_name() {
        return this.name != '';
    }

    filter_sort() {
        return this.sort != -1;
    }

    filter_props() {
        return this.prop_filters;
    }
}

var filter_timeout_delay = 250; // 0.25s
var filter_timeout;

function filter_names_keyup(e, text_input) {
    clearInterval(filter_timeout);
    filter_timeout = setInterval(function() {
        graph_filter.name = text_input.value;
        apply_graph_filter(graph_filter);
        clearInterval(filter_timeout);
    }, filter_timeout_delay);
}

function filter_names_keydown(e, text_input) {
    clearInterval(filter_timeout);
}

function filter_sort_changed(e, select_box) {
    graph_filter.sort = parseInt(select_box.value);
    apply_graph_filter(graph_filter);
}

function populate_sort_filter() {
    // Setup the options for the types.
    // Create the 'null' option.
    var nullopt = document.createElement("option");
    nullopt.textContent = '';
    nullopt.value = -1;
    sort_filter.appendChild(nullopt);
    Object.entries(DeclIndex.Sort)
           .sort(function(lhs, rhs) {
                if (lhs[0] < rhs[0])
                    return -1;
                if (lhs[0] > rhs[0])
                    return 1;
                return 0;
          })
          .forEach(element => {
                if (element[1] != DeclIndex.Sort.Count) {
                    var entry = document.createElement("option");
                    entry.textContent = element[0];
                    entry.value = element[1];
                    sort_filter.appendChild(entry);
                }
          });
}

function apply_bit_to(num, bit, value) {
    return (num & ~(1 << bit) | (value << bit));
}

function toggle_filter_exported_decls(e, checkbox) {
    const value = checkbox.checked;
    graph_filter.prop_filters = apply_bit_to(graph_filter.prop_filters, 0, value);
    apply_graph_filter(graph_filter);
}

function toggle_filter_non_exported_decls(e, checkbox) {
    const value = checkbox.checked;
    graph_filter.prop_filters = apply_bit_to(graph_filter.prop_filters, 1, value);
    apply_graph_filter(graph_filter);
}

function init_filters() {
    populate_sort_filter();

    name_filter.addEventListener("keyup", event => filter_names_keyup(event, name_filter));
    name_filter.addEventListener("keydown", event => filter_names_keydown(event, name_filter));
    sort_filter.addEventListener("change", event => filter_sort_changed(event, sort_filter));
    center_view.addEventListener("click", e => reset_view());
    prop_filter_exported.addEventListener("click", event => toggle_filter_exported_decls(event, prop_filter_exported));
    prop_filter_non_exported.addEventListener("click", event => toggle_filter_non_exported_decls(event, prop_filter_non_exported));
}