class NiladicOperator {
    static Values = {
        Unknown:            0, // also serves as a placeholder for undefined
        Phantom:            1, // no expression -- not the same as Nil, which has type void
        Constant:           2, // scalar or string literal constants, constants of class types
        Nil:                3, // void() -- regularize void! (or not; but be ready)

        Msvc:               0x0400,
        MsvcConstantObject: 0x0401,                 // MSVC internal representation of a class type object that is a constant
        MsvcLambda:         0x0402,

        Count:              0x0403
    };

    constructor(value) {
        this.value = value;
    }
}

class MonadicOperator {
    static Values = {
        Unknown:        0,
        Plus:           1,  // +x
        Negate:         2,  // -x
        Deref:          3,  // *p
        Address:        4,  // &x
        Complement:     5,  // ~x
        Not:            6,  // !x
        PreIncrement:   7,  // ++x
        PreDecrement:   8,  // --x
        PostIncrement:  9,  // x++
        PostDecrement:  10, // x--
        Truncate:       11, // (int)3.14            -- abstract machine, not an operator at source level
        Ceil:           12, // ceil(3.14)           -- abstract machine, not an operator at source level
        Floor:          13, // floor(3.14)          -- abstract machine, not an operator at source level
        Paren:          14, // (x)                  -- abstract machine, syntactic at source level
        Brace:          15, // { x }                -- abstract machine, syntactic at source level
        Alignas:        16, // alignas(n)
        Alignof:        17, // alignof(x)
        Sizeof:         18, // sizeof x
        Cardinality:    19, // sizeof... (x)
        Typeid:         20, // typeid(x)
        Noexcept:       21, // noexcept(x)
        Requires:       22, // requires x
        CoReturn:       23, // co_return x
        Await:          24, // co_await x
        Yield:          25, // co_yield x
        Throw:          26, // throw x
        New:            27, // new T
        Delete:         28, // delete p
        DeleteArray:    29, // delete[] p
        Expand:         30, // x...                 -- pack expansion, not an operator at source level
        Read:           31, // lvalue-to-rvalue conversion -- abstract machine
        Materialize:    32, // temporary materialization -- abstract machine
        PseudoDtorCall: 33, // p->~T(), with T a scalar type

        Msvc:                               0x0400,
        MsvcAssume:                         0x0401, // __assume(x)
        MsvcAlignof:                        0x0402, // __builtin_alignof(x)
        MsvcUuidof:                         0x0403, // __uuidof(x)
        MsvcIsClass:                        0x0404, // __is_class(T)
        MsvcIsUnion:                        0x0405, // __is_union(T)
        MsvcIsEnum:                         0x0406, // __is_enum(T)
        MsvcIsPolymorphic:                  0x0407, // __is_polymorphic(T)
        MsvcIsEmpty:                        0x0408, // __is_empty(T)
        MsvcIsTriaviallyCopyConstructible:  0x0409, // __is_trivially_copy_constructible(T)
        MsvcIsTriviallyCopyAssignable:      0x040A, // __is_trivially_copy_assignable(T)
        MsvcIsTriviallyDestructible:        0x040B, // __is_trivially_destructible(T)
        MsvcHasVirtualDestructor:           0x040C, // __has_virtual_destructor(T)
        MsvcIsNothrowCopyConstructible:     0x040D, // __is_nothrow_copy_constructible(T)
        MsvcIsNothrowCopyAssignable:        0x040E, // __is_nothrow_copy_assignable(T)
        MsvcIsPod:                          0x040F, // __is_pod(T)
        MsvcIsAbstract:                     0x0410, // __is_abstract(T)
        MsvcIsTrivial:                      0x0411, // __is_trivial(T)
        MsvcIsTriviallyCopyable:            0x0412, // __is_trivially_copyable(T)
        MsvcIsStandardLayout:               0x0413, // __is_standard_layout(T)
        MsvcIsLiteralType:                  0x0414, // __is_literal_type(T)
        MsvcIsTriviallyMoveConstructible:   0x0415, // __is_trivially_move_constructible(T)
        MsvcHasTrivialMoveAssign:           0x0416, // __has_trivial_move_assign(T)
        MsvcIsTriviallyMoveAssignable:      0x0417, // __is_trivially_move_assignable(T)
        MsvcIsNothrowMoveAssignable:        0x0418, // __is_nothrow_move_assign(T)
        MsvcUnderlyingType:                 0x0419, // __underlying_type(T)
        MsvcIsDestructible:                 0x041A, // __is_destructible(T)
        MsvcIsNothrowDestructible:          0x041B, // __is_nothrow_destructible(T)
        MsvcHasUniqueObjectRepresentations: 0x041C, // __has_unique_object_representations(T)
        MsvcIsAggregate:                    0x041D, // __is_aggregate(T)
        MsvcBuiltinAddressOf:               0x041E, // __builtin_addressof(x)
        MsvcIsRefClass:                     0x041F, // __is_ref_class(T)
        MsvcIsValueClass:                   0x0420, // __is_value_class(T)
        MsvcIsSimpleValueClass:             0x0421, // __is_simple_value_class(T)
        MsvcIsInterfaceClass:               0x0422, // __is_interface_class(T)
        MsvcIsDelegate:                     0x0423, // __is_delegate(f)
        MsvcIsFinal:                        0x0424, // __is_final(T)
        MsvcIsSealed:                       0x0425, // __is_sealed(T)
        MsvcHasFinalizer:                   0x0426, // __has_finalizer(T)
        MsvcHasCopy:                        0x0427, // __has_copy(T)
        MsvcHasAssign:                      0x0428, // __has_assign(T)
        MsvcHasUserDestructor:              0x0429, // __has_user_destructor(T)

        MsvcConfusion:                      0x0FE0, // FIXME: Anything below is confusion to be removed
        MsvcConfusedExpand:                 0x0FE1, // The parser is confused about pack expansion
        MsvcConfusedDependentSizeof:        0x0FE2, // The parser is confused about dependent 'sizeof <expr>'
        MsvcConfusedPopState:               0x0FE3, // An EH state represented directly in a unary expression for invoking destructors after invoking a ctor.
        MsvcConfusedDtorAction:             0x0FE4, // An EH state represented directly in a unary expression for invoking destructors directly.

        Count:                              0x0FE5
    };

    constructor(value) {
        this.value = value;
    }
}

class DyadicOperator {
    static Values = {
        Unknown:            0,
        Plus:               1, // x + y
        Minus:              2, // x - y
        Mult:               3, // x * y
        Slash:              4, // x / y
        Modulo:             5, // x % y
        Remainder:          6, // x rem y              -- abstract machine, not an operator at source level
        Bitand:             7, // x & y
        Bitor:              8, // x | y
        Bitxor:             9, // x ^ y
        Lshift:             10, // x << y
        Rshift:             11, // x >> y
        Equal:              12, // x == y
        NotEqual:           13, // x != y
        Less:               14, // x < y
        LessEqual:          15, // x <= y
        Greater:            16, // x > y
        GreaterEqual:       17, // x >= y
        Compare:            18, // x <=> y
        LogicAnd:           19, // x && y
        LogicOr:            20, // x || y
        Assign:             21, // x = y
        PlusAssign:         22, // x += y
        MinusAssign:        23, // x -= y
        MultAssign:         24, // x *= y
        SlashAssign:        25, // x /= y
        ModuloAssign:       26, // X %= y
        BitandAssign:       27, // x &= y
        BitorAssign:        28, // x |= y
        BitxorAssign:       29, // x ^= y
        LshiftAssign:       30, // x <<= y
        RshiftAssign:       31, // x >>= y
        Comma:              32, // x, y
        Dot:                33, // p.x
        Arrow:              34, // p->x
        DotStar:            35, // p.*x
        ArrowStar:          36, // p->*x
        Curry:              37, //                      -- abstract machine, bind the first parameter of a function taking more arguments
        Apply:              38, // x(y, z)              -- abstract machine, apply a callable to an argument list (conceptually a tuple)
        Index:              39, // x[y]                 -- indexing, prepared for possible generalization to multi-indices
        DefaultAt:          40, // new(p) T
        New:                41, // new T(x)
        NewArray:           42, // new T[n]
        Destruct:           43, // x.~T()
        DestructAt:         44, // p->~T()
        Cleanup:            45, //                      -- abstract machine, evaluate first operand then run second parameter as cleanup
        Qualification:      46, // cv-qualification     -- abstract machine
        Promote:            47, // integral or floating point promotion     -- abstract machine
        Demote:             48, // integral or floating point conversion    -- abstract machine
        Coerce:             49, //                      -- abstract machine implicit conversions that are not promotions or demotions
        Rewrite:            50, //                      -- abstract machine, rewrite an expression into another
        Bless:              51, // bless<T>(p)          -- abstract machine: valid T-object proclamation at p, no ctor run
        Cast:               52, // (T)x
        ExplicitConversion: 53, // T(x)
        ReinterpretCast:    54, // reinterpret_cast<T>(x)
        StaticCast:         55, // static_cast<T>(x)
        ConstCast:          56, // const_cast<T>(x)
        DynamicCast:        57, // dynamic_cast<T>(x)
        Narrow:             58, //                      -- abstract machine, checked base to derived class conversion
        Widen:              59, //                      -- abstract machine, derived to base class conversion
        Pretend:            60, //                      -- abstract machine, generalization of bitcast and reinterpret cast
        Closure:            61, //                      -- abstract machine, (env, func) pair formation; useful for lambdas
        ZeroInitialize:     62, //                      -- abstract machine, zero-initialize an object or subject
        ClearStorage:       63, //                      -- abstract machine, clear a storage span64

        Msvc:                                          0x0400,
        MsvcTryCast:                                   0x0401, // WinTR try cast
        MsvcCurry:                                     0x0402, // MSVC bound member function extension
        MsvcVirtualCurry:                              0x0403, // same as MsvcCurry, except the binding requires dynamic dispatch
        MsvcAlign:                                     0x0404, //                      -- alignment adjustment
        MsvcBitSpan:                                   0x0405, //                      -- abstract machine, span of bits
        MsvcBitfieldAccess:                            0x0406, //                      -- abstract machine access to bitfield
        MsvcObscureBitfieldAccess:                     0x0407, //                      -- same as above with declaration annotation
        MsvcInitialize:                                0x0408, //
        MsvcBuiltinOffsetOf:                           0x0409, // __builtin_offsetof(T, x)
        MsvcIsBaseOf:                                  0x040A, // __is_base_of(U, V)
        MsvcIsConvertibleTo:                           0x040B, // __is_convertible_to(U, V)
        MsvcIsTriviallyAssignable:                     0x040C, // __is_trivially_assignable(U, V)
        MsvcIsNothrowAssignable:                       0x040D, // __is_nothrow_assignable(U, V)
        MsvcIsAssignable:                              0x040E, // __is_assignable(U, V)
        MsvcIsAssignableNocheck:                       0x040F, // __is_assignable_no_precondition_check(U, V)
        MsvcBuiltinBitCast:                            0x0410, // __builtin_bit_cast(T, x)
        MsvcBuiltinIsLayoutCompatible:                 0x0411, // __builtin_is_layout_compatible(U, V)
        MsvcBuiltinIsPointerInterconvertibleBaseOf:    0x0412, // __builtin_is_pointer_interconvertible_base_of(U, V)
        MsvcBuiltinIsPointerInterconvertibleWithClass: 0x0413, // __builtin_is_pointer_interconvertible_with_class(U, V)
        MsvcBuiltinIsCorrespondingMember:              0x0414, // __builtin_is_corresponding_member(x, y)
        MsvcIntrinsic:                                 0x0415, //                      -- abstract machine, misc intrinsic with no regular function declaration

        Count:                                         0x0416
    };

    constructor(value) {
        this.value = value;
    }
}

class TriadicOperator {
    static Value = {
        Unknown:     0,
        Choice:      1, // x ? : y: z
        ConstructAt: 2, // new(p) T(x)
        Initialize:  3, //                      -- abstract machine, initialize an object with operation and argument

        Msvc: 0x0400,

        MsvcConfusion:         0x0FE0, // FIXME: Anything below is confusion to be removed
        MsvcConfusedPushState: 0x0FE1, // An EH state tree representing a call to a ctor, dtor, and msvc-specific EH state flags.

        Count:                 0x0FE2
    };

    constructor(value) {
        this.value = value;
    }
}

class StorageOperator {
    static Values = {
        Unknown:          0,
        AllocateSingle:   1, // operator new
        AllocateArray:    2, // operator new[]
        DeallocateSingle: 3, // operator delete
        DeallocateArray:  4, // operator delete[]

        Msvc:  0x0400,

        Count: 0x0401
    };

    constructor(value) {
        this.value = value;
    }
}

class VariadicOperator {
    static Values = {
        Unknown:    0,
        Collection: 1, // x, y, z  -- collection of expressions, not the comma expression; no order of evaluation
        Sequence:   2, // Like Collection, but with a left-to-right sequencing order of evaluation

        Msvc:                         0x0400,
        MsvcHasTrivialConstructor:    0x0401, // __has_trivial_constructor(U, V, W, ...)
        MsvcIsConstructible:          0x0402, // __is_constructible(U, V, W, ...)
        MsvcIsNothrowConstructible:   0x0403, // __is_nothrow_constructible(U, V, W, ...)
        MsvcIsTriviallyConstructible: 0x0404, // __is_trivially_constructible(U, V, W, ...)

        Count:                        0x0405
    };

    constructor(value) {
        this.value = value;
    }
}

function read_op(T, reader) {
    var value = reader.read_uint16();
    return new T(value);
}

class Operator {
    static Sort = {
        Niladic:  0,   // no argument
        Monadic:  1,   // one argument
        Dyadic:   2,   // two arguments
        Triadic:  3,   // three arguments
        Storage:  0xE, // storage allocation and deallocation
        Variadic: 0xF, // any number of arguments
        Count:    0xF
    };

    constructor(reader) {
        var index = reader.read_index16_bitfield(Operator.Sort.Count);
        this.sort = index.sort;
        this.value = Operator._classify_operator_value(index.sort, index.index);
    }

    static _classify_operator_value(sort, value) {
        switch (sort) {
        case Operator.Sort.Niladic:
            return new NiladicOperator(value);
        case Operator.Sort.Monadic:
            return new MonadicOperator(value);
        case Operator.Sort.Dyadic:
            return new DyadicOperator(value);
        case Operator.Sort.Triadic:
            return new TriadicOperator(value);
        case Operator.Sort.Storage:
            return new StorageOperator(value);
        case Operator.Sort.Variadic:
            return new VariadicOperator(value);
        }
    }
}