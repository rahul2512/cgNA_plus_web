#pragma once

enum output_t {
    position_W,
    position_C,
    position_bp,
    position_phos_W,
    position_phos_C,

    orientation_W,
    orientation_C,
    orientation_bp,
    orientation_phos_W,
    orientation_phos_C,

    sequence_W,
    shape,
    energy,
    nucleosome_orientation
};

enum output_format_t {
    tsf,
    json
};
