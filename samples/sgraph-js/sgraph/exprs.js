class EmptyExpr {
    static partition_name = "expr.empty";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
    }
}

class LiteralExpr {
    static partition_name = "expr.literal";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.value = new LitIndex(reader);
    }
}

class LambdaExpr {
    static partition_name = "expr.lambda";

    constructor(reader) {
        this.introducer = new SyntaxIndex(reader);
        this.template_parameters = new SyntaxIndex(reader);
        this.declarator = new SyntaxIndex(reader);
        this.requires_clause = new SyntaxIndex(reader);
        this.body = new SyntaxIndex(reader);
    }
}

class TypeExpr {
    static partition_name = "expr.type";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.denotation = new TypeIndex(reader);
    }
}

class NamedDeclExpr {
    static partition_name = "expr.decl";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.decl = new DeclIndex(reader);
    }
}

class UnresolvedIdExpr {
    static partition_name = "expr.unresolved";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.name = new NameIndex(reader);
    }
}

class TemplateIdExpr {
    static partition_name = "expr.template-id";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.primary_template = new ExprIndex(reader);
        this.arguments = new ExprIndex(reader);
    }
}

class UnqualifiedIdExpr {
    static partition_name = "expr.unqualified-id";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.name = new NameIndex(reader);
        this.symbol = new ExprIndex(reader);
        this.template_keyword = new SourceLocation(reader);
    }
}

class SimpleIdentifierExpr {
    static partition_name = "expr.simple-identifier";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.name = new NameIndex(reader);
    }
}

class PointerExpr {
    static partition_name = "expr.pointer";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
    }
}

class QualifiedNameExpr {
    static partition_name = "expr.qualified-name";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.elements = new ExprIndex(reader);
        this.typename_keyword = new SourceLocation(reader);
    }
}

class PathExpr {
    static partition_name = "expr.path";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.scope = new ExprIndex(reader);
        this.member = new ExprIndex(reader);
    }
}

class ReadExprKind {
    static Values = {
        Unknown:            0, // Unknown
        Indirection:        1, // Dereference a pointer, e.g. *p
        RemoveReference:    2, // Convert a reference into an lvalue
        LvalueToRvalue:     3, // lvalue-to-rvalue conversion
        IntegralConversion: 4, // Integral conversion (should be removed once we purge these from the FE)
        Count:              5
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class ReadExpr {
    static partition_name = "expr.read";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.child = new ExprIndex(reader);
        this.kind = new ReadExprKind(reader);
    }
}

class MonadExpr {
    static partition_name = "expr.monad";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.unary = new ExprIndex(reader);
        this.assort = read_op(MonadicOperator, reader);
    }
}

class DyadExpr {
    static partition_name = "expr.dyad";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.left = new ExprIndex(reader);
        this.right = new ExprIndex(reader);
        this.assort = read_op(DyadicOperator, reader);
    }
}

class TriadExpr {
    static partition_name = "expr.triad";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.left = new ExprIndex(reader);
        this.mid = new ExprIndex(reader);
        this.right = new ExprIndex(reader);
        this.assort = read_op(TriadicOperator, reader);
    }
}

class StringExpr {
    static partition_name = "expr.strings";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.string = new StringIndex(reader);
    }
}

class TemporaryExpr {
    static partition_name = "expr.temporary";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.index = reader.read_uint32();
    }
}

class CallExpr {
    static partition_name = "expr.call";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.function = new ExprIndex(reader);
        this.arguments = new ExprIndex(reader);
    }
}

class MemberInitializerExpr {
    static partition_name = "expr.member-initializer";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.member = new DeclIndex(reader);
        this.base = new TypeIndex(reader);
        this.expression = new ExprIndex(reader);
    }
}

class MemberAccessExpr {
    static partition_name = "expr.member-access";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.offset = new ExprIndex(reader);
        this.parent = new TypeIndex(reader);
        this.name = new TextOffset(reader);
    }
}

class InheritancePathExpr {
    static partition_name = "expr.inheritance-path";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.path = new ExprIndex(reader);
    }
}

class InitializerListExpr {
    static partition_name = "expr.initializer-list";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.elements = new ExprIndex(reader);
    }
}

class CastExpr {
    static partition_name = "expr.cast";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.source = new ExprIndex(reader);
        this.target = new TypeIndex(reader);
        this.assort = read_op(DyadicOperator, reader);
    }
}

class ConditionExpr {
    static partition_name = "expr.condition";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.expression = new ExprIndex(reader);
    }
}

class ExpressionListDelimiter {
    static Values = {
        Unknown:     0,
        Brace:       1,
        Parenthesis: 2,
        Count:       3
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class ExpressionListExpr {
    static partition_name = "expr.expression-list";

    constructor(reader) {
        this.left_delimiter = new SourceLocation(reader);
        this.right_delimiter = new SourceLocation(reader);
        this.expressions = new ExprIndex(reader);
        this.delimiter = new ExpressionListDelimiter(reader);
    }
}

class SizeofTypeIdExpr {
    static partition_name = "expr.sizeof-type";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.operand = new TypeIndex(reader);
    }
}

class AlignofExpr {
    static partition_name = "expr.alignof";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.type_id = new TypeIndex(reader);
    }
}

class NewExpr {
    static partition_name = "expr.new";

    constructor(reader) {
        this.double_colon = new SourceLocation(reader);
        this.new_keyword = new SourceLocation(reader);
        this.allocated_type = new TypeIndex(reader);
        this.placement = new ExprIndex(reader);
        this.initializer = new ExprIndex(reader);
    }
}

class DeleteExpr {
    static partition_name = "expr.delete";

    constructor(reader) {
        this.double_colon = new SourceLocation(reader);
        this.delete_keyword = new SourceLocation(reader);
        this.expr = new ExprIndex(reader);
    }
}

class TypeidExpr {
    static partition_name = "expr.typeid";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.operand = new TypeIndex(reader);
    }
}

class DestructorCallKind {
    static Values = {
        Unknown:    0,
        Destructor: 1,
        Finalizer:  2,
        Count:      3
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class DestructorCallExpr {
    static partition_name = "expr.destructor-call";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.name = new ExprIndex(reader);
        this.decltype_specifier = new SyntaxIndex(reader);
        this.kind = new DestructorCallKind(reader);
    }
}

class SyntaxTreeExpr {
    static partition_name = "expr.syntax-tree";

    constructor(reader) {
        this.syntax = new SyntaxIndex(reader);
    }
}

class FunctionStringExpr {
    static partition_name = "expr.function-string";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.macro = new TextOffset(reader);
    }
}

class CompoundStringExpr {
    static partition_name = "expr.compound-string";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.macro = new TextOffset(reader);
    }
}

class StringSequenceExpr {
    static partition_name = "expr.string-sequence";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.strings = new ExprIndex(reader);
    }
}

class InitializerKind {
    static Values = {
        Unknown:              0,
        DirectInitialization: 1,
        CopyInitialization:   2,
        Count:                3
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
};

class InitializerExpr {
    static partition_name = "expr.initializer";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.initializer = new ExprIndex(reader);
        this.kind = new InitializerKind(reader);
    }
}

class RequiresExpr {
    static partition_name = "expr.requires";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.parameters = new SyntaxIndex(reader);
        this.body = new SyntaxIndex(reader);
    }
}

class FoldAssociativity {
    static Values = {
        Unspecified: 0,
        Left:        1,
        Right:       2,
        Count:       3
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class UnaryFoldExpr {
    static partition_name = "expr.unary-fold";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.expr = new ExprIndex(reader);
        this.op = read_op(DyadicOperator, reader);
        this.assoc = new FoldAssociativity(reader);
    }
}

class BinaryFoldExpr {
    static partition_name = "expr.binary-fold";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.left = new ExprIndex(reader);
        this.right = new ExprIndex(reader);
        this.op = read_op(DyadicOperator, reader);
        this.assoc = new FoldAssociativity(reader);
    }
}

class HierarchyConversionExpr {
    static partition_name = "expr.hierarchy-conversion";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.source = new ExprIndex(reader);
        this.target = new TypeIndex(reader);
        this.inheritance_path = new ExprIndex(reader);
        this.override_inheritance_path = new ExprIndex(reader);
        this.assort = read_op(DyadicOperator, reader);
    }
}

class SubobjectValueExpr {
    static partition_name = "expr.class-subobject-value";

    constructor(reader) {
        this.value = new ExprIndex(reader);
    }
}

class ProductTypeValueExpr {
    static partition_name = "expr.product-type-value";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.structure = new TypeIndex(reader);
        this.members = new ExprIndex(reader);
        this.base_class_values = new ExprIndex(reader);
    }
}

class SumTypeValueExpr {
    static partition_name = "expr.sum-type-value";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.variant = new TypeIndex(reader);
        this.active_member = reader.read_uint32();
        this.value = new SubobjectValueExpr(reader);
    }
}

class ArrayValueExpr {
    static partition_name = "expr.array-value";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.elements = new ExprIndex(reader);
        this.element_type = new TypeIndex(reader);
    }
}

class DynamicDispatchExpr {
    static partition_name = "expr.dynamic-dispatch";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.postfix = new ExprIndex(reader);
    }
}

class VirtualFunctionConversionExpr {
    static partition_name = "expr.virtual-function-conversion";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.function = new DeclIndex(reader);
    }
}

class PlaceholderExpr {
    static partition_name = "expr.placeholder";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
    }
}

class ExpansionExpr {
    static partition_name = "expr.expansion";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.operand = new ExprIndex(reader);
    }
}

class GenericExpr {
    static partition_name = "expr.generic";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
    }
}

class TupleExpr {
    static partition_name = "expr.tuple";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.seq = new HeapSequence(HeapSort.Values.Expr, reader);
    }
}

class NullptrExpr {
    static partition_name = "expr.nullptr";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
    }
}

class ThisExpr {
    static partition_name = "expr.this";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
    }
}

class TemplateReferenceExpr {
    static partition_name = "expr.template-reference";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.member = new IdentityNameIndex(reader);
        this.parent = new TypeIndex(reader);
        this.template_arguments = new ExprIndex(reader);
    }
}

class TypeTraitIntrinsicExpr {
    static partition_name = "expr.type-trait";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.arguments = new TypeIndex(reader);
        this.intrinsic = new Operator(reader);
    }
}

class DesignatedInitExpr {
    static partition_name = "expr.designated-init";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.member = new TextOffset(reader);
        this.initializer = new ExprIndex(reader);
    }
}

class PackedTemplateArgumentsExpr {
    static partition_name = "expr.packed-template-arguments";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.arguments = new ExprIndex(reader);
    }
}

class TokensExpr {
    static partition_name = "expr.tokens";

    constructor(reader) {
        this.locus = new SourceLocation(reader);
        this.type = new TypeIndex(reader);
        this.tokens = new SentenceIndex(reader);
    }
}

class AssignInitializerExpr {
    static partition_name = "expr.assign-initializer";

    constructor(reader) {
        this.assign = new SourceLocation(reader);
        this.initializer = new ExprIndex(reader);
    }
}

function symbolic_for_expr_sort(sort) {
    switch (sort) {
    case ExprIndex.Sort.Empty:
        return EmptyExpr;
    case ExprIndex.Sort.Literal:
        return LiteralExpr;
    case ExprIndex.Sort.Lambda:
        return LambdaExpr;
    case ExprIndex.Sort.Type:
        return TypeExpr;
    case ExprIndex.Sort.NamedDecl:
        return NamedDeclExpr;
    case ExprIndex.Sort.UnresolvedId:
        return UnresolvedIdExpr;
    case ExprIndex.Sort.TemplateId:
        return TemplateIdExpr;
    case ExprIndex.Sort.UnqualifiedId:
        return UnqualifiedIdExpr;
    case ExprIndex.Sort.SimpleIdentifier:
        return SimpleIdentifierExpr;
    case ExprIndex.Sort.Pointer:
        return PointerExpr;
    case ExprIndex.Sort.QualifiedName:
        return QualifiedNameExpr;
    case ExprIndex.Sort.Path:
        return PathExpr;
    case ExprIndex.Sort.Read:
        return ReadExpr;
    case ExprIndex.Sort.Monad:
        return MonadExpr;
    case ExprIndex.Sort.Dyad:
        return DyadExpr;
    case ExprIndex.Sort.Triad:
        return TriadExpr;
    case ExprIndex.Sort.String:
        return StringExpr;
    case ExprIndex.Sort.Temporary:
        return TemporaryExpr;
    case ExprIndex.Sort.Call:
        return CallExpr;
    case ExprIndex.Sort.MemberInitializer:
        return MemberInitializerExpr;
    case ExprIndex.Sort.MemberAccess:
        return MemberAccessExpr;
    case ExprIndex.Sort.InheritancePath:
        return InheritancePathExpr;
    case ExprIndex.Sort.InitializerList:
        return InitializerListExpr;
    case ExprIndex.Sort.Cast:
        return CastExpr;
    case ExprIndex.Sort.Condition:
        return ConditionExpr;
    case ExprIndex.Sort.ExpressionList:
        return ExpressionListExpr;
    case ExprIndex.Sort.SizeofType:
        return SizeofTypeIdExpr;
    case ExprIndex.Sort.Alignof:
        return AlignofExpr;
    case ExprIndex.Sort.New:
        return NewExpr;
    case ExprIndex.Sort.Delete:
        return DeleteExpr;
    case ExprIndex.Sort.Typeid:
        return TypeidExpr;
    case ExprIndex.Sort.DestructorCall:
        return DestructorCallExpr;
    case ExprIndex.Sort.SyntaxTree:
        return SyntaxTreeExpr;
    case ExprIndex.Sort.FunctionString:
        return FunctionStringExpr;
    case ExprIndex.Sort.CompoundString:
        return CompoundStringExpr;
    case ExprIndex.Sort.StringSequence:
        return StringSequenceExpr;
    case ExprIndex.Sort.Initializer:
        return InitializerExpr;
    case ExprIndex.Sort.Requires:
        return RequiresExpr;
    case ExprIndex.Sort.UnaryFoldExpression:
        return UnaryFoldExpr;
    case ExprIndex.Sort.BinaryFoldExpression:
        return BinaryFoldExpr;
    case ExprIndex.Sort.HierarchyConversion:
        return HierarchyConversionExpr;
    case ExprIndex.Sort.ProductTypeValue:
        return ProductTypeValueExpr;
    case ExprIndex.Sort.SumTypeValue:
        return SumTypeValueExpr;
    case ExprIndex.Sort.SubobjectValue:
        return SubobjectValueExpr;
    case ExprIndex.Sort.ArrayValue:
        return ArrayValueExpr;
    case ExprIndex.Sort.DynamicDispatch:
        return DynamicDispatchExpr;
    case ExprIndex.Sort.VirtualFunctionConversion:
        return VirtualFunctionConversionExpr;
    case ExprIndex.Sort.Placeholder:
        return PlaceholderExpr;
    case ExprIndex.Sort.Expansion:
        return ExpansionExpr;
    case ExprIndex.Sort.Generic:
        return GenericExpr;
    case ExprIndex.Sort.Tuple:
        return TupleExpr;
    case ExprIndex.Sort.Nullptr:
        return NullptrExpr;
    case ExprIndex.Sort.This:
        return ThisExpr;
    case ExprIndex.Sort.TemplateReference:
        return TemplateReferenceExpr;
    case ExprIndex.Sort.TypeTraitIntrinsic:
        return TypeTraitIntrinsicExpr;
    case ExprIndex.Sort.DesignatedInitializer:
        return DesignatedInitExpr;
    case ExprIndex.Sort.PackedTemplateArguments:
        return PackedTemplateArgumentsExpr;
    case ExprIndex.Sort.Tokens:
        return TokensExpr;
    case ExprIndex.Sort.AssignInitializer:
        return AssignInitializerExpr;
    case ExprIndex.Sort.PushState: // Deprecated as of IFC version 0.32.
    case ExprIndex.Sort.VendorExtension:
    default:
        console.error(`Bad sort: ${sort}`);
        return null;
    }
}