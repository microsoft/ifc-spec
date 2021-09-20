class RawByteReader {
    constructor(bytes) {
        this.bytes = bytes;
        this.offset = 0;
    }

    read_uint8() {
        const byte = this.bytes[this.offset];
        this.offset += 1;
        return byte;
    }

    read_uint16() {
        const array8 = new Uint8Array([ this.read_uint8(),
                                        this.read_uint8() ]);
        const array16 = new Uint16Array(array8.buffer);
        const uint16 = array16[0];
        return uint16;
    }

    read_uint32() {
        const array8 = new Uint8Array([ this.read_uint8(),
                                        this.read_uint8(),
                                        this.read_uint8(),
                                        this.read_uint8() ]);
        const array32 = new Uint32Array(array8.buffer);
        const uint32 = array32[0];
        return uint32;
    }

    read_null_terminated_string() {
        var array = new Array();
        for (var byte = this.read_uint8(); byte != 0; byte = this.read_uint8()) {
            array.push(byte);
        }
        return String.fromCharCode.apply(String, array);
    }

    static bit_width(n) {
        return n.toString(2).length;
    }

    read_index_bitfield(sort_count) {
        var sort_size = RawByteReader.bit_width(sort_count - 1);
        var index = this.read_uint32();
        var mask = (1 << sort_size) - 1;
        var sort = (index & mask);
        index = (index & ~mask) >> sort_size;
        return { sort: sort, index: index };
    }

    read_index16_bitfield(sort_count) {
        var sort_size = RawByteReader.bit_width(sort_count - 1);
        var index = this.read_uint16();
        var mask = (1 << sort_size) - 1;
        var sort = (index & mask);
        index = (index & ~mask) >> sort_size;
        return { sort: sort, index: index };
    }

    seek(off) {
        this.offset = off;
    }
}

class Signature {
    constructor(reader) {
        this.A = reader.read_uint8();
        this.B = reader.read_uint8();
        this.C = reader.read_uint8();
        this.D = reader.read_uint8();
    }

    valid() {
        const valid = [ 0x54, 0x51, 0x45, 0x1A ];
        if (this.A != valid[0])
            return false;
        if (this.B != valid[1])
            return false;
        if (this.C != valid[2])
            return false;
        if (this.D != valid[3])
            return false;
        return true;
    }
}

class SHA256 {
    constructor(reader) {
        this.hash = new Uint32Array([ reader.read_uint32(),
                      reader.read_uint32(),
                      reader.read_uint32(),
                      reader.read_uint32(),
                      reader.read_uint32(),
                      reader.read_uint32(),
                      reader.read_uint32(),
                      reader.read_uint32() ]);
    }

    as_string() {
        const uint8_data = new Uint8Array(this.hash.buffer);
        const str = uint8_data.map(x => x.toString(16).padStart(2, '0')).join('');
        return str;
    }
}

class Version {
    constructor(reader) {
        this.major = reader.read_uint8();
        this.minor = reader.read_uint8();
    }
}

class Abi {
    constructor(reader) {
        this.abi = reader.read_uint8();
    }
}

class Architecture {
    static Kind = {
        Unknown:         0,
        X86:             1,
        X64:             2,
        ARM32:           3,
        ARM64:           4,
        HybridX86ARM64 : 5
    };

    constructor(reader) {
        this.arch = reader.read_uint8();
    }

    kind() {
        var k = "";
        switch (this.arch) {
        case Architecture.Kind.Unknown:
            k = "unknown";
            break;
        case Architecture.Kind.X86:
            k = "x86";
            break;
        case Architecture.Kind.X64:
            k = "x64";
            break;
        case Architecture.Kind.ARM32:
            k = "arm";
            break;
        case Architecture.Kind.ARM64:
            k = "arm64";
            break;
        case Architecture.Kind.HybridX86ARM64:
            k = "chpe";
            break;
        }
        return k;
    }
}

class CPlusPlus {
    constructor(reader) {
        this.cplusplus = reader.read_uint32();
    }
}

class StringTable {
    constructor(reader, offset, size) {
        this.strings = new Map();
        reader.seek(offset);
        while ((reader.offset - offset) < size) {
            var key = reader.offset - offset;
            var str = reader.read_null_terminated_string();
            this.strings.set(key, str);
            //console.log("string_table[", key, "] =", str); // More logging if necessary.
        }
        //console.log("String table built.  Byte offset =", offset, " size =", size, " iterated =", (reader.offset - offset)); // More logging if necessary.
    }

    get(offset) {
        return this.strings.get(offset);
    }
}

class UnitIndex {
    static Sort = {
        Source:     0,
        Primary:    1,
        Partition:  2,
        Header:     3,
        ExportedTU: 4,
        Count:      5
    };

    constructor(reader) {
        var index = reader.read_index_bitfield(UnitIndex.Sort.Count);
        this.sort = index.sort;
        this.index = index.index;
    }

    ifc_designator() {
        return this.index;
    }
}

class Header {
    constructor(reader) {
        this.signature = new Signature(reader);
        if (!this.signature.valid())
            return;
        this.content_hash = new SHA256(reader);
        this.version = new Version(reader);
        this.abi = new Abi(reader);
        this.arch = new Architecture(reader);
        this.cplusplus = new CPlusPlus(reader);
        this.string_table_offset = reader.read_uint32();
        this.string_table_size = reader.read_uint32();
        this.unit_sort = new UnitIndex(reader);
        this.src_path = reader.read_uint32();
        this.scope_index = reader.read_uint32();
        this.toc = reader.read_uint32();
        this.partition_count = reader.read_uint32();
        this.internal_partition = reader.read_uint8();
    }

    valid() {
        if (!this.signature.valid())
            return false;
        return true;
    }
}

class Partition {
    constructor(reader) {
        this.name = reader.read_uint32();
        this.offset = reader.read_uint32();
        this.cardinality = reader.read_uint32();
        this.entry_size = reader.read_uint32();
    }

    tell(index) {
        return this.offset + index * this.entry_size;
    }

    byte_count() {
        return this.cardinality * this.entry_size;
    }
}

class ToC {
    constructor(reader, header, string_table) {
        this.partitions = new Array();
        reader.seek(header.toc);
        for (var i = 0; i < header.partition_count; ++i) {
            this.partitions.push(new Partition(reader));
        }
        this._classify_partitions(string_table);
    }

    _classify_partitions(string_table) {
        this.partition_by_name_map = new Map();
        for (var i = 0; i < this.partitions.length; ++i) {
            this._classify_partition(this.partitions[i], string_table);
        }
    }

    _classify_partition(p, string_table) {
        this.partition_by_name_map.set(string_table.get(p.name), p);
    }

    partition_by_name(name) {
        return this.partition_by_name_map.get(name);
    }

    partition(T) {
        return this.partition_by_name(T.partition_name);
    }
}