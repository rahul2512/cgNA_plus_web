#include "rbDNA.hpp"
#include "rbDNAutils.hpp"

//================================================================================
//  Constructors
//================================================================================

rbDNA::rbDNA ()
{
    _size = 0;
}

rbDNA::rbDNA (const std::string& sequence)
{
    _size = 0;
    for (auto& c : sequence)
        push_back(c);
}

rbDNA::rbDNA (const std::vector<code_t>& sequence)
{
    _size = 0;
    for (auto& c : sequence)
        push_back(c);
}

//================================================================================
//  Adding and removing basepairs
//================================================================================

void rbDNA::push_front (code_t c)
{
    _sequence.insert(_sequence.begin(), c);
    _R.insert(_R.begin(), arma::eye<arma::mat>(3,3));
    _Rc.insert(_Rc.begin(), arma::eye<arma::mat>(3,3));
    _r.insert(_r.begin(), arma::zeros<arma::vec>(3));
    _rc.insert(_rc.begin(), arma::zeros<arma::vec>(3));
    _size += 1;
}

void rbDNA::push_back (code_t c)
{
    _sequence.push_back(c);
    _R.push_back(arma::eye<arma::mat>(3,3));
    _Rc.push_back(arma::eye<arma::mat>(3,3));
    _r.push_back(arma::zeros<arma::vec>(3));
    _rc.push_back(arma::zeros<arma::vec>(3));
    _size += 1;
}

void rbDNA::push_front (char c)
{
    code_t _c = utils::char2base(c);
    push_front(_c);
}

void rbDNA::push_back (char c)
{
    code_t _c = utils::char2base(c);
    push_back(_c);
}

void rbDNA::remove_front ()
{
    if (_size == 0) {
        std::cerr << "Error: Removing basepair from empty DNA" << std::endl;
        exit(1);
    }
    _size -= 1;
    _sequence.erase(_sequence.begin());
    _R.erase(_R.begin());
    _Rc.erase(_Rc.begin());
    _r.erase(_r.begin());
    _rc.erase(_rc.begin());
}

void rbDNA::remove_back ()
{
    if (_size == 0) {
        std::cerr << "Error: Removing basepair from empty DNA" << std::endl;
        exit(1);
    }

    _size -= 1;
    _sequence.pop_back();
    _R.pop_back();
    _Rc.pop_back();
    _r.pop_back();
    _rc.pop_back();
}

//================================================================================
//  Sets
//================================================================================

/* OLD ONES:
void rbDNA::set_sequence (const std::string& sequence)
{
    std::vector<code_t> seq;
    for (auto& c : sequence) {
        seq.push_back(utils::char2base(c));
    }
    _sequence = seq;
#ifdef DEBUG
    if (_size != seq.size())
        std::cerr << "DNA sequence size mismatch! Exiting!" << std::endl;
#endif
}

void rbDNA::set_sequence (const std::vector<code_t>& sequence)
{
    _sequence = sequence;
#ifdef DEBUG
    if (_size != sequence.size())
        std::cerr << "DNA sequence size mismatch! Exiting!" << std::endl;
#endif
}
*/

void rbDNA::set_sequence (const std::string& sequence)
{
    if (sequence.size() < _sequence.size()) {
        std::cout << "Not enough bases for setting the DNA sequence" << std::endl;
        exit(1);
    }
    std::vector<code_t> seq;
    for (auto& c : sequence) {
        seq.push_back(utils::char2base(c));
    }
    for (size_t i = 0; i < _sequence.size(); i++)
        _sequence.at(i) = seq.at(i);
#ifdef DEBUG
    if (_size != seq.size())
        std::cerr << "DNA sequence size mismatch! Exiting!" << std::endl;
#endif
}

void rbDNA::set_sequence (const std::vector<code_t>& sequence)
{
    if (sequence.size() < _sequence.size()) {
        std::cout << "Not enough bases for setting the DNA sequence" << std::endl;
        exit(1);
    }
    for (size_t i = 0; i < _sequence.size(); i++)
        _sequence.at(i) = sequence.at(i);
#ifdef DEBUG
    if (_size != sequence.size())
        std::cerr << "DNA sequence size mismatch! Exiting!" << std::endl;
#endif
}
//================================================================================
//  Gets
//================================================================================

std::string rbDNA::sequence () const
{
    std::string s = "";
    for (auto& c : _sequence)
        s.push_back(utils::base2char(c));

    return s;
}

