function ifc_explorer_clear_content(content) {
    // Yes, it is intentional to check for the first and remove the last.
    while (content.firstChild != null) {
        content.removeChild(content.lastChild);
    }
}

const ifc_explorer_css_class = "class='explorer-element'";

class IFCExplorerJSONReplacer {
    static replace_text_offset(offset) {
        const text = sgraph.resolver.resolve_text_offset(offset);
        return `(${offset.offset}) = ${text}`;
    }

    static replace_name_index(index) {
        const text = sgraph.resolver.resolve_name_index(index);
        const sort = sort_to_string(NameIndex, index.sort);
        return `NameIndex{${index.sort}(${sort}),${index.index}} = '${text}'`;
    }

    static replace_locus(locus) {
        const resolved_locus = new ResolvedLocus(locus, sgraph.resolver);
        return `Locus{${locus.line}(line)} = ${resolved_locus.file}(${resolved_locus.line},${resolved_locus.column})`
    }

    static replace_decl_index(index) {
        if (null_index(index))
            return "DeclIndex{null}";
        const sort = sort_to_string(DeclIndex, index.sort);
        const call_func = `onclick='set_ifc_explorer_selected_decl({ sort: ${index.sort}, index: ${index.index}})'`;
        return `<a ${ifc_explorer_css_class} ${call_func}>DeclIndex{${index.sort}(${sort}),${index.index}}</a>`;
    }

    static replace_type_index(index) {
        if (null_index(index))
            return "TypeIndex{null}";
        const sort = sort_to_string(TypeIndex, index.sort);
        const call_func = `onclick='set_ifc_explorer_selected_type({ sort: ${index.sort}, index: ${index.index}})'`;
        return `<a ${ifc_explorer_css_class} ${call_func}>TypeIndex{${index.sort}(${sort}),${index.index}}</a>`;
    }

    static replace_expr_index(index) {
        if (null_index(index))
            return "ExprIndex{null}";
        const sort = sort_to_string(ExprIndex, index.sort);
        const call_func = `onclick='set_ifc_explorer_selected_expr({ sort: ${index.sort}, index: ${index.index}})'`;
        return `<a ${ifc_explorer_css_class} ${call_func}>ExprIndex{${index.sort}(${sort}),${index.index}}</a>`;
    }

    static replace_lit_index(index) {
        const literal = sgraph.resolver.resolve_lit_index(index);
        const sort = sort_to_string(LitIndex, index.sort);
        const lit_index_str = `LitIndex{${index.sort}(${sort}),${index.index}}`;
        if (index.sort == LitIndex.Sort.Immediate)
            return `${lit_index_str} = ${literal.value}`;
        return { index: lit_index_str, value: literal };
    }

    static replace_operator(op) {
        const sort = sort_to_string(Operator, op.sort);
        console.log(op);
        return { sort: sort, value: op.value };
    }

    static generic_bitset_to_string(T, bitset) {
        return bitset_to_string(T, bitset.value);
    }

    static generic_value_to_string(T, value) {
        const str = value_to_string(T, value.value);
        return `${str}(${value.value})`;
    }
}

function ifc_explorer_json_replacer(key, value) {
    if (value instanceof DeclIndex)
        return IFCExplorerJSONReplacer.replace_decl_index(value);
    if (value instanceof TypeIndex)
        return IFCExplorerJSONReplacer.replace_type_index(value);
    if (value instanceof ExprIndex)
        return IFCExplorerJSONReplacer.replace_expr_index(value);
    if (value instanceof TextOffset)
        return IFCExplorerJSONReplacer.replace_text_offset(value);
    if (value instanceof NameIndex)
        return IFCExplorerJSONReplacer.replace_name_index(value);
    if (value instanceof LitIndex)
        return IFCExplorerJSONReplacer.replace_lit_index(value);
    if (value instanceof SourceLocation)
        return IFCExplorerJSONReplacer.replace_locus(value);
    if (value instanceof Operator)
        return IFCExplorerJSONReplacer.replace_operator(value);
    if (value instanceof BasicSpecifiers)
        return IFCExplorerJSONReplacer.generic_bitset_to_string(BasicSpecifiers, value);
    if (value instanceof ReachableProperties)
        return IFCExplorerJSONReplacer.generic_bitset_to_string(ReachableProperties, value);
    if (value instanceof FunctionTraits)
        return IFCExplorerJSONReplacer.generic_bitset_to_string(FunctionTraits, value);
    if (value instanceof FunctionTypeTraits)
        return IFCExplorerJSONReplacer.generic_bitset_to_string(FunctionTypeTraits, value);
    if (value instanceof Qualifier)
        return IFCExplorerJSONReplacer.generic_bitset_to_string(Qualifier, value);
    if (value instanceof TypeBasis)
        return IFCExplorerJSONReplacer.generic_value_to_string(TypeBasis, value);
    if (value instanceof TypePrecision)
        return IFCExplorerJSONReplacer.generic_value_to_string(TypePrecision, value);
    if (value instanceof TypeSign)
        return IFCExplorerJSONReplacer.generic_value_to_string(TypeSign, value);
    if (value instanceof CallingConvention)
        return IFCExplorerJSONReplacer.generic_value_to_string(CallingConvention, value);
    if (value instanceof Access)
        return IFCExplorerJSONReplacer.generic_value_to_string(Access, value);
    if (value instanceof ReadExprKind)
        return IFCExplorerJSONReplacer.generic_value_to_string(ReadExprKind, value);
    if (value instanceof NiladicOperator)
        return IFCExplorerJSONReplacer.generic_value_to_string(NiladicOperator, value);
    if (value instanceof MonadicOperator)
        return IFCExplorerJSONReplacer.generic_value_to_string(MonadicOperator, value);
    if (value instanceof DyadicOperator)
        return IFCExplorerJSONReplacer.generic_value_to_string(DyadicOperator, value);
    if (value instanceof TriadicOperator)
        return IFCExplorerJSONReplacer.generic_value_to_string(TriadicOperator, value);
    if (value instanceof VariadicOperator)
        return IFCExplorerJSONReplacer.generic_value_to_string(VariadicOperator, value);

    // Skip these instances.
    if (value instanceof StructPadding)
        return undefined;

    return value;
}

function set_ifc_explorer_selected_decl(index) {
    if (null_index(index)) return;
    ifc_explorer_clear_content(ifc_explorer.decls.content);

    // Update edits.
    ifc_explorer.decls.sort_dropdown.selectedIndex = Array
                                                        .from(ifc_explorer.decls.sort_dropdown.options)
                                                        .findIndex(opt => opt.value == index.sort);
    ifc_explorer.decls.index_edit.value = index.index;

    const symbolic = symbolic_for_decl_sort(index.sort);
    const symbolic_decl = sgraph.resolver.read(symbolic, index.index);
    const json_str = JSON.stringify(symbolic_decl, ifc_explorer_json_replacer, 2);
    const container = document.createElement("pre");
    const sort = sort_to_string(DeclIndex, index.sort);
    container.innerHTML = `DeclIndex{${index.sort}(${sort}),${index.index}}\n${json_str}`;
    ifc_explorer.decls.content.appendChild(container);

    const tab = $(ifc_explorer.decls.tab);
    tab.tab("show");
}

function ifc_explorer_load_decl(e) {
    const sort = parseInt(ifc_explorer.decls.sort_dropdown.value);
    const index = parseInt(ifc_explorer.decls.index_edit.value);
    set_ifc_explorer_selected_decl({ sort: sort, index: index });
}

function ifc_explorer_init_decls() {
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
                    entry.textContent = `${element[0]} - ${element[1]}`;
                    entry.value = element[1];
                    ifc_explorer.decls.sort_dropdown.appendChild(entry);
                }
          });

    ifc_explorer.decls.index_edit.addEventListener("keyup", e => { if (e.key === "Enter") ifc_explorer_load_decl(e); });
    ifc_explorer.decls.load.addEventListener("click", e => ifc_explorer_load_decl(e));
}

function set_ifc_explorer_selected_type(index) {
    if (null_index(index)) return;
    ifc_explorer_clear_content(ifc_explorer.types.content);

    // Update edits.
    ifc_explorer.types.sort_dropdown.selectedIndex = Array
                                                      .from(ifc_explorer.types.sort_dropdown.options)
                                                      .findIndex(opt => opt.value == index.sort);
    ifc_explorer.types.index_edit.value = index.index;

    const symbolic = symbolic_for_type_sort(index.sort);
    const symbolic_decl = sgraph.resolver.read(symbolic, index.index);
    const json_str = JSON.stringify(symbolic_decl, ifc_explorer_json_replacer, 2);
    const container = document.createElement("pre");
    const sort = sort_to_string(TypeIndex, index.sort);
    container.innerHTML = `TypeIndex{${index.sort}(${sort}),${index.index}}\n${json_str}`;
    ifc_explorer.types.content.appendChild(container);

    const tab = $(ifc_explorer.types.tab);
    tab.tab("show");
}

function ifc_explorer_load_type(e) {
    const sort = parseInt(ifc_explorer.types.sort_dropdown.value);
    const index = parseInt(ifc_explorer.types.index_edit.value);
    set_ifc_explorer_selected_type({ sort: sort, index: index });
}

function ifc_explorer_init_types() {
    Object.entries(TypeIndex.Sort)
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
                    entry.textContent = `${element[0]} - ${element[1]}`;
                    entry.value = element[1];
                    ifc_explorer.types.sort_dropdown.appendChild(entry);
                }
          });

    ifc_explorer.types.index_edit.addEventListener("keyup", e => { if (e.key === "Enter") ifc_explorer_load_type(e); });
    ifc_explorer.types.load.addEventListener("click", e => ifc_explorer_load_type(e));
}

function set_ifc_explorer_selected_expr(index) {
    if (null_index(index)) return;
    ifc_explorer_clear_content(ifc_explorer.exprs.content);

    // Update edits.
    ifc_explorer.exprs.sort_dropdown.selectedIndex = Array
                                                      .from(ifc_explorer.exprs.sort_dropdown.options)
                                                      .findIndex(opt => opt.value == index.sort);
    ifc_explorer.exprs.index_edit.value = index.index;

    const symbolic = symbolic_for_expr_sort(index.sort);
    const symbolic_decl = sgraph.resolver.read(symbolic, index.index);
    const json_str = JSON.stringify(symbolic_decl, ifc_explorer_json_replacer, 2);
    const container = document.createElement("pre");
    const sort = sort_to_string(ExprIndex, index.sort);
    container.innerHTML = `ExprIndex{${index.sort}(${sort}),${index.index}}\n${json_str}`;
    ifc_explorer.exprs.content.appendChild(container);

    const tab = $(ifc_explorer.exprs.tab);
    tab.tab("show");
}

function ifc_explorer_load_expr(e) {
    const sort = parseInt(ifc_explorer.exprs.sort_dropdown.value);
    const index = parseInt(ifc_explorer.exprs.index_edit.value);
    set_ifc_explorer_selected_expr({ sort: sort, index: index });
}

function ifc_explorer_init_exprs() {
    Object.entries(ExprIndex.Sort)
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
                    entry.textContent = `${element[0]} - ${element[1]}`;
                    entry.value = element[1];
                    ifc_explorer.exprs.sort_dropdown.appendChild(entry);
                }
          });

    ifc_explorer.exprs.index_edit.addEventListener("keyup", e => { if (e.key === "Enter") ifc_explorer_load_expr(e); });
    ifc_explorer.exprs.load.addEventListener("click", e => ifc_explorer_load_expr(e));
}

function ifc_explorer_init_header() {
    const json_str = JSON.stringify(sgraph.header, null, 2);
    const container = document.createElement("pre");
    container.innerHTML = json_str;
    ifc_explorer.header.content.appendChild(container);
}

function ifc_explorer_toc_replacer(key, value) {
    if (value instanceof Map)
        return Array.from(value.entries());
    return value;
}

function ifc_explorer_init_toc() {
    const json_str = JSON.stringify(sgraph.resolver.toc.partition_by_name_map, ifc_explorer_toc_replacer, 2);
    const container = document.createElement("pre");
    container.innerHTML = json_str;
    ifc_explorer.toc.content.appendChild(container);
}

function ifc_explorer_ifc_loaded() {
    ifc_explorer.button.hidden = false;
    ifc_explorer_init_decls();
    ifc_explorer_init_types();
    ifc_explorer_init_exprs();
    ifc_explorer_init_header();
    ifc_explorer_init_toc();
}

function init_ifc_explorer() {
    ifc_explorer.button.hidden = true;
}