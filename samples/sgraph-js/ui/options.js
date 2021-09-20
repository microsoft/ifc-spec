class Options {
    constructor() {
        this._populate_default_decl_colors();
        this._populate_default_class_colors();
        // By default, the view is icicle graph where the top-most node stretches the
        // width of the screen and each descendant sibling is layed out along the x-axis.
        // Transposing enabled will show the graph in the opposite form: each descendant
        // is layed out along the y-axis and each sibling is stacked along the y-axis.
        this.transpose = false;
        this.deselected_opacity = 0.1;
        this.show_fps = false;
    }

    color_for_index(index) {
        if (index.sort == DeclIndex.Sort.Scope) {
            const decl = sgraph.resolver.read(ScopeDecl, index.index);
            if (sgraph.resolver.fundamental_type_is_class(decl)) {
                const basis = sgraph.resolver.read(FundamentalType, decl.type.index).basis.value;
                return this.color_for_class(basis);
            }
        }
        return this.color_for_sort(index.sort);
    }

    color_for_sort(sort) {
        return this.decl_color_map.get(sort);
    }

    set_color_for_sort(sort, color) {
        this.decl_color_map.set(sort, color);
    }

    color_for_class(basis) {
        return this.class_color_map.get(basis);
    }

    set_color_for_class(basis, color) {
        this.class_color_map.set(basis, color);
    }

    reset_decl_colors_to_default() {
        const decl_sorts = Object.entries(DeclIndex.Sort);
        for (var i = 0; i < decl_sorts.length; ++i) {
            const sort = decl_sorts[i][1];
            this.decl_color_map.set(sort, Options._intern_decl_sort_default(sort));
        }
    }

    reset_class_colors_to_default() {
        this.class_color_map.set(TypeBasis.Values.Class, Options._intern_color_for_class_type(TypeBasis.Values.Class));
        this.class_color_map.set(TypeBasis.Values.Struct, Options._intern_color_for_class_type(TypeBasis.Values.Struct));
        this.class_color_map.set(TypeBasis.Values.Union, Options._intern_color_for_class_type(TypeBasis.Values.Union));
    }

    _populate_default_decl_colors() {
        this.decl_color_map = new Map();
        this.reset_decl_colors_to_default();
    }

    _populate_default_class_colors() {
        this.class_color_map = new Map();
        this.reset_class_colors_to_default();
    }

    static _as_hex(c) {
        c = Math.max(0, Math.min(255, Math.round(c) || 0));
        return (c < 16 ? "0" : "") + c.toString(16);
    }

    static _intern_color(color) {
        const d3_color = d3.color(color);
        const r = Options._as_hex(d3_color.r);
        const g = Options._as_hex(d3_color.g);
        const b = Options._as_hex(d3_color.b);
        return `#${r}${g}${b}`;
    }

    static _intern_decl_sort_default(sort) {
        const color = Options._default_color_for_decl_sort(sort);
        return Options._intern_color(color);
    }

    static _default_color_for_decl_sort(sort) {
        switch (sort) {
        case DeclIndex.Sort.Enumerator:
            return 'yellow';
        case DeclIndex.Sort.Variable:
            return 'lightgreen';
        case DeclIndex.Sort.Parameter:
            return 'lightgray';
        case DeclIndex.Sort.Field:
            return 'lightskyblue';
        case DeclIndex.Sort.Bitfield:
            return 'lightsalmon';
        case DeclIndex.Sort.Scope:
            return 'darkcyan';
        case DeclIndex.Sort.Enumeration:
            return 'darkgoldenrod';
        case DeclIndex.Sort.Alias:
            return 'gold';
        case DeclIndex.Sort.Temploid:
            return 'dodgerblue';
        case DeclIndex.Sort.Template:
            return 'dodgerblue';
        case DeclIndex.Sort.PartialSpecialization:
        case DeclIndex.Sort.ExplicitSpecialization:
        case DeclIndex.Sort.ExplicitInstantiation:
        case DeclIndex.Sort.Concept:
            return 'violet';
        case DeclIndex.Sort.Function:
            return 'plum';
        case DeclIndex.Sort.Method:
            return 'pink';
        case DeclIndex.Sort.Constructor:
            return 'olive';
        case DeclIndex.Sort.InheritedConstructor:
            return 'olive';
        case DeclIndex.Sort.Destructor:
            return 'firebrick';
        case DeclIndex.Sort.Reference:
        case DeclIndex.Sort.UsingDeclaration:
        case DeclIndex.Sort.UsingDirective:
        case DeclIndex.Sort.Friend:
        case DeclIndex.Sort.Expansion:
        case DeclIndex.Sort.DeductionGuide:
        case DeclIndex.Sort.Barren:
        case DeclIndex.Sort.Tuple:
        case DeclIndex.Sort.SyntaxTree:
        case DeclIndex.Sort.Intrinsic:
        case DeclIndex.Sort.Property:
        case DeclIndex.Sort.OutputSegment:
            return 'red';
        case DeclIndex.Sort.VendorExtension:
        case DeclIndex.Sort.Count:
            return 'black';
        default:
            console.error(`Bad sort: ${sort}`);
            return 'black';
        }
    }

    static _intern_color_for_class_type(basis) {
        const color = Options._default_color_for_class_type(basis);
        return Options._intern_color(color);
    }

    static _default_color_for_class_type(basis) {
        switch (basis) {
        case TypeBasis.Values.Class:
            return 'lightblue';
        case TypeBasis.Values.Struct:
            return 'greenyellow';
        case TypeBasis.Values.Union:
            return 'darkgrey';
        default:
            console.error(`Bad basis for class: ${basis}`);
            return 'black';
        }
    }
}

function populate_decl_color_dropdown() {
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
                    decl_color_dropdown.appendChild(entry);
                }
          });
}

function select_decl_for_color(e, selector) {
    const sort = parseInt(selector.value);
    decl_color_selector.value = options.color_for_sort(sort);
}

function select_color_for_decl(e, selector) {
    const color = selector.value;
    const sort = parseInt(decl_color_dropdown.value);
    options.set_color_for_sort(sort, color);
    color_updated();
}

function reset_decl_colors() {
    options.reset_decl_colors_to_default();
    // Show the newly updated color for the currently selected decl.
    select_decl_for_color(null, decl_color_dropdown);
    color_updated();
}

function populate_class_color_dropdown() {
    const class_types = {
        Class: TypeBasis.Values.Class,
        Struct: TypeBasis.Values.Struct,
        Union: TypeBasis.Values.Union
    };
    Object.entries(class_types)
          .forEach(element => {
              var entry = document.createElement("option");
              entry.textContent = element[0];
              entry.value = element[1];
              class_color_dropdown.appendChild(entry);
          });
}

function select_class_for_color(e, selector) {
    const basis = parseInt(selector.value);
    class_color_selector.value = options.color_for_class(basis);
}

function select_color_for_class(e, selector) {
    const color = selector.value;
    const basis = parseInt(class_color_dropdown.value);
    options.set_color_for_class(basis, color);
    color_updated();
}

function reset_class_colors() {
    options.reset_class_colors_to_default();
    // Show the newly updated color for the currently selected class type.
    select_class_for_color(null, class_color_dropdown);
    color_updated();
}

function toggle_graph_transpose(e, checkbox) {
    options.transpose = checkbox.checked;
    transpose_updated();
}

function show_bad_opacity_value(str) {
    bad_filter_opacity_text.textContent = `Bad opacity value "${str}"`;
    bad_filter_opacity_text.hidden = false;
}

function hide_bad_filter_opacity_value() {
    bad_filter_opacity_text.hidden = true;
}

function valid_opacity_value(edit) {
    var str = edit.value;
    if (str == "")
        return false;
    if (isNaN(str))
        return false;
    var percentage = parseInt(str);
    if (percentage < 0 || percentage > 100)
        return false;
    return true;
}

var filter_opacity_timeout_delay = 250; // 0.25s
var filter_opacity_timeout;

function filter_opacity_keyup(e, text_input) {
    hide_bad_filter_opacity_value();
    clearInterval(filter_opacity_timeout);
    filter_opacity_timeout = setInterval(function() {
        if (valid_opacity_value(text_input)) {
            var percentage = parseInt(text_input.value);
            options.deselected_opacity = percentage * 0.01;
            color_updated();
        }
        else {
            show_bad_opacity_value(text_input.value);
        }
        clearInterval(filter_opacity_timeout);
    }, filter_opacity_timeout_delay);
}

function toggle_graph_fps(e, checkbox) {
    options.show_fps = checkbox.checked;
    // No updated needed.  It is checked in the draw() function.
}

function init_options_dialog() {
    options = new Options();
    populate_decl_color_dropdown();
    populate_class_color_dropdown();

    decl_color_dropdown.addEventListener("change", event => select_decl_for_color(event, decl_color_dropdown));
    decl_color_selector.addEventListener("change", event => select_color_for_decl(event, decl_color_selector));
    reset_decl_colors_btn.addEventListener("click", e => reset_decl_colors());
    transpose_graph_toggle.addEventListener("click", event => toggle_graph_transpose(event, transpose_graph_toggle));
    class_color_dropdown.addEventListener("change", event => select_class_for_color(event, class_color_dropdown));
    class_color_selector.addEventListener("change", event => select_color_for_class(event, class_color_selector));
    reset_class_colors_btn.addEventListener("click", e => reset_class_colors());
    filter_opacity_edit.addEventListener("keyup", event => filter_opacity_keyup(event, filter_opacity_edit));
    graph_fps_toggle.addEventListener("click", event => toggle_graph_fps(event, graph_fps_toggle));

    // Defaults
    // Populate the default color box.
    select_decl_for_color(null, decl_color_dropdown);
    transpose_graph_toggle.checked = options.transpose;
    select_class_for_color(null, class_color_dropdown);
    bad_filter_opacity_text.hidden = true;
    filter_opacity_edit.value = (100 * options.deselected_opacity).toString();
    graph_fps_toggle.checked = options.show_fps;
}