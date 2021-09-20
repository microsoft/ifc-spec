// Based on IFC specification 0.33.

function sort_to_string(T, sort) {
    return Object.entries(T.Sort).find(e => e[1] == sort)[0];
}

function value_to_string(T, value) {
    return Object.entries(T.Values).find(e => e[1] == value)[0];
}

function bitset_to_string(T, bitset) {
    if (bitset == 0) {
        const null_entry = Object.entries(T.Values).find(e => e[1] == bitset)[0];
        return null_entry;
    }
    const keys = Object.entries(T.Values).filter(e => e[1] != 0 && implies(bitset, e[1])).map(e => e[0]);
    return keys.join(" | ");
}

function null_index(index) {
    return index.sort == 0 && index.index == 0;
}

class DeclIndex {
    static Sort = {
        VendorExtension:         0,  // A vendor-specific extension.
        Enumerator:              1,  // An enumerator declaration.
        Variable:                2,  // A variable declaration; a static-data member is also considered a variable.
        Parameter:               3,  // A parameter declaration - for a function or a template
        Field:                   4,  // A non-static data member declaration.
        Bitfield:                5,  // A bit-field declaration.
        Scope:                   6,  // A type declaration.
        Enumeration:             7,  // An enumeration declaration.
        Alias:                   8,  // An alias declaration for a (general) type.
        Temploid:                9, // A member of a parameterized scope -- does not have template parameters of its own.
        Template:                10, // A template declaration: class, function, constructor, type alias, variable.
        PartialSpecialization:   11, // A partial specialization of a template (class-type or function).
        ExplicitSpecialization:  12, // An explicit specialization of a template (class-type or function).
        ExplicitInstantiation:   13, // An explicit instantiation request of a template specialization.
        Concept:                 14, // A concept
        Function:                15, // A function declaration; both free-standing and static member functions.
        Method:                  16, // A non-static member function declaration.
        Constructor:             17, // A constructor declaration.
        InheritedConstructor:    18, // A constructor inherited from a base class.
        Destructor:              19, // A destructor declaration.
        Reference:               20, // A reference to a declaration from a given module.
        UsingDeclaration:        21, // A using declaration
        UsingDirective:          22, // A using-directive
        Friend:                  23, // A friend declaration
        Expansion:               24, // A pack-expansion of a declaration
        DeductionGuide:          25, // C(T) -> C<U>
        Barren:                  26, // Declaration introducing no names, e.g. static_assert, asm-declaration, empty-declaration
        Tuple:                   27, // A sequence of entities
        SyntaxTree:              28, // A syntax tree for an unelaborated declaration.
        Intrinsic:               29, // An intrinsic function declaration.
        Property:                30, // VC's extension of property declaration.
        OutputSegment:           31, // Code segment. These are 'declared' via pragmas.
        Count:                   32
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(DeclIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }
}

class TypeIndex {
    static Sort = {
        VendorExtension: 0,  // Vendor-specific type constructor extensions.
        Fundamental:     1,  // Fundamental type, in standard C++ sense
        Designated:      2,  // A type designated by a declared name.  Really a proxy type designator.
        Tor:             3,  // Type of a constructor or a destructor.
        Syntactic:       4,  // Source-level expression designating unelaborated type.
        Expansion:       5,  // A pack expansion of a type.
        Pointer:         6,  // Pointer type, whether the pointee is data type or function type
        PointerToMember: 7,  // Type of a non-static data member that includes the enclosing class type.  Useful for pointer-to-data-member.
        LvalueReference: 8,  // Classic reference type, e.g. A&
        RvalueReference: 9,  // Rvalue reference type, e.g. A&&
        Function:        10, // Function type, excluding non-static member function type
        Method:          11, // Non-static member function type.
        Array:           12, // Builtin array type
        Typename:        13, // An unresolved qualified type expression
        Qualified:       14, // Qualified types.
        Base:            15, // Use of a type as a base-type in a class inheritance
        Decltype:        16, // A 'decltype' type.
        Placeholder:     17, // A placeholder type - e.g. uses of 'auto' in function signatures.
        Tuple:           18, // A sequence of types.  Generalized type for uniform description.
        Forall:          19, // Template type.  E.g. type of `template<typename T> constexpr T zro = T{};`
        Unaligned:       20, // A type with __unaligned.  This is a curiosity with no clearly defined semantics.
        SyntaxTree:      21, // A syntax tree for an unelaborated type.
        Count:           22
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(TypeIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }
}

class ExprIndex {
    static Sort = {
        VendorExtension:           0,  // Vendor-specific extension for expressions.
        Empty:                     1,  // An empty expression.
        Literal:                   2,  // Literal constants.
        Lambda:                    3,  // Lambda expression
        Type:                      4,  // A type expression.  Useful in template argument contexts, and other more general context.
        NamedDecl:                 5,  // Use of a name designating a declaration.
        UnresolvedId:              6,  // An unresolved or dependent name as expression.
        TemplateId:                7,  // A template-id expression.
        UnqualifiedId:             8,  // An unqualified-id + some other stuff like 'template' and/or 'typename'
        SimpleIdentifier:          9,  // Just an identifier: nothing else
        Pointer:                   10, // A '*' when it appears as part of a qualified-name
        QualifiedName:             11, // A raw qualified-name: i.e. one that has not been fully resolved
        Path:                      12, // A path expression, e.g. a fully bound qualified-id
        Read:                      13, // Lvalue-to-rvalue conversions.
        Monad:                     14, // 1-part expression.
        Dyad:                      15, // 2-part expressions.
        Triad:                     16, // 3-part expressions.
        String:                    17, // A string literal
        Temporary:                 18, // A temporary expression (i.e. 'L_ALLOTEMP')
        Call:                      19, // An invocation of some form of function object
        MemberInitializer:         20, // A base or member initializer
        MemberAccess:              21, // The member being accessed + offset
        InheritancePath:           22, // The representation of the 'path' to a base-class member
        InitializerList:           23, // An initializer-list
        Cast:                      24, // A cast: either old-style '(T)e'; new-style 'static_cast<T>(e)'; or functional 'T(e)'
        Condition:                 25, // A statement condition: 'if (e)' or 'if (T v = e)'
        ExpressionList:            26, // Either '(e1, e2, e3)' or '{ e1, e2, e2 }'
        SizeofType:                27, // 'sizeof(type-id)'
        Alignof:                   28, // 'alignof(type-id)'
        New:                       29, // A 'new' expression
        Delete:                    30, // A 'delete' expression
        Typeid:                    31, // A 'typeid' expression
        DestructorCall:            32, // A destructor call: i.e. the right sub-expression of 'expr->~T()'
        SyntaxTree:                33, // A syntax tree for an unelaborated expression.
        FunctionString:            34, // A string literal expanded from a built-in macro like __FUNCTION__.
        CompoundString:            35, // A string literal of the form __LPREFIX(string-literal).
        StringSequence:            36, // A sequence of string literals.
        Initializer:               37, // An initializer for a symbol
        Requires:                  38, // A requires expression
        UnaryFoldExpression:       39, // A unary fold expression of the form (pack @ ...)
        BinaryFoldExpression:      40, // A binary fold expression of the form (expr @ ... @ pack)
        HierarchyConversion:       41, // A class hierarchy conversion. Distinct from ExprSort::Cast, which represents
                                       // a syntactic expression of intent, whereas this represents the semantics of a
                                       // (possibly implicit) conversion
        ProductTypeValue:          42, // The representation of an object value expression tree
                                       // (really an associative map of declarations to values)
        SumTypeValue:              43, // The representation of a union object value expression tree.
                                       // Unions have a single active SubobjectValue
        SubobjectValue:            44, // A key-value pair under a ProductTypeValue
        ArrayValue:                45, // A constant-initialized array value object
        DynamicDispatch:           46, // A dynamic dispatch expression, i.e. call to virtual function
        VirtualFunctionConversion: 47, // A conversion of a virtual function reference to its underlying target: C::f // 'f' is a virtual function.
        Placeholder:               48, // A placeholder expression.
        Expansion:                 49, // A pack-expansion expression
        Generic:                   50, // A generic-selection -- C11 extension.
        Tuple:                     51, // General tuple expressions.
        Nullptr:                   52, // 'nullptr'
        This:                      53, // 'this'
        TemplateReference:         54, // A reference to a member of a template
        PushState:                 55, // A EH push-state expression (constructor call + matching destructor call)
        TypeTraitIntrinsic:        56, // A use of a type trait intrinsic
        DesignatedInitializer:     57, // A single designated initializer clause: '.a = e'
        PackedTemplateArguments:   58, // The template argument set for a template parameter pack
        Tokens:                    59, // A token stream (i.e. a complex default template argument)
        AssignInitializer:         60, // '= e'.  FIXME:  This is NOT an expression.
        Count:                     61
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(ExprIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }
}

class SyntaxIndex {
    static Sort = {
        VendorExtension:              0,   // Vendor-specific extension for syntax. What fresh hell is this?
        SimpleTypeSpecifier:          1,   // A simple type-specifier (i.e. no declarator)
        DecltypeSpecifier:            2,   // A decltype-specifier - 'decltype(expression)'
        PlaceholderTypeSpecifier:     3,   // A placeholder-type-specifier
        TypeSpecifierSeq:             4,   // A type-specifier-seq - part of a type-id
        DeclSpecifierSeq:             5,   // A decl-specifier-seq - part of a declarator
        VirtualSpecifierSeq:          6,   // A virtual-specifier-seq (includes pure-specifier)
        NoexceptSpecification:        7,   // A noexcept-specification
        ExplicitSpecifier:            8,   // An explicit-specifier
        EnumSpecifier:                9,   // An enum-specifier
        EnumeratorDefinition:         10,  // An enumerator-definition
        ClassSpecifier:               11,  // A class-specifier
        MemberSpecification:          12,  // A member-specification
        MemberDeclaration:            13,  // A member-declaration
        MemberDeclarator:             14,  // A member-declarator
        AccessSpecifier:              15,  // An access-specifier
        BaseSpecifierList:            16,  // A base-specifier-list
        BaseSpecifier:                17,  // A base-specifier
        TypeId:                       18,  // A complete type used as part of an expression (can contain an abstract declarator)
        TrailingReturnType:           19,  // a trailing return type: '-> T'
        Declarator:                   20,  // A declarator: i.e. something that has not (yet) been resolved down to a symbol
        PointerDeclarator:            21,  // A sub-declarator for a pointer: '*D'
        ArrayDeclarator:              22,  // A sub-declarator for an array: 'D[e]'
        FunctionDeclarator:           23,  // A sub-declarator for a function: 'D(T1, T2, T3) <stuff>'
        ArrayOrFunctionDeclarator:    24,  // Either an array or a function sub-declarator
        ParameterDeclarator:          25,  // A function parameter declaration
        InitDeclarator:               26,  // A declaration with an initializer
        NewDeclarator:                27,  // A new declarator (used in new expressions)
        SimpleDeclaration:            28,  // A simple-declaration
        ExceptionDeclaration:         29,  // An exception-declaration
        ConditionDeclaration:         30,  // A declaration within if or switch statement: if (decl; cond)
        StaticAssertDeclaration:      31,  // A static_assert-declaration
        AliasDeclaration:             32,  // An alias-declaration
        ConceptDefinition:            33,  // A concept-definition
        CompoundStatement:            34,  // A compound statement
        ReturnStatement:              35,  // A return statement
        IfStatement:                  36,  // An if statement
        WhileStatement:               37,  // A while statement
        DoWhileStatement:             38,  // A do-while statement
        ForStatement:                 39,  // A for statement
        InitStatement:                40,  // An init-statement
        RangeBasedForStatement:       41,  // A range-based for statement
        ForRangeDeclaration:          42,  // A for-range-declaration
        LabeledStatement:             43,  // A labeled statement
        BreakStatement:               44,  // A break statement
        ContinueStatement:            45,  // A continue statement
        SwitchStatement:              46,  // A switch statement
        GotoStatement:                47,  // A goto statement
        DeclarationStatement:         48,  // A declaration statement
        ExpressionStatement:          49,  // An expression statement
        TryBlock:                     50,  // A try block
        Handler:                      51,  // A catch handler
        HandlerSeq:                   52,  // A sequence of catch handlers
        FunctionTryBlock:             53,  // A function try block
        TypeIdListElement:            54,  // a type-id-list element
        DynamicExceptionSpec:         55,  // A dynamic exception specification
        StatementSeq:                 56,  // A sequence of statements
        FunctionBody:                 57,  // The body of a function
        Expression:                   58,  // A wrapper around an ExprSort node
        FunctionDefinition:           59,  // A function-definition
        MemberFunctionDeclaration:    60,  // A member function declaration
        TemplateDeclaration:          61,  // A template head definition
        RequiresClause:               62,  // A requires clause
        SimpleRequirement:            63,  // A simple requirement
        TypeRequirement:              64,  // A type requirement
        CompoundRequirement:          65,  // A compound requirement
        NestedRequirement:            66,  // A nested requirement
        RequirementBody:              67,  // A requirement body
        TypeTemplateParameter:        68,  // A type template-parameter
        TemplateTemplateParameter:    69,  // A template template-parameter
        TypeTemplateArgument:         70,  // A type template-argument
        NonTypeTemplateArgument:      71,  // A non-type template-argument
        TemplateParameterList:        72,  // A template parameter list
        TemplateArgumentList:         73,  // A template argument list
        TemplateId:                   74,  // A template-id
        MemInitializer:               75,  // A mem-initializer
        CtorInitializer:              76,  // A ctor-initializer
        LambdaIntroducer:             77,  // A lambda-introducer
        LambdaDeclarator:             78,  // A lambda-declarator
        CaptureDefault:               79,  // A capture-default
        SimpleCapture:                80,  // A simple-capture
        InitCapture:                  81,  // An init-capture
        ThisCapture:                  82,  // A this-capture
        AttributedStatement:          83,  // An attributed statement
        AttributedDeclaration:        84,  // An attributed declaration
        AttributeSpecifierSeq:        85,  // An attribute-specifier-seq
        AttributeSpecifier:           86,  // An attribute-specifier
        AttributeUsingPrefix:         87,  // An attribute-using-prefix
        Attribute:                    88,  // An attribute
        AttributeArgumentClause:      89,  // An attribute-argument-clause
        Alignas:                      90,  // An alignas( expression )
        UsingDeclaration:             91,  // A using-declaration
        UsingDeclarator:              92,  // A using-declarator
        UsingDirective:               93,  // A using-directive
        ArrayIndex:                   94,  // An array index
        SEHTry:                       95,  // An SEH try-block
        SEHExcept:                    96,  // An SEH except-block
        SEHFinally:                   97,  // An SEH finally-block
        SEHLeave:                     98,  // An SEH leave
        TypeTraitIntrinsic:           99,  // A type trait intrinsic
        Tuple:                        100, // A sequence of zero or more syntactic elements
        AsmStatement:                 101, // An __asm statement,
        NamespaceAliasDefinition:     102, // A namespace-alias-definition
        Super:                        103, // The '__super' keyword in a qualified id
        UnaryFoldExpression:          104, // A unary fold expression
        BinaryFoldExpression:         105, // A binary fold expression
        EmptyStatement:               106, // An empty statement: ';'
        StructuredBindingDeclaration: 107, // A structured binding
        StructuredBindingIdentifier:  108, // A structured binding identifier
        UsingEnumDeclaration:         109, // A using-enum-declaration
        Count:                        110,
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(SyntaxIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }
}

class ChartIndex {
    constructor(reader) {
        this.offset = reader.read_uint32();
    }
}

class HeapSort {
    static Values = {
        Decl:   { heap: "heap.decl",  T: DeclIndex },
        Type:   { heap: "heap.type",  T: TypeIndex },
        Stmt:   { heap: "heap.stmt",  T: undefined },
        Expr:   { heap: "heap.expr",  T: ExprIndex },
        Syntax: { heap: "heap.syn",   T: SyntaxIndex },
        Word:   { heap: "heap.word",  T: undefined },
        Chart:  { heap: "heap.chart", T: ChartIndex },
        Spec:   { heap: "heap.spec",  T: undefined },
        Form:   { heap: "heap.pp",    T: undefined },
        Attr:   { heap: "heap.attr",  T: undefined }
    };
}

class LitIndex {
    static Sort = {
        Immediate:     0, // Immediate integer constants, directly representable by an index value.
        Integer:       1, // Unsigned 64-bit integer constant that are not immediates.
        FloatingPoint: 2, // Floating point constant.
        Count:         3
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(LitIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }
}

class StringIndex {
    static Sort = {
        Ordinary: 0, // Ordinary string literal -- no prefix.
        UTF8:     1, // UTF-8 narrow string literal -- only u8 prefix.
        UTF16:    2, // A char16_t string literal -- only u prefix.
        UTF32:    3, // A char32_t string literal -- only U prefix.
        Wide:     4, // A wide string literal -- only L prefix.
        Count:    5,
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(StringIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }
}

class TextOffset {
    constructor(reader) {
        this.offset = reader.read_uint32();
    }
}

class SentenceIndex {
    constructor(reader) {
        this.index = reader.read_uint32();
    }
}

class NameIndex {
    static Sort = {
        Identifier:     0, // Normal alphabetic identifiers.
        Operator:       1, // Operator names.
        Conversion:     2, // Conversion function name.
        Literal:        3, // Literal operator name.
        Template:       4, // A nested-name assumed to designate a template.
        Specialization: 5, // A template-id name.
        SourceFile:     6, // A source file name
        Guide:          7, // A deduction guide name
        Count:          8
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(NameIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }
}

class SourceLocation {
    constructor(reader) {
        this.line = reader.read_uint32();
        this.column = reader.read_uint32();
    }
}

class OperatorFunctionId {
    static partition_name = "name.operator";

    constructor(reader) {
        this.name = new TextOffset(reader);
        this.symbol = reader.read_uint16(); // Operator
    }
}

class SourceFileName {
    static partition_name = "name.source-file";

    constructor(reader) {
        this.name = reader.read_uint32();
        this.include_guard = reader.read_uint32();
    }
}

class IdentityNameIndex {
    constructor(reader) {
        this.name = new NameIndex(reader);
        this.locus = new SourceLocation(reader);
    }
}

class IdentityTextOffset {
    constructor(reader) {
        this.name = new TextOffset(reader);
        this.locus = new SourceLocation(reader);
    }
}

class FileAndLine {
    static partition_name = "src.line";

    constructor(reader) {
        this.file = new NameIndex(reader);
        this.line = reader.read_uint32();
    }
}

class ReachableProperties {
    static Values = {
        Nothing:             0,        // nothing beyond name, type, scope.
        Initializer:         1 << 0,   // IPR-initializer exported.
        DefaultArguments:    1 << 1,   // function or template default arguments exported
        Attributes:          1 << 2,   // standard attributes exported.
        All:                 0x01 | 0x02 | 0x04 // Everything.
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class Access {
    static Values = {
        None:      0, // No access specified.
        Private:   1, // "private"
        Protected: 2, // "protected"
        Public:    3, // "public"
        Count:     4
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class BasicSpecifiers {
    static Values = {
        Cxx:                     0,            // C++ language linkage
        C:                       1 << 0,       // C language linkage
        Internal:                1 << 1,       // Exported entities should have external linkage, not sure we need this.
        Vague:                   1 << 2,       // Vague linkage, e.g. COMDAT, still external
        External:                1 << 3,       // External linkage.
        Deprecated:              1 << 4,       // [[deprecated("foo")]]
        InitializedInClass:      1 << 5,       // Is this entity defined in a class or does it have an in-class initializer?
        NonExported:             1 << 6,       // This is an entity that was not explicitly exported from the module
        IsMemberOfGlobalModule:  1 << 7        // This entity is a member of the global module
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class ObjectTraits {
    static Values = {
        None:                0,
        Constexpr:           1 << 0,       // Constexpr object.
        Mutable:             1 << 1,       // Mutable object.
        ThreadLocal:         1 << 2,       // thread_local storage: AKA '__declspec(thread)'
        Inline:              1 << 3,       // An 'inline' object (this is distinct from '__declspec(selectany)')
        InitializerExported: 1 << 4,       // This object has its initializer exported
        NoUniqueAddress:     1 << 5,       // The '[[no_unique_address]]' attribute was applied to this data member
        Vendor:              1 << 7        // The object has extended vendor specific traits
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class FunctionTraits {
    static Values = {
        None:            0,
        Inline:          1 << 0,           // inline function
        Constexpr:       1 << 1,           // constexpr function
        Explicit:        1 << 2,           // For conversion functions.
        Virtual:         1 << 3,           // virtual function
        NoReturn:        1 << 4,           // The 'noreturn' attribute
        PureVirtual:     1 << 5,           // A pure virtual function ('= 0')
        HiddenFriend:    1 << 6,           // A hidden friend function
        Defaulted:       1 << 7,           // A '= default' function
        Deleted:         1 << 8,           // A '= delete' function
        Constrained:     1 << 9,           // For functions which have constraint expressions.
        Immediate:       1 << 10,          // Immediate function
        Final:           1 << 11,          // A function marked as 'final'
        Override:        1 << 12,          // A function marked as 'override'
        Vendor:          1 << 15           // The function has extended vendor specific traits
    };

    constructor(reader) {
        this.value = reader.read_uint16();
    }
}

class CallingConvention {
    static Values = {
        Cdecl:  0,  // "__cdecl"
        Fast:   1,  // "__fastcall"
        Std:    2,  // "__stdcall"
        This:   3,  // "__thiscall"
        Clr:    4,  // "__clrcall"
        Vector: 5,  // "__vectorcall"
        Eabi:   6,  // "__eabi"
        Count:  7
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class FunctionTypeTraits {
    static Values = {
        None:        0,     // Just a regular function parameter type list
        Const:       1 << 0,     // 'void (int) const'
        Volatile:    1 << 1,     // 'void (int) volatile'
        Lvalue:      1 << 2,     // 'void (int) &'
        Rvalue:      1 << 3,     // 'void (int) &&'
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class SegmentTraits {
    constructor(reader) {
        this.value = reader.read_uint32();
    }
}

class SegmentType {
    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class Sequence {
    constructor(T, reader) {
        this.T = T;
        this.start = reader.read_uint32();
        this.cardinality = reader.read_uint32();
    }
}

class HeapSequence {
    constructor(Heap, reader) {
        this.Heap = Heap;
        this.start = reader.read_uint32();
        this.cardinality = reader.read_uint32();
    }
}

class Scope {
    static partition_name = "scope.desc";

    constructor(reader) {
        this.seq = new Sequence(Declaration, reader);
    }
}

class Declaration {
    static partition_name = "scope.member";

    constructor(reader) {
        this.decl = new DeclIndex(reader);
    }
}

class NoexceptSort {
    static Values = {
        None:                   0,  // No specifier
        False:                  1,  // "noexcept(false)" specifier.
        True:                   2,  // "noexcept(true)" specifier.
        Expression:             3,  // "noexcept(expression)" specifier
        InferredSpecialMember:  4,  // an inferred noexcept specifier for a special member function that is dependent on
                                    // whether associated functions the member will invoke from bases and members are noexcept
        Unenforced:             5,  // noexcept for the purposes of the type system, but not enforced by termination at runtime
        Count:                  6
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class NoexceptSpecification {
    constructor(reader) {
        this.words = new SentenceIndex(reader);
        this.sort = new NoexceptSort(reader);
        this.unused_1 = new StructPadding(reader);
        this.unused_2 = new StructPadding(reader);
        this.unused_3 = new StructPadding(reader);
    }
}

// The set of fundamental type basis.
class TypeBasis {
    static Values = {
        Void:                       0, // "void"
        Bool:                       1, // "bool"
        Char:                       2, // "char"
        Wchar_t:                    3, // "wchar_t"
        Int:                        4, // "int"
        Float:                      5, // "float"
        Double:                     6, // "double"
        Nullptr:                    7, // "decltype(nullptr)"
        Ellipsis:                   8, // "..."        -- generalized type
        SegmentType:                9, // "segment"
        Class:                     10, // "class"
        Struct:                    11, // "struct"
        Union:                     12, // "union"
        Enum:                      13, // "enum"
        Typename:                  14, // "typename"
        Namespace:                 15, // "namespace"
        Interface:                 16, // "__interface"
        Function:                  17, // concept of function type.
        Empty:                     18, // an empty pack expansion
        VariableTemplate:          19, // a variable template
        Concept:                   20, // a concept
        Auto:                      21, // "auto"
        DecltypeAuto:              22, // "decltype(auto)"
        UnresolvedFunction:        23, // placeholder type for unresolved function
        Count:                     24 // cardinality of fundamental type basis.
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class TypePrecision {
    static Values = {
        Default:                    0, // Default bit width, whatever that is.
        Short:                      1, // The short version.
        Long:                       2, // The long version.
        Bit8:                       3, // The  8-bit version.
        Bit16:                      4, // The 16-bit version.
        Bit32:                      5, // The 32-bit version.
        Bit64:                      6, // The 64-bit (long long) version.
        Bit128:                     7, // The 128-bit version.
        Count:                      8
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

// Signed-ness of a fundamental type.
class TypeSign {
    static Values = {
        Plain:                      0, // No sign specified, default to standard interpretation.
        Signed:                     1, // Specified sign, or implied
        Unsigned:                   2, // Specified sign.
        Count:                      3
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class ExpansionMode {
    static Values = {
        Full:    0,
        Partial: 1
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class Qualifier {
    static Values = {
        None:        0,                    // No qualifier
        Const:       1 << 0,               // "const" qualifier
        Volatile:    1 << 1,               // "volatile" qualifier
        Restrict:    1 << 2                // "restrict" qualifier, C extension
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

class BaseClassTraits {
    static Values = {
        None:        0,      // Nothing
        Shared:      1 << 0, // Base class inherited virtually
        Expanded:    1 << 1  // Base class pack expanded
    };

    constructor(reader) {
        this.value = reader.read_uint8();
    }
}

// A meta-type for absorbing structure padding in the IFC data structures.
class StructPadding {
    constructor(reader) {
        this.value = reader.read_uint8();
    }
}