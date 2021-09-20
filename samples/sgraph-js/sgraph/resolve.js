class Resolver {
    constructor(reader, toc, string_table) {
        this.reader = reader;
        this.toc = toc;
        this.string_table = string_table;
    }

    read(T, index) {
        const partition = this.toc.partition(T);
        const offset = partition.tell(index);
        this.reader.seek(offset);
        return new T(this.reader);
    }

    offset_read(T, off) {
        this.reader.seek(off);
        return new T(this.reader);
    }

    resolve_line_index(index) {
        return this.read(FileAndLine, index);
    }

    resolve_source_file(index) {
        return this.read(SourceFileName, index.index);
    }

    resolve_operator_id(index) {
        return this.read(OperatorFunctionId, index.index);
    }

    resolve_name_index(index) {
        switch (index.sort) {
        case NameIndex.Sort.Identifier:
            return this.string_table.get(index.index);
        case NameIndex.Sort.Operator:
            return this.resolve_text_offset(this.resolve_operator_id(index).name);
        case NameIndex.Sort.Conversion:
        case NameIndex.Sort.Literal:
        case NameIndex.Sort.Template:
        case NameIndex.Sort.Specialization:
        case NameIndex.Sort.SourceFile:
                return this.string_table.get(this.resolve_source_file(index).name);
        case NameIndex.Sort.Guide:
        }
        return "";
    }

    resolve_text_offset(offset) {
        return this.string_table.get(offset.offset);
    }

    resolve_identity(identity) {
        if (identity instanceof IdentityTextOffset) {
            return { name: this.resolve_text_offset(identity.name), locus: new ResolvedLocus(identity.locus, this) };
        }

        if (identity instanceof IdentityNameIndex) {
            return { name: this.resolve_name_index(identity.name), locus: new ResolvedLocus(identity.locus, this) };
        }
    }

    resolve_lit_index(index) {
        if (index.sort == LitIndex.Sort.Immediate)
            return new ImmediateLiteral(index);
        const symbolic = symbolic_for_lit_sort(index.sort);
        const literal = this.read(symbolic, index.index);
        return literal;
    }

    decls_for_scope(index) {
        // Note: ScopeIndex is a 1-based index but stored in the IFC as 0-based.
        const scope = this.read(Scope, index - 1);
        const partition = this.toc.partition(Declaration);
        var offset = partition.tell(scope.seq.start);
        var decls = new Array();
        for (var i = 0; i < scope.seq.cardinality; ++i) {
            decls.push(this.offset_read(Declaration, offset));
            offset += partition.entry_size;
        }
        return decls;
    }

    decls_for_enumeration(seq) {
        const partition = this.toc.partition(EnumeratorDecl);
        var offset = partition.tell(seq.start);
        var decls = new Array();
        for (var i = 0; i < seq.cardinality; ++i) {
            var rel_index = (offset - partition.offset) / partition.entry_size;
            var index = { sort: DeclIndex.Sort.Enumerator, index: rel_index };
            var decl = { decl: index };
            decls.push(decl);
            offset += partition.entry_size;
        }
        return decls;
    }

    fundamental_type_is_class(decl) {
        if (decl.type.sort != TypeIndex.Sort.Fundamental)
            return false;
        const fun_type = this.read(FundamentalType, decl.type.index);
        switch (fun_type.basis.value) {
        case TypeBasis.Values.Class:
        case TypeBasis.Values.Struct:
        case TypeBasis.Values.Union:
            return true;
        default:
            return false;
        }
    }
}

class ResolvedLocus {
    constructor(locus, resolver) {
        var file_and_line = resolver.resolve_line_index(locus.line);
        this.file = resolver.resolve_name_index(file_and_line.file);
        this.line = file_and_line.line;
        this.column = locus.column;
    }
}