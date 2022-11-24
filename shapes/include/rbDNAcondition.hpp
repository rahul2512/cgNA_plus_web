#pragma once

enum operating_t {
    non_op,
    base_Watson, //(Don't) move the Watson base in a certain way.
    base_Crick, //(Don't) move the Crick base in a certain way.
    base_both, //BP is fully static; doesn't move at all in either rotation or translation
    basepair //(Don't) move the bp frame, but can move the bases.
};

enum condition_t {
    no_cond,
    position,
    orientation,
    both,
};

struct fixed_condition {
    int index;
    operating_t which;
    condition_t c;
};

struct coupled_condition {
    int index;
    operating_t which;
    condition_t c;

    int other_index;
    operating_t other_which;
};
