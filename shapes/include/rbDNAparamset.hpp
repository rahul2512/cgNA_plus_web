#pragma once

#include <string>
#include <unordered_map>

struct Parameter_set {
    std::unordered_map<std::string, arma::mat> monomer_stiffnesses;
    std::unordered_map<std::string, arma::vec> monomer_shapes;
    std::unordered_map<std::string, arma::mat> dimer_stiffnesses;
    std::unordered_map<std::string, arma::vec> dimer_shapes;
};

struct Parameter_set_prime {
    std::unordered_map<std::string, arma::mat> dimer_stiffnesses_inner;
    std::unordered_map<std::string, arma::vec> dimer_shapes_inner;
    std::unordered_map<std::string, arma::mat> dimer_stiffnesses_outer_end1;
    std::unordered_map<std::string, arma::vec> dimer_shapes_outer_end1;
    std::unordered_map<std::string, arma::mat> dimer_stiffnesses_outer_end2;
    std::unordered_map<std::string, arma::vec> dimer_shapes_outer_end2;
};
