#include "rbDNAutils.hpp"
//#include "rbDNAparamset.hpp"

code_t utils::char2base (char nucleotide)
{
    code_t c;
    if      (nucleotide == 'a' || nucleotide == 'A')
        c = A;
    else if (nucleotide == 'g' || nucleotide == 'G')
        c = G;
    else if (nucleotide == 'c' || nucleotide == 'C')
        c = C;
    else if (nucleotide == 't' || nucleotide == 'T')
        c = T;
    else {
        std::cerr << "Error: Adding non-base letter to DNA" << std::endl;
        exit(1);
    }

    return c;
}

char utils::base2char (code_t c)
{
    if (c == code_t::A)
        return 'A';
    else if (c == code_t::T)
        return 'T';
    else if (c == code_t::G)
        return 'G';
    else if (c == code_t::C)
        return 'C';
    else //(c == code_t::X)
        return 'X';
}

std::vector<code_t> utils::make_sequence (const std::string& s)
{
    std::vector<code_t> sequence;
    for (auto& n : s)
        sequence.push_back(utils::char2base(n));

    return sequence;
}

bool utils::correct_sequence (const std::string& seq)
{
    for (auto& base : seq) {
        if (!(base == 'A' || base == 'C' || base == 'G' || base == 'T' || base == 'X'))
            return false;
    }

    return true;
}

//================================================================================
//  Construct K and w from a sequence
//================================================================================

arma::mat utils::make_K (const std::string& seq, const Parameter_set& paramset)
{
    arma::mat super_K = arma::zeros<arma::mat>(12*seq.size()-6,12*seq.size()-6);
    //add the bps Ks:
    for (size_t i = 0; i < seq.size()-1; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        std::string dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_K.submat(12*i,12*i, 12*i+17, 12*i+17) += paramset.dimer_stiffnesses.at(dimer);
    }
    //add the bp Ks:
    for (size_t i = 0; i < seq.size(); ++i)
        super_K.submat(12*i,12*i, 12*i+5, 12*i+5) += paramset.monomer_stiffnesses.at(seq.substr(i,1));

    return super_K;
}

arma::mat utils::make_K_prime (const std::string& seq, const Parameter_set_prime& paramset)
{
    arma::mat super_K = arma::zeros<arma::mat>(12*seq.size()-6,12*seq.size()-6);

    //add the end1 outer submatrix
    std::string dimer = seq.substr(0,2);
    super_K.submat(0, 0, arma::size(18,18)) += paramset.dimer_stiffnesses_outer_end1.at(dimer);

    //add the bps Ks:
    for (size_t i = 1; i < seq.size()-2; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_K.submat(12*i,12*i, arma::size(18,18)) += paramset.dimer_stiffnesses_inner.at(dimer);
    }

    //add the end2 outer submatrix
    dimer = seq.substr(seq.size()-2,2);
    super_K.submat(12*(seq.size()-2),12*(seq.size()-2), arma::size(18,18)) += paramset.dimer_stiffnesses_outer_end2.at(dimer);

    return super_K;
}

arma::vec utils::make_w (const std::string& seq, const Parameter_set& paramset, const arma::mat& K)
{
    arma::vec super_sigma = arma::zeros<arma::vec>(12*seq.size()-6);
    //add the bps shapes:
    for (size_t i = 0; i < seq.size()-1; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        std::string dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_sigma.subvec(12*i, 12*i+17) += paramset.dimer_shapes.at(dimer);
    }
    //add the bp shapes:
    for (size_t i = 0; i < seq.size(); ++i)
        super_sigma.subvec(12*i, 12*i+5) += paramset.monomer_shapes.at(seq.substr(i,1));

    return arma::inv_sympd(K)*super_sigma; //inverse of pos. def. symm. matrix
    //return solve(K,super_sigma); //inverse of pos. def. symm. matrix
}

arma::vec utils::make_w_prime (const std::string& seq, const Parameter_set_prime& paramset, const arma::mat& K)
{
    arma::vec super_sigma = arma::zeros<arma::vec>(12*seq.size()-6);

    //add the end1 outer subvector
    std::string dimer = seq.substr(0,2);
    super_sigma.subvec(0, 17) += paramset.dimer_shapes_outer_end1.at(dimer);

    //add the bps shapes:
    for (size_t i = 1; i < seq.size()-2; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_sigma.subvec(12*i, 12*i+17) += paramset.dimer_shapes_inner.at(dimer);
    }

    //add the end2 outer subvector
    dimer = seq.substr(seq.size()-2,2);
    super_sigma.subvec(12*(seq.size()-2), 12*(seq.size()-2)+17) += paramset.dimer_shapes_outer_end2.at(dimer);

    return arma::inv_sympd(K)*super_sigma; //inverse of pos. def. symm. matrix
}

arma::vec utils::make_w_tridiag (const std::string& seq, const Parameter_set& paramset, const arma::mat& K)
{
    int size = seq.size();
    arma::vec super_sigma = arma::zeros<arma::vec>(12*size-6);
    //add the bps shapes:
    for (size_t i = 0; i < size-1; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        std::string dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_sigma.subvec(12*i, 12*i+17) += paramset.dimer_shapes.at(dimer);
    }
    //add the bp shapes:
    for (size_t i = 0; i < size; ++i)
        super_sigma.subvec(12*i, 12*i+5) += paramset.monomer_shapes.at(seq.substr(i,1));

    //BLOCK TRIDIAGONAL SOLVE:
    // Solves system of
    // [ B1 C1          ] [ X1 ]   [ b1 ]
    // [ A2 B2 C2       ] [    ]   [ b2 ]
    // [    A3 B3 C3    ] [    ] = [    ]
    // [         ...    ] [    ]   [    ]
    // [  An-1 Bn-1 Cn-1] [    ]   [    ]
    // [           An Bn] [ Xn ]   [ bn ]
    // where A,B, C are mxm blocks, and b are mx1 vectors
    // 
    // decompose matrix into
    // [ beta1          ] [ I gamma_1       ] 
    // [ A2 beta2       ] [   I gamma_2     ] 
    // [    A3 beta3    ] [     I gamma_3   ]
    // [         ...    ] [       ....      ] 
    // [      A_n betan_] [        I gamma_n] 
    //get everything in order
    auto A = std::vector<arma::mat::fixed<12,12>>(size);
    auto B = std::vector<arma::mat::fixed<12,12>>(size);
    auto C = std::vector<arma::mat::fixed<12,12>>(size);
    auto s = std::vector<arma::vec::fixed<12>>(size);
    
    A[0] = arma::zeros<arma::mat>(12,12);
    C[size-1] = arma::zeros<arma::mat>(12,12);

    for (size_t i = 0; i < size-2; ++i)
        A[i+1] = K.submat(12*(i+1),12*(i), 12*(i+2)-1, 12*(i+1)-1);
    A[size-1] = arma::zeros<arma::mat>(12,12);
    A[size-1].submat(0,0,5,11) = K.submat(12*(size-1),12*(size-2), 12*(size-1)+5, 12*(size-2)+11);
    for (size_t i = 0; i < size-1; ++i)
        B[i] = K.submat(12*i, 12*i, 12*(i+1)-1, 12*(i+1)-1);
    B[size-1] = arma::eye(12,12);
    B[size-1].submat(0,0,5,5) = K.submat(12*(size-1),12*(size-1), 12*(size-1)+5, 12*(size-1)+5);
    for (size_t i = 1; i < size; ++i)
        C[i-1] = A[i].t();
    for (size_t i = 0; i < size-1; ++i)
        s[i] = super_sigma.subvec(12*i, 12*(i+1)-1);
    s[size-1].subvec(0,5) = super_sigma.subvec(12*(size-1), 12*(size-1)+5);


    //temp stuff:
    auto beta = std::vector<arma::mat::fixed<12,12>>(seq.size());
    auto gamma = std::vector<arma::mat::fixed<12,12>>(seq.size());
    auto Y = std::vector<arma::vec::fixed<12>>(seq.size());
    auto X = std::vector<arma::vec::fixed<12>>(seq.size());

    beta[0] = B[0];
    gamma[0] = arma::solve(beta[0],C[0]);
    Y[0] = arma::solve(beta[0],s[0]);

    for (size_t i = 1; i < size; ++i) {
        beta[i] = B[i] - A[i]*gamma[i-1];
        gamma[i] = arma::solve(beta[i],C[i]);
        Y[i] = arma::solve(beta[i], s[i]-A[i]*Y[i-1]);
    }

    X[size-1] = Y[size-1];
    for (int i = size-1-1; i >= 0; --i) {
        X[i] = Y[i]-gamma[i]*X[i+1];
    }

    arma::vec sol = arma::zeros<arma::vec>(12*size);
    for (size_t i = 0; i < size; ++i) {
        sol.subvec(12*i,12*i+11) = X[i];
    }

    return sol.subvec(0,12*size-6-1);
}

arma::vec utils::make_w_tridiag_prime (const std::string& seq, const Parameter_set_prime& paramset, const arma::mat& K)
{
    int size = seq.size();
    arma::vec super_sigma = arma::zeros<arma::vec>(12*size-6);

    //add the end1 outer subvector
    std::string dimer = seq.substr(0,2);
    super_sigma.subvec(0, 17) += paramset.dimer_shapes_outer_end1.at(dimer);

    //add the bps shapes:
    for (size_t i = 1; i < seq.size()-2; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_sigma.subvec(12*i, 12*i+17) += paramset.dimer_shapes_inner.at(dimer);
    }

    //add the end2 outer subvector
    dimer = seq.substr(seq.size()-2,2);
    super_sigma.subvec(12*(seq.size()-2), 12*(seq.size()-2)+17) += paramset.dimer_shapes_outer_end2.at(dimer);


    //BLOCK TRIDIAGONAL SOLVE:
    // Solves system of
    // [ B1 C1          ] [ X1 ]   [ b1 ]
    // [ A2 B2 C2       ] [    ]   [ b2 ]
    // [    A3 B3 C3    ] [    ] = [    ]
    // [         ...    ] [    ]   [    ]
    // [  An-1 Bn-1 Cn-1] [    ]   [    ]
    // [           An Bn] [ Xn ]   [ bn ]
    // where A,B, C are mxm blocks, and b are mx1 vectors
    // 
    // decompose matrix into
    // [ beta1          ] [ I gamma_1       ] 
    // [ A2 beta2       ] [   I gamma_2     ] 
    // [    A3 beta3    ] [     I gamma_3   ]
    // [         ...    ] [       ....      ] 
    // [      A_n betan_] [        I gamma_n] 
    //get everything in order
    auto A = std::vector<arma::mat::fixed<12,12>>(size);
    auto B = std::vector<arma::mat::fixed<12,12>>(size);
    auto C = std::vector<arma::mat::fixed<12,12>>(size);
    auto s = std::vector<arma::vec::fixed<12>>(size);
    
    A[0] = arma::zeros<arma::mat>(12,12);
    C[size-1] = arma::zeros<arma::mat>(12,12);

    for (size_t i = 0; i < size-2; ++i)
        A[i+1] = K.submat(12*(i+1),12*(i), 12*(i+2)-1, 12*(i+1)-1);
    A[size-1] = arma::zeros<arma::mat>(12,12);
    A[size-1].submat(0,0,5,11) = K.submat(12*(size-1),12*(size-2), 12*(size-1)+5, 12*(size-2)+11);
    for (size_t i = 0; i < size-1; ++i)
        B[i] = K.submat(12*i, 12*i, 12*(i+1)-1, 12*(i+1)-1);
    B[size-1] = arma::eye(12,12);
    B[size-1].submat(0,0,5,5) = K.submat(12*(size-1),12*(size-1), 12*(size-1)+5, 12*(size-1)+5);
    for (size_t i = 1; i < size; ++i)
        C[i-1] = A[i].t();
    for (size_t i = 0; i < size-1; ++i)
        s[i] = super_sigma.subvec(12*i, 12*(i+1)-1);
    s[size-1].subvec(0,5) = super_sigma.subvec(12*(size-1), 12*(size-1)+5);


    //temp stuff:
    auto beta = std::vector<arma::mat::fixed<12,12>>(seq.size());
    auto gamma = std::vector<arma::mat::fixed<12,12>>(seq.size());
    auto Y = std::vector<arma::vec::fixed<12>>(seq.size());
    auto X = std::vector<arma::vec::fixed<12>>(seq.size());

    beta[0] = B[0];
    gamma[0] = arma::solve(beta[0],C[0]);
    Y[0] = arma::solve(beta[0],s[0]);

    for (size_t i = 1; i < size; ++i) {
        beta[i] = B[i] - A[i]*gamma[i-1];
        gamma[i] = arma::solve(beta[i],C[i]);
        Y[i] = arma::solve(beta[i], s[i]-A[i]*Y[i-1]);
    }

    X[size-1] = Y[size-1];
    for (int i = size-1-1; i >= 0; --i) {
        X[i] = Y[i]-gamma[i]*X[i+1];
    }

    arma::vec sol = arma::zeros<arma::vec>(12*size);
    for (size_t i = 0; i < size; ++i) {
        sol.subvec(12*i,12*i+11) = X[i];
    }

    return sol.subvec(0,12*size-6-1);
}

//TODO TEST
arma::mat utils::make_periodic_K (const std::string& seq, const Parameter_set& paramset)
{
    arma::mat super_K = arma::zeros<arma::mat>(12*seq.size(),12*seq.size());
    //add the bps Ks:
    for (size_t i = 0; i < seq.size()-1; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        std::string dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_K.submat(12*i,12*i, 12*i+17, 12*i+17) += paramset.dimer_stiffnesses.at(dimer);
    }
    //add the bp Ks:
    for (size_t i = 0; i < seq.size(); ++i) {
        super_K.submat(12*i,12*i, 12*i+5, 12*i+5) += paramset.monomer_stiffnesses.at(seq.substr(i,1));
    }

    //add extra bps K:
    int size = seq.size();
    std::string dimer = "";
    dimer += seq.at(size-1);
    dimer += seq.at(0);
    if (dimer[0] == 'X' || dimer[1] == 'X')
        dimer = "XX";

    arma::mat end_begin_bps_K = paramset.dimer_stiffnesses.at(dimer);

    //at the start of K, for triple overlap:
    super_K.submat(0,0,5,5) += end_begin_bps_K.submat(12,12,17,17);
    //at the end of K, for triple overlap:
    super_K.submat(12*(size-1),12*(size-1), 12*(size-1)+11, 12*(size-1)+11) += end_begin_bps_K.submat(0,0,11,11);
    //at the sides:
    super_K.submat(12*(size-1),0,12*(size-1)+11,5) += end_begin_bps_K.submat(0,12,11,17);
    super_K.submat(0,12*(size-1),5,12*(size-1)+11) += end_begin_bps_K.submat(12,0, 17, 11);

    return super_K;
}

//TODO TEST
arma::vec utils::make_periodic_w (const std::string& seq, const Parameter_set& paramset, const arma::mat& K)
{
    arma::vec super_sigma = arma::zeros<arma::vec>(12*seq.size());
    //add the bps shapes:
    for (size_t i = 0; i < seq.size()-1; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        std::string dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_sigma.subvec(12*i, 12*i+17) += paramset.dimer_shapes.at(dimer);
    }
    //add the bp shapes:
    for (size_t i = 0; i < seq.size(); ++i)
        super_sigma.subvec(12*i, 12*i+5) += paramset.monomer_shapes.at(seq.substr(i,1));

    //add extra bps:
    int size = seq.size();
    std::string dimer = "";
    dimer += seq.at(seq.size()-1);
    dimer += seq.at(0);
    if (dimer[0] == 'X' || dimer[1] == 'X')
        dimer = "XX";

    arma::vec end_begin_bps_sigma = paramset.dimer_shapes.at(dimer);

    //at the start of sigma, for triple overlap:
    super_sigma.subvec(0,5) += end_begin_bps_sigma.subvec(12,17);
    //at the end of sigma, for triple overlap:
    super_sigma.subvec(12*(size-1), 12*(size-1)+11) += end_begin_bps_sigma.subvec(0,11);

    return arma::inv_sympd(K)*super_sigma; //inverse of pos. def. symm. matrix
    //return solve(K,super_sigma); //inverse of pos. def. symm. matrix
}

arma::vec utils::make_periodic_w_pentadiag (const std::string& seq, const Parameter_set& paramset, const arma::mat& K)
{
    int size = seq.size();
    arma::vec super_sigma = arma::zeros<arma::vec>(12*size);
    //add the bps shapes:
    for (size_t i = 0; i < size-1; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        std::string dimer = seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        super_sigma.subvec(12*i, 12*i+17) += paramset.dimer_shapes.at(dimer);
    }
    //add the bp shapes:
    for (size_t i = 0; i < size; ++i)
        super_sigma.subvec(12*i, 12*i+5) += paramset.monomer_shapes.at(seq.substr(i,1));

    //add extra bps:
    std::string dimer = "";
    dimer += seq.at(size-1);
    dimer += seq.at(0);
    if (dimer[0] == 'X' || dimer[1] == 'X')
        dimer = "XX";

    arma::vec end_begin_bps_sigma = paramset.dimer_shapes.at(dimer);

    //at the start of sigma, for triple overlap:
    super_sigma.subvec(0,5) += end_begin_bps_sigma.subvec(12,17);
    //at the end of sigma, for triple overlap:
    super_sigma.subvec(12*(size-1), 12*(size-1)+11) += end_begin_bps_sigma.subvec(0,11);

    int n = 2*size;
    //get everything in order
    auto A = std::vector<arma::mat::fixed<6,6>>(n);
    auto B = std::vector<arma::mat::fixed<6,6>>(n);
    auto C = std::vector<arma::mat::fixed<6,6>>(n);
    auto D = std::vector<arma::mat::fixed<6,6>>(n);
    auto E = std::vector<arma::mat::fixed<6,6>>(n);
    auto F = std::vector<arma::vec::fixed<6>>(n);
    auto X = std::vector<arma::vec::fixed<6>>(n);
    
    //std::cout << K << std::endl;
    A[0] = K.submat(0, 6*(n-2),5, 6*(n-2)+5);
    //std::cout << A[0] << std::endl;
    
    A[1] = arma::zeros<arma::mat>(6,6);
    B[0] = K.submat(0, 6*(n-1),5, 6*(n-1)+5);
    D[n-1] = B[0].t();
    E[n-1-1] = A[0].t();
    E[n-1] = arma::zeros<arma::mat>(6,6);

    //std::cout << "1" << std::endl;
    for (size_t i = 0; i < n-2; ++i)
        A[i+2] = K.submat(6*(i+2),6*(i), 6*(i+3)-1, 6*(i+1)-1);
    
    //std::cout << "2" << std::endl;
    for (size_t i = 0; i < n-1; ++i)
        B[i+1] = K.submat(6*(i+1),6*(i), 6*(i+2)-1, 6*(i+1)-1);

    //std::cout << "3" << std::endl;
    for (size_t i = 0; i < n; ++i)
        C[i] = K.submat(6*i, 6*i, 6*(i+1)-1, 6*(i+1)-1);

    //std::cout << "4" << std::endl;
    for (size_t i = 1; i < n; ++i)
        D[i-1] = B[i].t();
    //std::cout << "5" << std::endl;
    for (size_t i = 2; i < n; ++i)
        E[i-2] = A[i].t();

    //std::cout << "6" << std::endl;
    for (size_t i = 0; i < n; ++i)
        F[i] = super_sigma.subvec(6*i, 6*(i+1)-1);

    //std::cout << "7" << std::endl;
    //std::cout << "D" << std::endl;
    //for (size_t i = 0; i < n; ++i)
    //    std::cout << D[i] << std::endl;

    //std::cout << "E" << std::endl;
    //for (size_t i = 0; i < n; ++i)
    //    std::cout << E[i] << std::endl;
    double alp = 1.0;
    double bet = -1.0;
    double gam = 1.0;
    double del = -1.0;

    //Local arrays    
    //[m,m1,n]=size(A);
    arma::mat::fixed<6,6> T = arma::zeros<arma::mat>(6,6);
    arma::mat S = arma::eye<arma::mat>(12,12);
    arma::vec P = arma::zeros<arma::vec>(12);
    arma::mat B0 = B[0];
    //initialisation:
    C[0] = C[0] - (bet/alp)*D[n-1];
    D[0] = D[0] - (bet/alp)*E[n-1];
    B[1] = B[1] - (del/gam)*E[n-2];
    D[n-2] = D[n-2] - (gam/del)*A[1];    
    B[n-1] = B[n-1] - (alp/bet)*A[0];
    C[n-1] = C[n-1] - (alp/bet)*B[0];

    //factorisation:
    C[0] = arma::inv(C[0]);
    D[0] = C[0]*D[0];
    E[0] = C[0]*E[0];
    C[1] = arma::inv(C[1] - B[1]*D[0]);
    D[1] = C[1]*(D[1] - B[1]*E[0]);
    E[1] = C[1]*E[1];


    for (int i = 2; i < n; i++) {
        B[i] -= A[i]*D[i-2];
        C[i] = arma::inv(C[i] - B[i]*D[i-1] - A[i]*E[i-2]);
        if (i < n-1) {
            D[i] = C[i]*(D[i]-B[i]*E[i-1]);
        }
        if (i < n-2) {
            E[i] = C[i]*E[i];
        }
    }

    //Intermediate solution
    F[0] = C[0]*F[0];
    C[0] = C[0]/alp;
    B[0] = arma::zeros<arma::mat>(6,6);
    T = C[1];
    F[1] = T*(F[1] - B[1]*F[0]);
    C[1] = -T*(B[1]*C[0]);
    B[1] = T/gam;

    for (int i = 2; i < n; i++) {
        T = C[i];
        F[i] = T*(F[i] - B[i]*F[i-1] - A[i]*F[i-2]);
        C[i] =-T*(B[i]*C[i-1] + A[i]*C[i-2]);
        B[i] =-T*(B[i]*B[i-1] + A[i]*B[i-2]);
        if (i == n-1)
            C[i] += T/bet;
        if (i == n-2)
            B[i] += T/del;
    }

    //Back substitution
    F[n-2] -= D[n-2]*F[n-1];
    C[n-2] -= D[n-2]*C[n-1];
    B[n-2] -= D[n-2]*B[n-1];

    for (int i = n-3; i >= 0; i--) {
        F[i] = F[i] - D[i]*F[i+1] - E[i]*F[i+2];
        C[i] = C[i] - D[i]*C[i+1] - E[i]*C[i+2];
        B[i] = B[i] - D[i]*B[i+1] - E[i]*B[i+2];
    }
    //Solution of auxiliary system
    S.submat(0,0,5,5) = S.submat(0,0,5,5) + alp*(A[0]*C[n-2] + B0*C[n-1]) + bet*(D[n-1]*C[0] + E[n-1]*C[1]);
    S.submat(0,6,5,11) = alp*(A[0]*B[n-2] + B0*B[n-1]) + bet*(D[n-1]*B[0] + E[n-1]*B[1]);
    S.submat(6,0,11,5) = gam*A[1]*C[n-1] + del*E[n-2]*C[0];
    S.submat(6,6,11,11) = S.submat(6,6,11,11) + gam*A[1]*B[n-1] + del*E[n-2]*B[0];
    P.subvec(0,5) = alp*(A[0]*F[n-2] + B0*F[n-1]) + bet*(D[n-1]*F[0] + E[n-1]*F[1]);
    P.subvec(6,11) = gam*A[1]*F[n-1] + del*E[n-2]*F[0];
    P = arma::solve(S,P);

    //Final solution
    for (int i = 0; i < n; i++) {
        X[i] = F[i] - C[i]*P.subvec(0,5) - B[i]*P.subvec(6,11);
    }

    arma::vec sol = arma::zeros<arma::vec>(6*n);
    for (size_t i = 0; i < n; ++i) {
        sol.subvec(6*i,6*i+5) = X[i];
    }

    return sol;
}

arma::vec utils::make_w_conj_grad (const std::string& new_seq, const arma::vec& old_w, const Parameter_set& paramset, const arma::mat& new_K, const arma::mat& old_K)
{
    arma::vec old_super_sigma = old_K*old_w;
    arma::vec new_super_sigma = arma::zeros<arma::vec>(12*new_seq.size()-6);

    //add the bps shapes:
    for (size_t i = 0; i < new_seq.size()-1; ++i) {
        //IF either of the two monomers is uniform DNA, the dimer will act as if it's uniform DNA.
        std::string dimer = new_seq.substr(i,2);
        if (dimer[0] == 'X' || dimer[1] == 'X')
            dimer = "XX";

        new_super_sigma.subvec(12*i, 12*i+17) += paramset.dimer_shapes.at(dimer);
    }
    //add the bp shapes:
    for (size_t i = 0; i < new_seq.size(); ++i)
        new_super_sigma.subvec(12*i, 12*i+5) += paramset.monomer_shapes.at(new_seq.substr(i,1));

    //PERFORM CONJUGATE GRADIENT:
    //new_K = A
    //new_super_sigma = b
    //w = x
    //old_w = x_0
    arma::vec w = old_w;
    arma::vec r = new_super_sigma - new_K*w;
    arma::vec p = r;
    double res_old = arma::dot(r,r);
    for (int i = 0; i < 3*new_super_sigma.size(); i++) {
        double alpha = res_old/(arma::dot(p, new_K*p));
        w = w + alpha*p;
        r = r - alpha*new_K*p;
        double res_new = arma::dot(r,r);
        //std::cout << res_new << std::endl;
        if (res_new < 1e-20) {
            //std::cout << "breaking after residue hits limit" << std::endl;
            break;
        }
        p = r + (res_new/res_old)*p;
        res_old = res_new;
    }

    return w;
}

arma::mat utils::make_rigid_bp_K (const std::string& seq, const Parameter_set& paramset)
{
    arma::mat K = make_K(seq, paramset);

    //invert it, take marginal
    arma::mat K_inv = K.i();
    arma::mat K_inter = arma::zeros<arma::mat>(6*(seq.size()-1), 6*(seq.size()-1));
    for (int i = 0; i < seq.size()-1; ++i) {
        K_inter.submat(6*i, 6*i, 6*i+5, 6*i+5) = K_inv.submat(12*i+6, 12*i+6, 12*i+11, 12*i+11);
    }
    K_inter = K_inter.i();

    return K_inter;
}

arma::vec utils::make_rigid_bp_w (const std::string& seq, const Parameter_set& paramset, const arma::mat& K)
{
    arma::vec w = make_w(seq, paramset, K);
    arma::vec inter_w_hat = arma::zeros<arma::vec>(6*(seq.size()-1));
    //strip stuff you don't need
    for (int i = 0; i < seq.size()-1; ++i) {
        inter_w_hat.subvec(6*i, 6*i+5) = w.subvec(12*i+6, 12*i+11);
    }

    return inter_w_hat;
}

//================================================================================
//  Construct ground state
//================================================================================

rbDNA utils::construct_configuration (const std::string& seq, const arma::vec& w) 
{
    rbDNA dna = rbDNA(seq);
    std::vector<arma::mat33> D;
    std::vector<arma::mat33> Dc;
    std::vector<arma::vec3> r;
    std::vector<arma::vec3> rc;

    //coordinates of the first basepair:
    arma::mat33 G = arma::eye<arma::mat>(3,3);
    arma::vec3 q = arma::zeros<arma::vec>(3);

    int size = seq.size();//(w.n_elem+6)/12;

    for (int i = 0; i < size; ++i) {
        //coords of next basepair:
        arma::mat33 R = utils::rot_mat(w.subvec(12*i,12*i+2));
        arma::vec3 Gw = G*w.subvec(12*i+3, 12*i+5);

        //coords of compl. strand:
        Dc.push_back(G*utils::half_rot_mat(R).t());
        rc.push_back(q - 0.5*Gw);

        //coords of main strand:
        D.push_back(Dc.at(i)*R);
        r.push_back(rc.at(i) + Gw);

        if (i < size-1) {
            arma::mat33 ru = rot_mat(w.subvec(12*i+6,12*i+8));
            arma::mat33 H = G*half_rot_mat(ru);
            //for next base pair:
            G = G*ru;
            q = q + H*w.subvec(12*i+9,12*i+11);
        }
    }
    for (int i = 0; i < size; ++i) {
        dna.R(i) = D.at(i);
        dna.Rc(i) = Dc.at(i);
        dna.r(i) = r.at(i);
        dna.rc(i) = rc.at(i);
    }

    //std::cout << "Sizes in construct_configuration: " << std::endl;
    //std::cout << "seq: " << seq.size() << std::endl;
    //std::cout << "D: " << D.size() << std::endl;
    //std::cout << "Dc: " << Dc.size() << std::endl;
    //std::cout << "r: " << r.size() << std::endl;
    //std::cout << "rc: " << rc.size() << std::endl;
    assert(D.size() == Dc.size());
    assert(Dc.size() == r.size());
    assert(r.size() == rc.size());
    assert(rc.size() == seq.size());

    return dna;
}

rbDNA utils::construct_circle (const std::string& seq, double winding_number) 
{
    double outer = seq.size()*3.4; //nm
    double radius = outer/(2*arma::datum::pi);

    rbDNA dna = rbDNA(seq);
    std::vector<arma::mat33> D;
    std::vector<arma::mat33> Dc;
    std::vector<arma::vec3> r;
    std::vector<arma::vec3> rc;

    std::vector<arma::mat33> G;
    std::vector<arma::vec3> q;

    double angle_step = 3.4/radius;

    arma::mat R_x = {{1,0,0},
        {0,std::cos(2*arma::datum::pi/winding_number), -std::sin(2*arma::datum::pi/winding_number)},
                  {0,std::sin(2*arma::datum::pi/winding_number), std::cos(2*arma::datum::pi/winding_number)}};

    arma::mat R_z = {
        {std::cos(-2*arma::datum::pi*winding_number), -std::sin(-2*arma::datum::pi*winding_number),0},
                  {std::sin(-2*arma::datum::pi*winding_number), std::cos(-2*arma::datum::pi*winding_number),0},
                  {0,0,1}};

    arma::mat R_pos = {{std::cos(angle_step), std::sin(angle_step), 0},
                  {-std::sin(angle_step), std::cos(angle_step), 0},
                  {0,0,1}};
    arma::vec point = {radius, 0, 0};
    arma::mat orientation = arma::eye(3,3);

    arma::vec3 d1 = {1.0, 0.0, 0.0};
    arma::vec3 d2 = {0.0, 1.0, 0.0};
    arma::vec3 d3 = {0.0, 0.0, 1.0};

    //q.push_back(point);
    //G.push_back(orientation);
    point = R_pos*point;
    //orientation = R_pos*orientation;
    for (int i = 0; i < seq.size(); i++) {
        q.push_back(point);
        //arma::mat33 d = arma::zeros<arma::mat>(3,3);
        d1 = arma::normalise(point);
        d2 = {0.0,0,1.0};
        d3 = arma::cross(d1,d2);
        arma::mat local_or = {{d1[0],d2[0],d3[0]},
                                {d1[1],d2[1],d3[1]},
                                {d1[2],d2[2],d3[2]}};


        double angle = 1.0;
        for (int j = 0; j < i; j++)
            angle += arma::datum::pi/4;

        double factor = (1-std::cos(angle));
        double A00 = factor*d3[0]*d3[0] + std::cos(angle);
        double A01 = factor*d3[0]*d3[1] - d3[2]*std::sin(angle);
        double A02 = factor*d3[0]*d3[2] + d3[1]*std::sin(angle);
        double A10 = factor*d3[1]*d3[0] + d3[2]*std::sin(angle);
        double A11 = factor*d3[1]*d3[1] + std::cos(angle);
        double A12 = factor*d3[1]*d3[2] - d3[0]*std::sin(angle);
        double A20 = factor*d3[2]*d3[0] - d3[1]*std::sin(angle);
        double A21 = factor*d3[2]*d3[1] + d3[0]*std::sin(angle);
        double A22 = factor*d3[2]*d3[2] + std::cos(angle);

        arma::mat rotation = {{A00, A01, A02},
                              {A10, A11, A12},
                              {A20, A21, A22}};

        //    rotation *= R_x;
        G.push_back(rotation*local_or);
        
        point = R_pos*point;
        orientation = R_z*orientation;
    }

    for (int i = 0; i < seq.size(); ++i) {
        dna.R(i) = G.at(i);
        dna.Rc(i) = G.at(i);
        dna.r(i) = q.at(i);
        dna.rc(i) = q.at(i);
    }

    return dna;
}

//================================================================================
//  Rotation matrices, midframes, and DOFs
//================================================================================

arma::vec6 utils::degrees_of_freedom (const arma::mat33& R, const arma::mat33& Rc,
                                      const arma::vec3& r, const arma::vec3& rc)
{
    //arma::vec dof_vec(6);
    arma::vec6 dof_vec;

    //Compute the relative rotation matrix and corresponding rotation axis:
    arma::mat33 Rot_rel = utils::relative_rot_mat(R, Rc);
    arma::vec3 rot_vec = utils::rot_axis(Rot_rel);

    //Get the rotational DOF:
    dof_vec.subvec(0,2) = rot_vec;

    //Get the midframe orientation:
    arma::mat33 midframe = utils::midframe_or(R,Rc);

    //Get the translational DOF:
    dof_vec.subvec(3,5) = midframe.t()*(r - rc);

    return dof_vec;
}

/*
//old one: Curves+ coordinates
arma::mat utils::rot_mat (const arma::vec& theta)
{
    arma::mat Rot(3,3);

    double Th = arma::norm(theta,2);
    double Th_2 = pow(Th, 2);
    double cos_Th = cos(Th);
    double sin_Th = sin(Th);

    //if (Th > M_PI-0.00000000001)
    //    throw std::invalid_argument("rot axis: sin(theta) >= pi");

    if (Th < 0.00000000001 && Th > 0.00000000000) {
        //return arma::eye(3,3);
        throw std::invalid_argument("Theta == 0");
    } else if (Th > 0.00000000001) {
        Rot(0,0) = cos_Th + (1-cos_Th)*pow((theta(0)/Th), 2);
        Rot(0,1) = (1-cos_Th)*(theta(0)*theta(1))/Th_2 - sin_Th*theta(2)/Th;
        Rot(0,2) = (1-cos_Th)*(theta(0)*theta(2))/Th_2 + sin_Th*theta(1)/Th;

        Rot(1,0) = (1-cos_Th)*(theta(0)*theta(1))/Th_2 + sin_Th*theta(2)/Th;
        Rot(1,1) = cos_Th + (1-cos_Th) * pow((theta(1)/Th), 2);
        Rot(1,2) = (1-cos_Th)*(theta(1)*theta(2))/Th_2 - sin_Th*theta(0)/Th;
    
        Rot(2,0) = (1-cos_Th)*(theta(0)*theta(2))/Th_2 - sin_Th*theta(1)/Th;
        Rot(2,1) = (1-cos_Th)*(theta(1)*theta(2))/Th_2 + sin_Th*theta(0)/Th;
        Rot(2,2) = cos_Th + (1-cos_Th)*pow((theta(2)/Th), 2);
    }

    return Rot;
}
*/

// slow one:
/*
arma::mat utils::rot_mat (const arma::vec& theta)
{
    arma::mat Rot(3,3);
    double alpha = 0.2; //for dimensionless coordinates: same as matlab scripts: suchs that 0.5*X below is X in matlab scripts
    arma::vec atheta = alpha*theta;
    double Th = arma::norm(atheta);

    //std::cout << "norm(theta) = " << Th << std::endl;
    //if (Th > M_PI-0.00000000001)
        //throw std::invalid_argument("rot axis: sin(theta) >= pi");

    if (Th < 0.00000000001 && Th > 0.00000000000) {
        throw std::invalid_argument("Theta == 0");
    } else if (Th > 0.00000000001) {
        arma::mat I = arma::eye<arma::mat>(3,3) ;

        //create an antisymmetric matrix:
        arma::mat X = {{         0, -atheta(2),  atheta(1)},
                       { atheta(2),          0, -atheta(0)},
                       {-atheta(1),  atheta(0),         0}};

        Rot = (I+0.5*X)*(I-0.5*X).i();
    }

    return Rot;
}
*/

//fast one:
arma::mat33 utils::rot_mat (const arma::vec3& theta)
{
    arma::mat33 Rot;
    arma::vec3 atheta = 0.2*theta; //for dimensionless coordinates: same as matlab scripts
    double Th = arma::norm(atheta);

    //std::cout << "norm(theta) = " << Th << std::endl;
    //if (Th > M_PI-0.00000000001)
        //throw std::invalid_argument("rot axis: sin(theta) >= pi");

    if (Th < 0.00000000001 && Th > 0.000000000000) {
        throw std::invalid_argument("Theta == 0 in rot_mat(rot_vec)");
    } else {//if (Th > 0.00000000001) {
        arma::mat33 I = arma::eye<arma::mat>(3,3) ;

        //create an antisymmetric matrix:
        arma::mat33 X = {{         0, -atheta(2),  atheta(1)},
                       { atheta(2),          0, -atheta(0)},
                       {-atheta(1),  atheta(0),         0}};

        Rot = I + (4.0/(4.0+Th*Th))*(X + 0.5*X*X);
    }

    return Rot;
}

//fast one 
arma::mat33 utils::half_rot_mat (const arma::mat33& R)
{
    arma::vec3 rot_axis = utils::rot_axis(R);
    double nrm = 0.2*arma::norm(rot_axis); //factor 1/5 in front for nondimensionalisation: produces same output as matlab now

    arma::vec3 half_rot_axis = (2.0/(2.0+ sqrt(nrm*nrm + 4.0)))*rot_axis;

    return utils::rot_mat(half_rot_axis);
}

//slow one
/*
arma::mat utils::half_rot_mat (const arma::mat& R)
{
    double det = arma::det(R);
    if (det > -0.000000001 && det < 0.0000000001) {
        std::cerr << "R is singular. Abort for now." << std::endl;
        exit(1);
    }

    return arma::real(arma::sqrtmat(R));
}
*/

arma::mat33 utils::relative_rot_mat (const arma::mat33& R, const arma::mat33& Rc)
{
    return Rc.t()*R; //left operating; this is the Lambda in the paper
}

/*
//old one: curves+ coordinates
arma::vec utils::rot_axis (const arma::mat& Rot_mat)
{
    double rot_angle = acos(0.5*(arma::trace(Rot_mat)-1.0));

    if (rot_angle > M_PI-0.00000000001)
        throw std::invalid_argument("rot axis: sin(theta) >= pi");

    //OPTIMISATION: throw out sin function, is slow
    if (sin(rot_angle) < 0.00000000001 && sin(rot_angle) > 0.0000000000) {
        throw std::invalid_argument("Theta == 0");
    }

    double frac = 0.5*rot_angle / sin(rot_angle);
    arma::vec theta(3);
    theta(0) = frac*(Rot_mat(2,1)-Rot_mat(1,2));
    theta(1) = frac*(Rot_mat(0,2)-Rot_mat(2,0));
    theta(2) = frac*(Rot_mat(1,0)-Rot_mat(0,1));

    return theta;
}
*/

//new one: dimenionless coords
arma::vec3 utils::rot_axis (const arma::mat33& Rot_mat)
{
    double Tr = arma::trace(Rot_mat);
    //WILL BE CAUGHT IN THE APROPRIATE PLACE BY ROT_MAT! 
    /*
    if (Tr > -1.000000000001 && Tr < -0.9999999999999) {
        throw std::invalid_argument("rot axis: sin(theta) == pi");
    }
    */

    double frac = 10.0/(Tr + 1.0); //To get this nondim prefactor, multiply the 2.0 by 5.0
    //arma::vec theta(3);
    arma::vec3 theta;
    theta(0) = frac*(Rot_mat(2,1)-Rot_mat(1,2));
    theta(1) = frac*(Rot_mat(0,2)-Rot_mat(2,0));
    theta(2) = frac*(Rot_mat(1,0)-Rot_mat(0,1));

    return theta;
}

arma::mat33 utils::midframe_or (const arma::mat33& R, const arma::mat33& Rc)
{
    arma::mat33 rot_rel = utils::relative_rot_mat(R, Rc);
    arma::mat33 half_rot_mat = utils::half_rot_mat(rot_rel);

    return Rc*half_rot_mat;
}


arma::vec3 utils::midframe_pos (const arma::vec3& r, const arma::vec3& rc)
{
    return 0.5*(r + rc);
}

arma::mat33 utils::orthonormalise_coord_system (const arma::mat33& D, int first)
{
    arma::vec u_0 = D.col(first);
    arma::vec u_1 = D.col((first+1)%3) - proj(u_0, D.col((first+1)%3));
    arma::vec u_2 = D.col((first+2)%3) - proj(u_0, D.col((first+2)%3)) - proj(u_1, D.col((first+2)%3));

    arma::mat33 D_ortho;
    D_ortho.col(first) = u_0/norm(u_0);
    D_ortho.col((first+1)%3) = u_1/norm(u_1);
    D_ortho.col((first+2)%3) = u_2/norm(u_2);

    return D_ortho;
}

arma::vec3 utils::proj (const arma::vec3& u, const arma::vec3& v)
{
    return (arma::dot(u,v)/arma::dot(u,u))*u;
}
