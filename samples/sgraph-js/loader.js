function has_property(obj, prop) {
    return obj.hasOwnProperty(prop);
}

function log_header(header) {
    if (!header.valid())
        console.log("not valid header!");
    else
        console.log("is valid header");
    console.log("content hash:", header.content_hash.as_string());
    console.log("arch kind:", header.arch.kind());
    console.log("__cplusplus:", header.cplusplus.cplusplus);
    console.log("string table offset:", header.string_table_offset);
    console.log("string table size:", header.string_table_size);
}

function log_string_table(string_table) {
    console.log(string_table.strings);
}

function log_partitions(toc, string_table) {
    for (var i = 0; i < toc.partitions.length; ++i) {
        var p = toc.partitions[i];
        const partition_name = string_table.get(p.name);
        console.log("partition name: ", partition_name);
        console.log("partition by name: ", toc.partition_by_name(partition_name));
    }
}

function log_decl(resolver, decl) {
    if (decl.decl.sort == DeclIndex.Sort.Scope) {
        var scope_decl = resolver.read(ScopeDecl, decl.decl.index);
        var identity = resolver.resolve_identity(scope_decl.identity);
        console.log(`UDT name ${identity.name}.  locus: ${identity.locus.file}:(${identity.locus.line},${identity.locus.column})`);
    }
}

function json_for_scope(resolver, index, template_name, root) {
    const scope_decl = resolver.read(ScopeDecl, index.index);
    var scope_name = template_name;
    if (scope_name == null)
        scope_name = append_name_meta(resolver.resolve_name_index(scope_decl.identity.name), index);
    if (scope_decl.initializer != 0) {
        var nested_root = { };
        const scope = resolver.decls_for_scope(scope_decl.initializer);
        // Defined, but no members.
        if (scope.length == 0) {
            root[scope_name] = 1;
        }
        else {
            for (var i = 0; i < scope.length; ++i) {
                const decl = scope[i];
                build_json(resolver, decl, nested_root);
            }
            root[scope_name] = nested_root;
        }
    }
    else {
        root[scope_name] = 1;
    }
}

function json_for_enumeration(resolver, index, root) {
    const enum_decl = resolver.read(EnumerationDecl, index.index);
    const enum_name = append_name_meta(resolver.resolve_text_offset(enum_decl.identity.name), index);
    if (enum_decl.initializer.cardinality == 0) {
        root[enum_name] = 1;
    }
    else {
        var nested_root = { };
        const enumerators = resolver.decls_for_enumeration(enum_decl.initializer);
        for (var i = 0; i < enumerators.length; ++i) {
            const decl = enumerators[i];
            build_json(resolver, decl, nested_root);
        }
        root[enum_name] = nested_root;
    }
}

function json_for_parameterized_scope(resolver, template_decl, index, root) {
    const identity = resolver.resolve_identity(template_decl.identity);
    const name = append_name_meta(identity.name, index);
    json_for_scope(resolver, template_decl.entity.decl, name, root);
}

function json_for_template(resolver, index, root) {
    const template_decl = resolver.read(TemplateDecl, index.index);
    switch (template_decl.entity.decl.sort) {
    case DeclIndex.Sort.Scope:
        json_for_parameterized_scope(resolver, template_decl, index, root);
        break;
    default:
        json_for_unsorted(resolver, index, root);
        break;
    }
}

function json_for_unsorted(resolver, index, root) {
    const symbolic = symbolic_for_decl_sort(index.sort);
    var symbolic_decl = resolver.read(symbolic, index.index);
    if (symbolic_decl.identity == null) {
        root[`unknown_${sort_to_string(DeclIndex, index.sort)}_${index.index}`] = 1;
        return;
    }
    const identity = resolver.resolve_identity(symbolic_decl.identity);
    const name = append_name_meta(identity.name, index);
    root[name] = 1;
}

function build_json(resolver, decl, root) {
    //log_decl(resolver, decl);
    switch (decl.decl.sort) {
    case DeclIndex.Sort.Scope:
        json_for_scope(resolver, decl.decl, null, root);
        break;
    case DeclIndex.Sort.Enumeration:
        json_for_enumeration(resolver, decl.decl, root);
        break;
    case DeclIndex.Sort.Template:
        json_for_template(resolver, decl.decl, root);
        break;
    default:
        json_for_unsorted(resolver, decl.decl, root);
        break;
    }
}

function implies(x, y) {
    return (x & y) == y;
}

function format_basic_spec(decl) {
    if (!has_property(decl, "basic_spec"))
        return "";
    return bitset_to_string(BasicSpecifiers, decl.basic_spec.value)
}

function on_decl_selected(decl) {
    if (!is_meta_name(decl)) {
        set_decl_preview_content(decl);
        return;
    }
    const resolved_name = name_and_index_from_meta(decl);
    if (resolved_name.index == null) {
        return;
    }
    const symbolic = symbolic_for_decl_sort(resolved_name.index.sort);
    const symbolic_decl = sgraph.resolver.read(symbolic, resolved_name.index.index);
    const decl_index_str = `DeclIndex{${sort_to_string(DeclIndex, resolved_name.index.sort)}, ${resolved_name.index.index}}`;
    const locus = sgraph.resolver.resolve_identity(symbolic_decl.identity).locus;
    const locus_str = `"${locus.file}"(${locus.line},${locus.column})`;
    const basic_spec = format_basic_spec(symbolic_decl);
    const json_str = JSON.stringify(symbolic_decl, null, 2);
    set_decl_preview_content("<pre>" + `${decl_index_str}\n${basic_spec}\n${locus_str}\n` + json_str + "</pre>");
    set_ifc_explorer_selected_decl(resolved_name.index);
}

function init_sgraph(resolver, header) {
    sgraph = { resolver: resolver, header: header };
}

function read_ifc(reader, header) {
    //log_header(header);
    var string_table = new StringTable(reader, header.string_table_offset, header.string_table_size);
    //log_string_table(string_table);
    console.log("module name: ", string_table.get(header.unit_sort.ifc_designator()));
    var toc = new ToC(reader, header, string_table);
    //log_partitions(toc, string_table);
    var resolver = new Resolver(reader, toc, string_table);
    init_sgraph(resolver, header);
    var global_scope = resolver.decls_for_scope(header.scope_index);
    var json = { };
    json["global"] = { };
    for (var i = 0; i < global_scope.length; ++i) {
        var decl = global_scope[i];
        build_json(resolver, decl, json["global"]);
    }
    init_graph(json);
}

function display_ifc_info(file) {
    title.hidden = true;
    file_selector.hidden = true;
    output.innerHTML = '';
    const module_name = sgraph.resolver.string_table.get(sgraph.header.unit_sort.ifc_designator());
    const ifc_version = `${sgraph.header.version.major}.${sgraph.header.version.minor}`;
    const ifc_info = document.createElement('h5');
    ifc_info.innerHTML = `filename: <b>${file.name}</b> module name: <b>${module_name}</b> IFC version: <b>${ifc_version}</b> size: <b>${file.size}</b>`;
    output.appendChild(ifc_info);
}

function validate_sort(T) {
    console.log("Validating:", T.name);
    var sorts = Object.entries(T.Sort).sort((a, b) => a[1] - b[1]);
    var last = -1;
    for (var i = 0; i < sorts.length; ++i) {
        if ((last + 1) != sorts[i][1]) {
            console.log(`Bad sort: ${sorts[i][0]} value: ${sorts[i][1]}`);
            return false;
        }
        last = sorts[i][1];
    }
    return true;
}

function validate_sorts() {
    return validate_sort(DeclIndex)
        && validate_sort(ExprIndex)
        && validate_sort(NameIndex)
        && validate_sort(TypeIndex)
        && validate_sort(UnitIndex);
}

if (window.FileList && window.File) {
    file_selector.addEventListener('dragover', event => {
        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    });
    file_selector.addEventListener('drop', event => {
        //output.innerHTML = '';
        event.stopPropagation();
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (!validate_sorts()) {
            console.error("Bad sort detected");
            return;
        }
        if (files.length != 1) {
            output.textContent = "One IFC at a time, please.";
            return;
        }
        const file = files[0];
        const reader = new FileReader();
        reader.addEventListener('load', (event) => {
            console.log("file read.");
            console.log("byte length: ", event.target.result.byteLength);
            const view = new Uint8Array(event.target.result);
            var reader = new RawByteReader(view);
            const header = new Header(reader);
            if (!header.valid()) {
                output.textContent = "invalid IFC";
                return;
            }
            read_ifc(reader, header);
            display_ifc_info(file);
            ifc_explorer_ifc_loaded();
        });
        reader.readAsArrayBuffer(file);
    });
}

$(document).ready(function() {
    init_decl_preview();
    init_filters();
    init_options_dialog();
    init_ifc_explorer();
})