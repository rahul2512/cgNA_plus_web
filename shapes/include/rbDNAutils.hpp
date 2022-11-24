#pragma once

#include <iostream>
#include <string>
#include <cassert>
#include <cmath>

#include <armadillo>

#include "rbDNA.hpp"
#include "dna_code.hpp"
#include "rbDNAparamset.hpp"


namespace utils {
    code_t char2base (char nucleotide);
    char base2char (code_t c);

    std::vector<code_t> make_sequence (const std::string& s);

    /**
     * Checks whether a given string can be a sequence. Which means that all
     * characters in it ar eof the set {A, C, G, T}.
     * @param seq       the possible sequence
     *
     * @return          True if seq is a sequence, false if not
     */
    bool correct_sequence (const std::string& seq);

//================================================================================
//  Construct K and w from a sequence
//================================================================================

    /**
     * Constructs the stiffness matrix from a given sequence.
     * @param seq       the sequence
     * @param io        the io in which the stiffnesses are stored
     *
     * @pre             io needs to have the stifnesses and shapes initialised.
     * @return          a (12*seq.size()-6)x(12*seq.size()-6) matrix
     */
    arma::mat make_K (const std::string& seq, const Parameter_set& paramset);

    /**
     * Constructs the stiffness matrix from a given sequence.
     * @param seq       the sequence
     * @param io        the io in which the stiffnesses are stored
     *
     * @pre             io needs to have the stifnesses and shapes initialised.
     * @return          a (12*seq.size()-6)x(12*seq.size()-6) matrix
     */
    arma::mat make_K_prime (const std::string& seq, const Parameter_set_prime& paramset);

    /**
     * Constructs the shape vector from a given sequence.
     * @param seq       the sequence
     * @param io        the io in which the shapes and stiffnesses are stored
     * @param K         the stiffness matrix for the same sequence
     *
     * @pre             io needs to have the stifnesses and shapes initialised.
     * @return          a (12*seq.size()-6) vector
     */
    arma::vec make_w (const std::string& seq, const Parameter_set& paramset, const arma::mat& K);
    arma::vec make_w_prime (const std::string& seq, const Parameter_set_prime& paramset, const arma::mat& K);

    arma::vec make_w_tridiag (const std::string& seq, const Parameter_set& paramset, const arma::mat& K);
    arma::vec make_w_tridiag_prime (const std::string& seq, const Parameter_set_prime& paramset, const arma::mat& K);

    /**
     * Constructs the stiffness matrix from a given sequence.
     * @param seq       the sequence
     * @param io        the io object in which the stiffnesses are stored
     *
     * @pre             io needs to have the stifnesses and shapes initialised.
     * @return          a (12*seq.size()-6)x(12*seq.size()) matrix
     */
    arma::mat make_periodic_K(const std::string& seq, const Parameter_set& paramset);

    /**
     * Constructs the shape vector from a given sequence.
     * @param seq       the sequence
     * @param io        the io in which the shapes and stiffnesses are stored
     * @param K         the stiffness matrix for the same sequence
     *
     * @pre             io needs to have the stifnesses and shapes initialised.
     * @pre             K is a periodic stiffness matrix
     * @return          a 12*seq.size() vector
     */
    arma::vec make_periodic_w (const std::string& seq, const Parameter_set& paramset, const arma::mat& K);
    arma::vec make_periodic_w_pentadiag (const std::string& seq, const Parameter_set& paramset, const arma::mat& K);

    arma::vec make_w_conj_grad (const std::string& new_seq, const arma::vec& old_w, const Parameter_set& paramset, const arma::mat& new_K, const arma::mat& old_K);


    /**
     * Constructs the rigid bp stiffness matrix from a given sequence.
     * @param seq       the sequence
     * @param io        the io in which the stiffnesses are stored
     *
     * @pre             io needs to have the stifnesses and shapes initialised.
     * @return          a 6*(seq.size()-1)x6*(seq.size()-1) matrix
     */
    arma::mat make_rigid_bp_K (const std::string& seq, const Parameter_set& paramset);
    /**
     * Constructs the shape vector from a given sequence.
     * @param seq       the sequence
     * @param io        the io in which the shapes and stiffnesses are stored
     * @param K         the stiffness matrix for the same sequence
     *
     * @pre             io needs to have the stifnesses and shapes initialised.
     * @return          a 6*(seq.size()-1) vector
     */
    arma::vec make_rigid_bp_w (const std::string& seq, const Parameter_set& paramset, const arma::mat& K);

//================================================================================
//  Construct ground state
//================================================================================

    /**
     * Constructs an rbDNA object from a given sequence and DOFs/shapes.
     * @param seq       the input sequence
     * @param w         the DOFs
     *
     * @return          an rbDNA object with given sequence and configuration.
     */
    rbDNA construct_configuration (const std::string& seq, const arma::vec& w);

    rbDNA construct_circle (const std::string& seq, double winding_number);
//================================================================================
//  Rotation matrices, midframes, and DOFs
//================================================================================

    /**
     * Calculates the degrees of freedom for the bases with orientation R,Rc and position r,rc.
     *
     * @return: a 6-dim vector.
     */
    arma::vec6 degrees_of_freedom (const arma::mat33& R, const arma::mat33& Rc, 
                                  const arma::vec3& r, const arma::vec3& rc);

    /**
     * Calculates the left operating rotation matrix from the Euler axis theta.
     *
     * @return: a 3x3 matrix.
     */
    arma::mat33 rot_mat (const arma::vec3& theta);

    /**
     * Calculates the left operating relative rotation matrix for two coord systems.
     *
     * @return: a 3x3 matrix.
     */
    arma::mat33 relative_rot_mat (const arma::mat33& R, const arma::mat33& Rc);

    /**
     * Calculates the midframe orientation between two coord systems R and Rc.
     *
     * @return: a 3x3 matrix.
     */
    arma::mat33 midframe_or (const arma::mat33& R, const arma::mat33& Rc);

    /**
     * Calculates the midframe position between two coord systems.
     *
     * @return: a 3-dim vector.
     */
    arma::vec3 midframe_pos (const arma::vec3& r, const arma::vec3& rc);

    /**
     * Calculates the Euler axis from the rotation matrix.
     *
     * @return: a 3-dim vector.
     */
    arma::vec3 rot_axis (const arma::mat33& Rot_mat);

    /**
     * Calculates the square root of the given rottion matrix.
     *
     * @return      a 3x3 rotation matrix
     */
    arma::mat33 half_rot_mat (const arma::mat33& R);

    /**
     * Takes a coordinate system (matrix) as input and makes it orthogonal according to the Gramm-Schmidt method.
     * Returns the orthonormalised coordinate system.
     */
    arma::mat33 orthonormalise_coord_system (const arma::mat33& D, int first);

    /**
     * Calculates and returns the projection of u on v.
     */
    arma::vec3 proj (const arma::vec3& u, const arma::vec3& v);
}
