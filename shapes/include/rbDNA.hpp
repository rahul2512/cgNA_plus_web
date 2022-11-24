#pragma once

#include <iostream>
#include <vector>
#include <string>

#include <armadillo>

#include "dna_code.hpp"


class rbDNA {
    public:
        rbDNA ();
        rbDNA (const std::vector<code_t>& sequence);
        rbDNA (const std::string& sequence);
        ~rbDNA () {}

        //================================================================================
        //  Element access:
        //================================================================================

        inline arma::mat& R (int i) {
        #ifdef DEBUG
            return _R.at(i);
        #else
            return _R[i];
        #endif
        }

        inline arma::mat& Rc (int i) {
        #ifdef DEBUG
            return _Rc.at(i);
        #else
            return _Rc[i];
        #endif
        }

        inline arma::vec& r (int i) {
        #ifdef DEBUG
            return _r.at(i);
        #else
            return _r[i];
        #endif
        }

        inline arma::vec& rc (int i) {
        #ifdef DEBUG
            return _rc.at(i);
        #else
            return _rc[i];
        #endif
        }

        inline code_t& seq (int i) {
        #ifdef DEBUG
            return _sequence.at(i);
        #else
            return _sequence[i];
        #endif
        }

        //================================================================================
        //  CONST Element access:
        //================================================================================

        inline arma::mat const_R (int i) const {
        #ifdef DEBUG
            return _R.at(i);
        #else
            return _R[i];
        #endif
        }

        inline arma::mat const_Rc (int i) const {
        #ifdef DEBUG
            return _Rc.at(i);
        #else
            return _Rc[i];
        #endif
        }

        inline arma::vec const_r (int i) const {
        #ifdef DEBUG
            return _r.at(i);
        #else
            return _r[i];
        #endif
        }

        inline arma::vec const_rc (int i) const {
        #ifdef DEBUG
            return _rc.at(i);
        #else
            return _rc[i];
        #endif
        }

        inline code_t const_seq (int i) const {
        #ifdef DEBUG
            return _sequence.at(i);
        #else
            return _sequence[i];
        #endif
        }

        //================================================================================
        //  Getters:
        //================================================================================
        
        inline int size () const {
            return _size;
        }

        inline std::vector<arma::mat> orientations_Watson () const {
            return _R;
        }

        inline std::vector<arma::mat> orientations_Crick () const {
            return _Rc;
        }

        inline std::vector<arma::vec> positions_Watson () const {
            return _r;
        }

        inline std::vector<arma::vec> positions_Crick () const {
            return _rc;
        }

        std::string sequence () const;
        //================================================================================
        //  Other setters
        //================================================================================
        void set_sequence (const std::string& sequence);
        void set_sequence (const std::vector<code_t>& sequence);


        void push_back (code_t c);
        void push_front (code_t c);

        void push_back (char c);
        void push_front (char c);

        void remove_front ();
        void remove_back ();
    private:

        std::vector<arma::mat> _R;
        std::vector<arma::mat> _Rc;
        std::vector<arma::vec> _r;
        std::vector<arma::vec> _rc;

        std::vector<code_t> _sequence;
        int _size;
};

