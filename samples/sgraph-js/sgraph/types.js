
class FundamentalType {
    static partition_name = "type.fundamental";

    constructor(reader) {
        this.basis = new TypeBasis(reader);
        this.precision = new TypePrecision(reader);
        this.sign = new TypeSign(reader);
    }
}

class DesignatedType {
    static partition_name = "type.designated";

    constructor(reader) {
        this.decl = new DeclIndex(reader);
    }
}

class TorType {
    static partition_name = "type.tor";

    constructor(reader) {
        this.source = new TypeIndex(reader);
        this.eh_spec = new NoexceptSpecification(reader);
        this.convention = new CallingConvention(reader);
    }
}

class SyntacticType {
    static partition_name = "type.syntactic";

    constructor(reader) {
        this.expr = new ExprIndex(reader);
    }
}

class ExpansionType {
    static partition_name = "type.expansion";

    constructor(reader) {
        this.operand = new TypeIndex(reader);
        this.mode = new ExpansionMode(reader);
    }
}

class PointerType {
    static partition_name = "type.pointer";

    constructor(reader) {
        this.pointee = new TypeIndex(reader);
    }
}

class PointerToMemberType {
    static partition_name = "type.pointer-to-member";

    constructor(reader) {
        this.scope = new TypeIndex(reader);
        this.type = new TypeIndex(reader);
    }
}

class LvalueReferenceType {
    static partition_name = "type.lvalue-reference";

    constructor(reader) {
        this.referee = new TypeIndex(reader);
    }
}

class RvalueReferenceType {
    static partition_name = "type.rvalue-reference";

    constructor(reader) {
        this.referee = new TypeIndex(reader);
    }
}

class FunctionType {
    static partition_name = "type.function";

    constructor(reader) {
        this.target = new TypeIndex(reader);
        this.source = new TypeIndex(reader);
        this.eh_spec = new NoexceptSpecification(reader);
        this.convention = new CallingConvention(reader);
        this.traits = new FunctionTypeTraits(reader);
    }
}

class MethodType {
    static partition_name = "type.nonstatic-member-function";

    constructor(reader) {
        this.target = new TypeIndex(reader);
        this.source = new TypeIndex(reader);
        this.class_type = new TypeIndex(reader);
        this.eh_spec = new NoexceptSpecification(reader);
        this.convention = new CallingConvention(reader);
        this.traits = new FunctionTypeTraits(reader);
    }
}

class ArrayType {
    static partition_name = "type.array";

    constructor(reader) {
        this.element = new TypeIndex(reader);
        this.bound = new ExprIndex(reader);
    }
}

class TypenameType {
    static partition_name = "type.typename";

    constructor(reader) {
        this.path = new ExprIndex(reader);
    }
}

class QualifiedType {
    static partition_name = "type.qualified";

    constructor(reader) {
        this.unqualified_type = new TypeIndex(reader);
        this.qualifiers = new Qualifier(reader);
    }
}

class BaseType {
    static partition_name = "type.base";

    constructor(reader) {
        this.type = new TypeIndex(reader);
        this.access = new Access(reader);
        this.traits = new BaseClassTraits(reader);
    }
}

class DecltypeType {
    static partition_name = "type.decltype";

    constructor(reader) {
        this.expression = new SyntaxIndex(reader);
    }
}

class PlaceholderType {
    static partition_name = "type.placeholder";

    constructor(reader) {
        this.constraint = new ExprIndex(reader);
        this.basis = new TypeBasis(reader);
        this.elaboration = new TypeIndex(reader);
    }
}

class TupleType {
    static partition_name = "type.tuple";

    constructor(reader) {
        this.expression = new HeapSequence(HeapSort.Values.Type, reader);
    }
}

class ForallType {
    static partition_name = "type.forall";

    constructor(reader) {
        this.chart = new ChartIndex(reader);
        this.subject = new TypeIndex(reader);
    }
}

class UnalignedType {
    static partition_name = "type.unaligned";

    constructor(reader) {
        this.type = new TypeIndex(reader);
    }
}

class SyntaxTreeType {
    static partition_name = "type.syntax-tree";

    constructor(reader) {
        this.syntax = new SyntaxIndex(reader);
    }
}

function symbolic_for_type_sort(sort) {
    switch (sort) {
    case TypeIndex.Sort.Fundamental:
        return FundamentalType;
    case TypeIndex.Sort.Designated:
        return DesignatedType;
    case TypeIndex.Sort.Tor:
        return TorType;
    case TypeIndex.Sort.Syntactic:
        return SyntacticType;
    case TypeIndex.Sort.Expansion:
        return ExpansionType;
    case TypeIndex.Sort.Pointer:
        return PointerType;
    case TypeIndex.Sort.PointerToMember:
        return PointerToMemberType;
    case TypeIndex.Sort.LvalueReference:
        return LvalueReferenceType;
    case TypeIndex.Sort.RvalueReference:
        return RvalueReferenceType;
    case TypeIndex.Sort.Function:
        return FunctionType;
    case TypeIndex.Sort.Method:
        return MethodType;
    case TypeIndex.Sort.Array:
        return ArrayType;
    case TypeIndex.Sort.Typename:
        return TypenameType;
    case TypeIndex.Sort.Qualified:
        return QualifiedType;
    case TypeIndex.Sort.Base:
        return BaseType;
    case TypeIndex.Sort.Decltype:
        return DecltypeType;
    case TypeIndex.Sort.Placeholder:
        return PlaceholderType;
    case TypeIndex.Sort.Tuple:
        return TupleType;
    case TypeIndex.Sort.Forall:
        return ForallType;
    case TypeIndex.Sort.Unaligned:
        return UnalignedType;
    case TypeIndex.Sort.SyntaxTree:
        return SyntaxTreeType;
    case TypeIndex.Sort.VendorExtension:
    default:
        console.error(`Bad sort: ${sort}`);
        return null;
    }
}