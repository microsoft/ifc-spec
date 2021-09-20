class ImmediateLiteral {
    // No partition

    constructor(index) {
        this.value = index.index;
    }
}

class IntegerLiteral {
    static partition_name = "const.i64";

    constructor(reader) {
        const array8 = new Uint8Array([ reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(), ]);
        const array64 = new BigUint64Array(array8.buffer);
        const uint64 = array64[0];
        this.value = uint64;
    }
}

class FloatLiteral {
    static partition_name = "const.f64";

    constructor(reader) {
        const array8 = new Uint8Array([ reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(),
                                        reader.read_uint8(), ]);
        const view = new DataView(array8.buffer);
        // Note: these values are stored in little-endian.
        this.value = view.getFloat64(0, true);
        this.size = reader.read_uint16();
    }
}

function symbolic_for_lit_sort(sort) {
    switch (sort) {
    case LitIndex.Sort.Integer:
        return IntegerLiteral;
    case LitIndex.Sort.FloatingPoint:
        return FloatLiteral;
    case LitIndex.Sort.Immediate:
    default:
        console.error(`Bad sort: ${sort}`);
        return null;
    }
}