#include "DNA_IO.hpp"

//=====================================================================
//  Parameter set reading
//=====================================================================

Parameter_set DNA_IO::read_paramset (const std::string& filename)
{
    Parameter_set paramset;

    paramset.monomer_stiffnesses = read_bp_stiffness_matrices(filename);
    paramset.monomer_shapes      = read_bp_dimless_shape_vectors(filename);
    paramset.dimer_stiffnesses   = read_bps_stiffness_matrices(filename);
    paramset.dimer_shapes        = read_bps_dimless_shape_vectors(filename);

    return paramset;
}

std::unordered_map<std::string, arma::mat> DNA_IO::read_bp_stiffness_matrices (const std::string& filename)
{
    std::ifstream parameter_file;
    
    parameter_file.open (filename);
    if (!parameter_file.is_open()) {
        std::cout << "Error reading stiffness matrices for bp. File " << filename << " couldn't be opened." << std::endl;
        exit(1);
    }
    std::unordered_map<std::string, arma::mat> dict;
	
    std::vector<std::string> monomers = {"A", "C", "G", "T"};
    for (auto& base : monomers) { 
        std::string line = "";
        while (line != base) {
            std::getline(parameter_file, line);
        }
        //Then start reading the parameters:
        std::stringstream ss;
        arma::mat monomer_stiffness = arma::zeros(6,6);
        for (int i = 0; i < 6; ++i) {
            std::getline(parameter_file, line);
            ss << line;
            for (int j = 0; j < 6; ++j) {
                ss >> monomer_stiffness(i, j);
            }
        }
        dict.insert({base, monomer_stiffness});
    }

    parameter_file.close();
    
    return dict;
}

/*
std::unordered_map<std::string, arma::mat> DNA_IO::read_bps_stiffness_matrices (const std::string& filename)
{
    std::ifstream parameter_file;
    
    parameter_file.open (filename);
    if (!parameter_file.is_open()) {
        std::cout << "Error reading stiffness matrices for bp step. File " << filename << " couldn't be opened." << std::endl;
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    std::unordered_map<std::string, arma::mat> dict;
    std::vector<std::string> dimers = {"AA", "AC", "AG", "AT",
                                       "CA", "CC", "CG", "CT",
                                       "GA", "GC", "GG", "GT",
                                       "TA", "TC", "TG", "TT"};
    for (auto& bps : dimers) { 
        //Start reading the parameters:
        std::string line = "";
        while (line != bps) {
            std::getline(parameter_file, line);
        }
        arma::mat dimer_stiffness = arma::zeros(18,18);
        std::stringstream ss;
        for (int i = 0; i < 18; ++i) {
            std::getline(parameter_file, line);
            ss << line;
            for (int j = 0; j < 18; ++j)
                ss >> dimer_stiffness(i, j);
        }
        dict.insert({bps, dimer_stiffness});
    }

    parameter_file.close();
    
    return dict;
}
*/
std::unordered_map<std::string, arma::vec> DNA_IO::read_bp_dimless_shape_vectors (const std::string& filename)
{
    std::ifstream parameter_file;

    parameter_file.open (filename);
    if (!parameter_file.is_open()) {
        std::cout << "Error reading sigma vectors for bp. File " << filename << " couldn't be opened." << std::endl;
        exit(1);
    }

    std::unordered_map<std::string, arma::vec> dict;
	
    std::vector<std::string> monomers = {"A", "C", "G", "T"};
    for (auto& base : monomers) { 
        std::string line = "";
        while (line != base) {
            std::getline(parameter_file, line);
        }
        
        //Start reading the parameters:
        std::stringstream ss;
        arma::vec monomer_shape = arma::zeros(6);
        //current line is bp name, following 6 lines are the stiffness matrix, then whitespace, then shape vector
        for (int z = 0; z < 7; ++z)
            std::getline(parameter_file, line);

        //Finally get the shape vector
        std::getline(parameter_file, line);
        ss << line;
        for (int i = 0; i < 6; ++i)
            ss >> monomer_shape(i);

        dict.insert({base, monomer_shape});
    }

    parameter_file.close();

    return dict;
}

/*
std::unordered_map<std::string, arma::vec> DNA_IO::read_bps_dimless_shape_vectors (const std::string& filename)
{
    std::ifstream parameter_file;

    parameter_file.open (filename);
    if (!parameter_file.is_open()) {
        std::cout << "Error reading sigma vectors for bp step. File " << filename << " couldn't be opened." << std::endl;
        exit(1);
    }

    std::unordered_map<std::string, arma::vec> dict;
    std::vector<std::string> dimers = {"AA", "AC", "AG", "AT",
                                       "CA", "CC", "CG", "CT",
                                       "GA", "GC", "GG", "GT",
                                       "TA", "TC", "TG", "TT"};
    for (auto& bps : dimers) { 
        std::string line = "";
        while (line != bps) {
            std::getline(parameter_file, line);
        }
        //Start reading the parameters:
        arma::vec dimer_shape = arma::zeros(18);
        std::stringstream ss;
        //first line is bps name, following 18 lines are the stiffness matrix, then whitespace, then shape vector
        for (int z = 0; z < 19; ++z) {
            std::getline(parameter_file, line);
        }

        //Finally get the shape vector
        std::getline(parameter_file, line);
        ss << line;
        for (int i = 0; i < 18; ++i)
            ss >> dimer_shape(i);

        dict.insert({bps, dimer_shape});
    }
    parameter_file.close();

    return dict;
}
*/

Parameter_set_prime DNA_IO::read_paramset_prime (const std::string& filename)
{
    Parameter_set_prime paramset;

    paramset.dimer_stiffnesses_inner        = read_bps_stiffness_matrices(filename);
    paramset.dimer_shapes_inner             = read_bps_dimless_shape_vectors(filename);
    paramset.dimer_stiffnesses_outer_end1   = read_bps_stiffness_matrices(filename, "_end1");
    paramset.dimer_shapes_outer_end1        = read_bps_dimless_shape_vectors(filename, "_end1");
    paramset.dimer_stiffnesses_outer_end2   = read_bps_stiffness_matrices(filename, "_end2");
    paramset.dimer_shapes_outer_end2        = read_bps_dimless_shape_vectors(filename, "_end2");

    return paramset;
}

std::unordered_map<std::string, arma::mat> DNA_IO::read_bps_stiffness_matrices (const std::string& filename, const std::string& postfix)
{
    std::ifstream parameter_file;
    
    parameter_file.open (filename);
    if (!parameter_file.is_open()) {
        std::cout << "Error reading stiffness matrices for bp step. File " << filename << " couldn't be opened." << std::endl;
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    std::unordered_map<std::string, arma::mat> dict;
    std::vector<std::string> dimers = {"AA", "AC", "AG", "AT",
                                       "CA", "CC", "CG", "CT",
                                       "GA", "GC", "GG", "GT",
                                       "TA", "TC", "TG", "TT"};

    //add the postfix to the dimers so it can read prime paramsets
    for (auto& d : dimers) {
        d += postfix;
    }

    for (auto& bps : dimers) { 
        //Start reading the parameters:
        std::string line = "";
        while (line != bps) {
            std::getline(parameter_file, line);
        }
        arma::mat dimer_stiffness = arma::zeros(18,18);
        std::stringstream ss;
        for (int i = 0; i < 18; ++i) {
            std::getline(parameter_file, line);
            ss << line;
            for (int j = 0; j < 18; ++j)
                ss >> dimer_stiffness(i, j);
        }
        dict.insert({bps.substr(0,2), dimer_stiffness});
    }

    parameter_file.close();
    
    return dict;
}

std::unordered_map<std::string, arma::vec> DNA_IO::read_bps_dimless_shape_vectors (const std::string& filename, const std::string& postfix)
{
    std::ifstream parameter_file;

    parameter_file.open (filename);
    if (!parameter_file.is_open()) {
        std::cout << "Error reading sigma vectors for bp step. File " << filename << " couldn't be opened." << std::endl;
        exit(1);
    }

    std::unordered_map<std::string, arma::vec> dict;
    std::vector<std::string> dimers = {"AA", "AC", "AG", "AT",
                                       "CA", "CC", "CG", "CT",
                                       "GA", "GC", "GG", "GT",
                                       "TA", "TC", "TG", "TT"};

    //add the postfix to the dimers so it can read prime paramsets
    for (auto& d : dimers) {
        d += postfix;
    }

    for (auto& bps : dimers) { 
        std::string line = "";
        while (line != bps) {
            std::getline(parameter_file, line);
        }
        //Start reading the parameters:
        arma::vec dimer_shape = arma::zeros(18);
        std::stringstream ss;
        //first line is bps name, following 18 lines are the stiffness matrix, then whitespace, then shape vector
        for (int z = 0; z < 19; ++z) {
            std::getline(parameter_file, line);
        }

        //Finally get the shape vector
        std::getline(parameter_file, line);
        ss << line;
        for (int i = 0; i < 18; ++i)
            ss >> dimer_shape(i);

        dict.insert({bps.substr(0,2), dimer_shape});
    }
    parameter_file.close();

    return dict;
}

//=============================================================================
//  Reading of DNA data
//=============================================================================

//TODO TEST
std::unordered_map<int, coupled_condition> DNA_IO::read_binding_sites (const std::string& filename)
{
    std::ifstream binding_site_file;
    binding_site_file.open(filename);
    if (!binding_site_file.is_open()) {
        std::cout << "Error reading in binding sites. File " << filename << " couldn't be opened." << std::endl;
    }

    std::unordered_map<int, coupled_condition> binding_sites;

    int bound_index;

    for (int i = 0; i < 14; ++i) {
        binding_site_file >> bound_index;
        
        coupled_condition condW1 = {bound_index-1, base_Crick, position, bound_index, base_Crick};
        coupled_condition condW2 = {bound_index, base_Crick, position, bound_index-1, base_Crick};
        binding_sites.insert({bound_index-1, condW1});
        binding_sites.insert({bound_index, condW2});

        binding_site_file >> bound_index;
        
        coupled_condition condC1 = {bound_index-1, base_Watson, position, bound_index, base_Watson};
        coupled_condition condC2 = {bound_index, base_Watson, position, bound_index-1, base_Watson};
        binding_sites.insert({bound_index-1, condC1});
        binding_sites.insert({bound_index, condC2});
    }

    binding_site_file.close();

    return binding_sites;
}

arma::mat DNA_IO::read_nucleosome_orientation (const std::string& filename)
{
    std::ifstream config_file;
    double readin_var;

    arma::mat nucleosome_or = arma::zeros(3,3);

    config_file.open (filename);
    if (!config_file.is_open()) {
        std::cout << "Error reading nucleosome orientation. File " << filename << " couldn't be opened." << std::endl;
        exit(1);
    }
    
    for (int i = 0; i < 3; ++i) {
    	config_file >> readin_var;
    	nucleosome_or(i,0) = readin_var;
    }
    
    for (int i = 0; i < 3; ++i) {
    	config_file >> readin_var;
    	nucleosome_or(i,1) = readin_var;
    }
    
    for (int i = 0; i < 3; ++i) {
    	config_file >> readin_var;
    	nucleosome_or(i,2) = readin_var;
    }
    
    config_file.close();
    
    return nucleosome_or;
}

//TODO test
std::string DNA_IO::read_sequence (const std::string& filename, int from_pos_in_file, int amount)
{
    std::ifstream sequence_file;
    sequence_file.open(filename);
    if (!sequence_file.is_open()) {
        std::cout << "Error reading sequence. File " << filename << " couldn't be opened." << std::endl;
    }

    std::string seq = "";

    char readin_var;
    for (int i = 0; i < from_pos_in_file; ++i) {
        if (sequence_file.eof()) {
            std::cout << "Code file end reached! Exiting." << std::endl;
            std::exit(1);
        }
        sequence_file >> readin_var;
    }

    for (int i = 0; i < amount; ++i) {
        if (sequence_file.eof()) {
            std::cout << "Code file end reached! Exiting." << std::endl;
            std::exit(1);
        }

        sequence_file >> readin_var;
        if (readin_var == 'A' || readin_var == 'a')
            seq.push_back('A');
        else if (readin_var == 'C' || readin_var == 'c')
            seq.push_back('C');
        else if (readin_var == 'G' || readin_var == 'g')
            seq.push_back('G');
        else if (readin_var == 'T' || readin_var == 't')
            seq.push_back('T');
    }

    sequence_file.close();

    return seq;
}

/*
 * OLD
std::vector<arma::vec> DNA_IO::read_bp_positions (const std::string& filename)
{
    std::ifstream config_file;
    double readin_var;
    
    config_file.open(filename);
    if (!config_file.is_open()) {
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    std::vector<double> fields;
    std::vector<arma::vec> positions;
    //get the number of lines
    std::string line;
    std::stringstream ss;
    if (!std::getline(config_file, line)) {
        std::cout << " Could not read file with name " << filename << "." << std::endl;
        exit(1);
    }
    while (ss >> readin_var)
        fields.push_back(readin_var);

    //int N_bp = fields.size()/13;
    int field_size = static_cast<int>(fields.size());

    for (int i = 0; i < field_size; i+=13) {
        positions.push_back(arma::vec(3));
        positions.back()(0) = fields.at(i);
        positions.back()(1) = fields.at(i+1);
        positions.back()(2) = fields.at(i+2);
    }
    config_file.close();

    return positions;
}

std::vector<arma::mat> DNA_IO::read_bp_orientations (const std::string& filename)
{
    std::ifstream config_file;
    double readin_var;
    
    config_file.open(filename);
    if (!config_file.is_open()) {
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    std::vector<double> fields;
    std::vector<arma::mat> orientations;
    //get the number of lines
    std::string line;
    std::stringstream ss;
    if (!std::getline(config_file, line)) {
        std::cout << " Could not read file with name " << filename << "." << std::endl;
        exit(1);
    }
    while (ss >> readin_var)
        fields.push_back(readin_var);

    //int N_bp = fields.size()/13;
    int field_size = static_cast<int>(fields.size());

    for (int i = 0; i < field_size; i+=13) {
        orientations.push_back(arma::mat(3,3));
        orientations.back()(0,0) = fields.at(i+3);
        orientations.back()(1,0) = fields.at(i+4);
        orientations.back()(2,0) = fields.at(i+5);
        orientations.back()(0,1) = fields.at(i+6);
        orientations.back()(1,1) = fields.at(i+7);
        orientations.back()(2,1) = fields.at(i+8);
        orientations.back()(0,2) = fields.at(i+9);
        orientations.back()(1,2) = fields.at(i+10);
        orientations.back()(2,2) = fields.at(i+11);
    }
    config_file.close();

    return orientations;
}
*/

//TODO TEST
rbDNA DNA_IO::read_dna_configuration (const std::string& old_seq, const std::string& filename, int from_pos_in_file)
{
    rbDNA tmpDNA;
    int size = old_seq.size();
    for (int i = 0; i < size; i++)
        tmpDNA.push_back(old_seq.at(i));

    std::ifstream config_file;
    double readin_var;
    std::string line;
    
    //Check if possible to open the file:
    config_file.open(filename);
    if (!config_file.is_open()) {
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    //Check if possible to skip the first number of lines in the file:
    for (int i = 0; i < from_pos_in_file; ++i) {
        if (!std::getline(config_file, line)) {
            std::cout << "Could not read file with name " << filename << "." << std::endl;
            exit(1);
        }
    }

    std::vector<double> fields;
    //get the number of lines
    std::stringstream ss;
    for (int i = 0; i < size; ++i) {
        if (!std::getline(config_file, line)) {
            std::cout << "Could not read file with name " << filename << "." << std::endl;
            exit(1);
        }
        ss << line;
        while (ss >> readin_var)
            fields.push_back(readin_var);

        arma::mat D = {{fields[0], fields[3], fields[6]},
                       {fields[1], fields[4], fields[7]},
                       {fields[2], fields[5], fields[8]}};

        arma::vec r = {fields[9], fields[10], fields[11]};

        arma::mat Dc = {{fields[12], fields[15], fields[18]},
                        {fields[13], fields[16], fields[19]},
                        {fields[14], fields[17], fields[20]}};

        arma::vec rc = {fields[21], fields[22], fields[23]};

        tmpDNA.R(i) = D;
        tmpDNA.Rc(i) = Dc;
        tmpDNA.r(i) = r;
        tmpDNA.rc(i) = rc;
    }
    config_file.close();

    return tmpDNA;
}

//TODO TEST
rbDNA DNA_IO::read_dna_configuration_fra (const std::string& old_seq, const std::string& filename)
{
    std::cout << "Reading .fra file" << std::endl;
    rbDNA tmpDNA;
    int size = old_seq.size();
    for (int i = 0; i < size; i++)
        tmpDNA.push_back(old_seq.at(i));

    std::ifstream config_file;
    int readin_var;
    std::string line;
    
    //Check if possible to open the file:
    config_file.open(filename);
    if (!config_file.is_open()) {
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    //get the data:
    for (int i = 0; i < 2*size; ++i) {
        std::stringstream ss;
        std::vector<double> fields;
        if (!std::getline(config_file, line)) {
            std::cout << "Could not read file with name " << filename << "." << std::endl;
            exit(1);
        }
        ss << line;
        //while (ss >> readin_var) {
        for (int j = 0; j < 14; j++) {
            ss >> readin_var;
            //std::cout << "readin_var:" << readin_var << std::endl;
            fields.push_back(static_cast<double>(readin_var));
        }

        //std::cout << "fields length: " << fields.size() << std::endl;
        //std::cout << "putting in matrix/vector:"  << std::endl;
        arma::mat D = {{fields[2]/1e3, fields[5]/1e3, fields[8]/1e3},
                       {fields[3]/1e3, fields[6]/1e3, fields[9]/1e3},
                       {fields[4]/1e3, fields[7]/1e3, fields[10]/1e3}};

        arma::vec r = {fields[11]/1e3, fields[12]/1e3, fields[13]/1e3};

        if (static_cast<int>(fields[0]) == 1) {
            tmpDNA.R(static_cast<int>(fields[1])-1) = utils::orthonormalise_coord_system(D,0);
            tmpDNA.r(static_cast<int>(fields[1])-1) = r;
        } else if (static_cast<int>(fields[0]) == 2) {
            arma::mat diag = arma::eye(3,3);
            diag(1,1) = -1.0;
            diag(2,2) = -1.0;
            tmpDNA.Rc(static_cast<int>(fields[1])-1) = utils::orthonormalise_coord_system(D*diag,0);
            tmpDNA.rc(static_cast<int>(fields[1])-1) = r;
        }
    }
    config_file.close();

    return tmpDNA;
}

//TODO test: NOT GOOD??!!
rbDNA DNA_IO::read_dna_configuration_shapes (const std::string& old_seq, const std::string& filename)
{
    std::cout << "Reading shapes file" << std::endl;
    int size = old_seq.size();

    std::ifstream config_file;
    int readin_var;
    std::string line;
    
    //Check if possible to open the file:
    config_file.open(filename);
    if (!config_file.is_open()) {
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    arma::vec shapes = arma::zeros<arma::vec>(12*size-6);
    //get the data:
    for (int i = 0; i < 12*size-6; ++i) {
        std::stringstream ss;
        if (!std::getline(config_file, line)) {
            std::cout << "Could not read file with name " << filename << "." << std::endl;
            exit(1);
        }
        ss << line;
        ss >> readin_var;
        shapes(i) = static_cast<double>(readin_var);
    }
    config_file.close();

    return utils::construct_configuration(old_seq, shapes);
}

//RETURNS PHOSPHATES DISGUISED AS DNA!!
rbDNA DNA_IO::read_phosphate_configurations_pfra (const std::string& filename)
{
    std::cout << "Reading .pfra file" << std::endl;
    rbDNA phosphates;
    int size = 147;
    for (int i = 0; i < size; i++)
        phosphates.push_back('A');

    std::ifstream config_file;
    int readin_var;
    std::string line;
    
    //Check if possible to open the file:
    config_file.open(filename);
    if (!config_file.is_open()) {
        std::cout << filename << " not opened." << std::endl;
        exit(1);
    }

    //get the data:
    for (int i = 0; i < 2*size-2; ++i) {
        std::stringstream ss;
        std::vector<double> fields;
        if (!std::getline(config_file, line)) {
            std::cout << "Could not read file with name " << filename << "." << std::endl;
            exit(1);
        }
        ss << line;
        for (int j = 0; j < 14; j++) {
            ss >> readin_var;
            std::cout << readin_var << "\t";
            fields.push_back(static_cast<double>(readin_var));
        }
        std::cout << std::endl;

        arma::mat D = {{fields[2]/1e3, fields[5]/1e3, fields[8]/1e3},
                       {fields[3]/1e3, fields[6]/1e3, fields[9]/1e3},
                       {fields[4]/1e3, fields[7]/1e3, fields[10]/1e3}};

        arma::vec r = {fields[11]/1e3, fields[12]/1e3, fields[13]/1e3};
        //std::cout << r << std::endl;

        if (static_cast<int>(fields[1]) == 1) {
            phosphates.R(static_cast<int>(fields[0])-2) = utils::orthonormalise_coord_system(D,0);
            phosphates.r(static_cast<int>(fields[0])-2) = r;
        } else if (static_cast<int>(fields[1]) == 2) {
            arma::mat diag = arma::eye(3,3);
            diag(1,1) = -1.0;
            diag(2,2) = -1.0;
            phosphates.Rc(static_cast<int>(fields[0])-1) = utils::orthonormalise_coord_system(D*diag,0);
            phosphates.rc(static_cast<int>(fields[0])-1) = r;
        }
    }
    config_file.close();

    return phosphates;
}

//=============================================================================
//  Setting output data
//=============================================================================

void DNA_IO::set_output_format (output_format_t of)
{
    output_format = of;
}

void DNA_IO::set_output (const std::initializer_list<output_t>& out)
{
    outputs.clear();

    bool energy_output = false;
    bool nuc_or_output = false;

    for (auto& o : out) {
        if (o == energy)
            energy_output = true;
        else if (o == nucleosome_orientation)
            nuc_or_output = true;
        else
            outputs.push_back(o);
    }
    //put energy and nucl. orientation last, since you have only one of those per measurement, while there's a lot of bp's.
    if (energy_output)
        outputs.push_back(energy);
    if (nuc_or_output)
        outputs.push_back(nucleosome_orientation);
}

void DNA_IO::add_output (output_t new_output)
{
    //check if in there already:
    for (auto& o : outputs) {
        if (o == new_output)
            return;
    }

    //if not, add it
    if (new_output == energy || new_output == nucleosome_orientation)
        outputs.push_back(new_output);

    //Do some acrobatics if the energy or the nucl. orientation is already in there:
    bool energy_available = false;
    bool nuc_or_available = false;
    for (int i = 0; i < 2; ++i) {
        if (outputs.size() > 0 && outputs.at(outputs.size()-1) == energy) {
            energy_available = true;
            outputs.pop_back();
        }
        if (outputs.size() > 0 && outputs.at(outputs.size()-1) == nucleosome_orientation) {
            nuc_or_available = true;
            outputs.pop_back();
        }
    }

    outputs.push_back(new_output);

    if (energy_available)
        outputs.push_back(energy);
    if (nuc_or_available)
        outputs.push_back(nucleosome_orientation);
}

void DNA_IO::add_output (const std::initializer_list<output_t>& new_outputs)
{
    for (auto& o : new_outputs)
        add_output(o);
}

void DNA_IO::remove_output (output_t out)
{
    auto it = std::find(outputs.begin(), outputs.end(), out);
    if (it != outputs.end())
        outputs.erase(it);
}

/*
 * TODO implement this as well
void remove_output (std::initializer_list<output_t> out)
{
    for (output_t o : out)
        remove_output(o);
}
*/

void DNA_IO::print_outputs () const
{
    std::cout << "outputs = {" << std::endl;
    if (outputs.size() == 0)
        std::cout << "No outputs" << std::endl;
    for (auto& o : outputs) {
        if (o == position_W)
            std::cout << '\t' << "position_W," << std::endl;
        if (o == position_C)
            std::cout << '\t' << "position_C," << std::endl;
        if (o == position_bp)
            std::cout << '\t' << "position_bp," << std::endl;
        if (o == position_phos_W)
            std::cout << '\t' << "position_phos_W," << std::endl;
        if (o == position_phos_C)
            std::cout << '\t' << "position_phos_C," << std::endl;
        if (o == orientation_W)
            std::cout << '\t' << "orientation_W," << std::endl;
        if (o == orientation_C)
            std::cout << '\t' << "orientation_C," << std::endl;
        if (o == orientation_bp)
            std::cout << '\t' << "orientation_bp," << std::endl;
        if (o == orientation_phos_W)
            std::cout << '\t' << "orientation_phos_W," << std::endl;
        if (o == orientation_phos_C)
            std::cout << '\t' << "orientation_phos_C," << std::endl;
        if (o == sequence_W)
            std::cout << '\t' << "sequence_W," << std::endl;
        if (o == shape)
            std::cout << '\t' << "shape," << std::endl;
        if (o == energy)
            std::cout << '\t' << "energy," << std::endl;
        if (o == nucleosome_orientation)
            std::cout << '\t' << "nucleosome_orientation," << std::endl;
    }
    std::cout << "}" << std::endl;
}

//=============================================================================
//  Saving
//=============================================================================

void DNA_IO::save_data (const std::vector<arma::mat>& R_s, 
                        const std::vector<arma::mat>& Rc_s,
                        const std::vector<arma::vec>& r_s,
                        const std::vector<arma::vec>& rc_s,
                        const std::string& seq,
                        double energy,
                        const arma::mat& nucleosome_or)
{
    q_mutex.lock();

    R_buffer.push(R_s);
    Rc_buffer.push(Rc_s);
    r_buffer.push(r_s);
    rc_buffer.push(rc_s);
    seq_buffer.push(seq);
    energy_buffer.push(energy);
    nucleosome_or_buffer.push(nucleosome_or);

    q_mutex.unlock();
}

//=============================================================================
//  Writing
//=============================================================================

//TODO remove tabs from end of line before newline char
void DNA_IO::write_data (int amount)
{
    //make temporary stringstream out of stuff in queues. Then lock queues an remove the stuff added to the stringstream, then write stringstream to file.
    std::ofstream out_file;
    out_file.open(filename, std::ofstream::app);

    if (!out_file.is_open()) {
        std::cout << "Out file not open. Exiting" << std::endl;
        std::exit(1);
    }
    out_file.setf(std::ios::scientific);
    out_file.precision(8);


    std::stringstream ss;
    out_file.seekp(0, std::ios::end);  
    if (out_file.tellp() == 0) { //file is empty
        int size = R_buffer.front().size();

        for (int i = 0; i < size; ++i) {
            for (size_t j = 0; j < outputs.size(); ++j) {
                if (outputs.at(j) == position_W) {
                    ss << "r0_"<<std::to_string(i)<< '\t' << "r1_"<<std::to_string(i)<< '\t' << "r2_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_C) {
                    ss << "rc0_"<<std::to_string(i)<< '\t' << "rc1_"<<std::to_string(i)<< '\t' << "rc2_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_bp) {
                    ss << "q0_"<<std::to_string(i)<< '\t' << "q1_"<<std::to_string(i)<< '\t' << "q2_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_phos_W && i < size-1) {
                    ss << "p0_"<<std::to_string(i)<< '\t' << "p1_"<<std::to_string(i)<< '\t' << "p2_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_phos_C && i < size-1) {
                    ss << "pc0_"<<std::to_string(i)<< '\t' << "pc1_"<<std::to_string(i)<< '\t' << "pc2_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_W) {
                    ss << "R00_"<<std::to_string(i)<< '\t' << "R10_"<<std::to_string(i)<< '\t' << "R20_"<<std::to_string(i) << '\t' 
                       << "R01_"<<std::to_string(i)<< '\t' << "R11_"<<std::to_string(i)<< '\t' << "R21_"<<std::to_string(i) << '\t' 
                       << "R02_"<<std::to_string(i)<< '\t' << "R12_"<<std::to_string(i)<< '\t' << "R22_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_C) {
                    ss << "Rc00_"<<std::to_string(i)<< '\t' << "Rc10_"<<std::to_string(i)<< '\t' << "Rc20_"<<std::to_string(i) << '\t' 
                       << "Rc01_"<<std::to_string(i)<< '\t' << "Rc11_"<<std::to_string(i)<< '\t' << "Rc21_"<<std::to_string(i) << '\t' 
                       << "Rc02_"<<std::to_string(i)<< '\t' << "Rc12_"<<std::to_string(i)<< '\t' << "Rc22_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_bp) {
                    ss << "G00_"<<std::to_string(i)<< '\t' << "G10_"<<std::to_string(i)<< '\t' << "G20_"<<std::to_string(i) << '\t' 
                       << "G01_"<<std::to_string(i)<< '\t' << "G11_"<<std::to_string(i)<< '\t' << "G21_"<<std::to_string(i) << '\t' 
                       << "G02_"<<std::to_string(i)<< '\t' << "G12_"<<std::to_string(i)<< '\t' << "G22_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_phos_W && i < size-1) {
                    ss << "P00_"<<std::to_string(i)<< '\t' << "P10_"<<std::to_string(i)<< '\t' << "P20_"<<std::to_string(i) << '\t' 
                       << "P01_"<<std::to_string(i)<< '\t' << "P11_"<<std::to_string(i)<< '\t' << "P21_"<<std::to_string(i) << '\t' 
                       << "P02_"<<std::to_string(i)<< '\t' << "P12_"<<std::to_string(i)<< '\t' << "P22_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_phos_C && i < size-1) {
                    ss << "Pc00_"<<std::to_string(i)<< '\t' << "Pc10_"<<std::to_string(i)<< '\t' << "Pc20_"<<std::to_string(i) << '\t' 
                       << "Pc01_"<<std::to_string(i)<< '\t' << "Pc11_"<<std::to_string(i)<< '\t' << "Pc21_"<<std::to_string(i) << '\t' 
                       << "Pc02_"<<std::to_string(i)<< '\t' << "Pc12_"<<std::to_string(i)<< '\t' << "Pc22_"<<std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == sequence_W) {
                    ss << "s_" << std::to_string(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == shape) {
                    //Calculate them first:
                    //...
                    //Then write them:
                    if (i < size-1) {
                        ss << "wb_" << std::to_string(i) << '\t' << "wbp_" << std::to_string(i) << '\t';
                    } else {
                        ss << "wb_" << std::to_string(i);
                    }
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
            }
        }
        for (size_t j = 0; j < outputs.size(); ++j) {
            if (outputs.at(j) == energy) {
                ss << "energy";
                if (!(j == outputs.size()-1))
                    ss << '\t';
            }
            if (outputs.at(j) == nucleosome_orientation) {
                ss <<  "N00" <<  '\t' << "N10" << '\t' << "N20" << '\t'
                   <<  "N01" <<  '\t' << "N11" << '\t' << "N21" << '\t'
                   <<  "N02" <<  '\t' << "N12" << '\t' << "N22";
                if (!(j == outputs.size()-1))
                    ss << '\t';
            }
        }
        ss << '\n';
    }
    for (int a = 0; a < amount; ++a) {
        std::vector<arma::vec> r  = r_buffer.front();
        std::vector<arma::vec> rc = rc_buffer.front();
        std::vector<arma::mat> R  = R_buffer.front();
        std::vector<arma::mat> Rc = Rc_buffer.front();
        std::string seq           = seq_buffer.front();
        double e = energy_buffer.front();
        arma::mat nuc_or = nucleosome_or_buffer.front();

        int size = static_cast<int>(R.size());
        for (int i = 0; i < size; ++i) {
            for (size_t j = 0; j < outputs.size(); ++j) {
                if (outputs.at(j) == position_W) {
                    ss << std::to_string(r.at(i)(0)) << '\t' << std::to_string(r.at(i)(1)) << '\t' << std::to_string(r.at(i)(2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_C) {
                    ss << std::to_string(rc.at(i)(0)) << '\t' << std::to_string(rc.at(i)(1)) << '\t' << std::to_string(rc.at(i)(2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_bp) {
                    arma::vec q = utils::midframe_pos(r.at(i),rc.at(i));
                    ss << std::to_string(q(0)) << '\t' << std::to_string(q(1)) << '\t' << std::to_string(q(2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_phos_W && i < size-1) {
                    arma::vec p = utils::midframe_pos(r.at(i), r.at(i+1));
                    ss << std::to_string(p(0)) << '\t' << std::to_string(p(1)) << '\t' << std::to_string(p(2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == position_phos_C && i < size-1) {
                    arma::vec pc = utils::midframe_pos(rc.at(i),rc.at(i+1));
                    ss << std::to_string(pc(0)) << '\t' << std::to_string(pc(1)) << '\t' << std::to_string(pc(2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }

                if (outputs.at(j) == orientation_W) {
                    ss << std::to_string(R.at(i)(0,0)) << '\t' << std::to_string(R.at(i)(1,0)) << '\t' << std::to_string(R.at(i)(2,0)) << '\t'
                       << std::to_string(R.at(i)(0,1)) << '\t' << std::to_string(R.at(i)(1,1)) << '\t' << std::to_string(R.at(i)(2,1)) << '\t'
                       << std::to_string(R.at(i)(0,2)) << '\t' << std::to_string(R.at(i)(1,2)) << '\t' << std::to_string(R.at(i)(2,2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_C) {
                    ss << std::to_string(Rc.at(i)(0,0)) << '\t' << std::to_string(Rc.at(i)(1,0)) << '\t' << std::to_string(Rc.at(i)(2,0)) << '\t'
                       << std::to_string(Rc.at(i)(0,1)) << '\t' << std::to_string(Rc.at(i)(1,1)) << '\t' << std::to_string(Rc.at(i)(2,1)) << '\t'
                       << std::to_string(Rc.at(i)(0,2)) << '\t' << std::to_string(Rc.at(i)(1,2)) << '\t' << std::to_string(Rc.at(i)(2,2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_bp) {
                    arma::mat G = utils::midframe_or(R.at(i), Rc.at(i));
                    ss << std::to_string(G(0,0)) << '\t' << std::to_string(G(1,0)) << '\t' << std::to_string(G(2,0)) << '\t'
                       << std::to_string(G(0,1)) << '\t' << std::to_string(G(1,1)) << '\t' << std::to_string(G(2,1)) << '\t'
                       << std::to_string(G(0,2)) << '\t' << std::to_string(G(1,2)) << '\t' << std::to_string(G(2,2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_phos_W && i < size-1) {
                    arma::mat P = utils::midframe_or(R.at(i), R.at(i+1));
                    ss << std::to_string(P(0,0)) << '\t' << std::to_string(P(1,0)) << '\t' << std::to_string(P(2,0)) << '\t'
                       << std::to_string(P(0,1)) << '\t' << std::to_string(P(1,1)) << '\t' << std::to_string(P(2,1)) << '\t'
                       << std::to_string(P(0,2)) << '\t' << std::to_string(P(1,2)) << '\t' << std::to_string(P(2,2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == orientation_phos_C && i < size-1) {
                    arma::mat Pc = utils::midframe_or(Rc.at(i), Rc.at(i+1));
                    ss << std::to_string(Pc(0,0)) << '\t' << std::to_string(Pc(1,0)) << '\t' << std::to_string(Pc(2,0)) << '\t'
                       << std::to_string(Pc(0,1)) << '\t' << std::to_string(Pc(1,1)) << '\t' << std::to_string(Pc(2,1)) << '\t'
                       << std::to_string(Pc(0,2)) << '\t' << std::to_string(Pc(1,2)) << '\t' << std::to_string(Pc(2,2));
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }

                if (outputs.at(j) == sequence_W) {
                    ss << seq.at(i);
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
                if (outputs.at(j) == shape) {
                    if (i < size-1) {
                        ss << "***" << '\t' << "***" << std::to_string(i) << '\t';
                    } else {
                        ss << "***" << std::to_string(i);
                    }
                    if (!((j == outputs.size()-1) && (i == size-1)))
                        ss << '\t';
                }
            }
        }
        for (size_t j = 0; j < outputs.size(); ++j) {
            if (outputs.at(j) == energy) {
                ss << std::to_string(e);
                if (!(j == outputs.size()-1))
                    ss << '\t';
            }
            if (outputs.at(j) == nucleosome_orientation) {
                ss << std::to_string(nuc_or(0,0)) <<  '\t' << std::to_string(nuc_or(1,0)) << '\t' << std::to_string(nuc_or(2,0)) << '\t' 
                   << std::to_string(nuc_or(0,1)) <<  '\t' << std::to_string(nuc_or(1,1)) << '\t' << std::to_string(nuc_or(2,1)) << '\t' 
                   << std::to_string(nuc_or(0,2)) <<  '\t' << std::to_string(nuc_or(1,2)) << '\t' << std::to_string(nuc_or(2,2));
                if (!(j == outputs.size()-1))
                    ss << '\t';
            }
        }
        ss << '\n';

        //GET RID OF THE DATA IN FRONT (which was just written)
        q_mutex.lock();

        R_buffer.pop();
        Rc_buffer.pop();
        r_buffer.pop();
        rc_buffer.pop();
        seq_buffer.pop();
        energy_buffer.pop();
        nucleosome_or_buffer.pop();

        q_mutex.unlock();
    }

    out_file.seekp(0, std::ios_base::end);
    out_file << ss.rdbuf()->str();

    out_file.close();
}

void DNA_IO::write_data_json (int amount)
{
    //make temporary stringstream out of stuff in queues. Then lock queues an remove the stuff added to the stringstream, then write stringstream to file.
    std::ofstream out_file;
    out_file.open(filename, std::ofstream::app);

    if (!out_file.is_open()) {
        std::cout << "Out file not open. Exiting" << std::endl;
        std::exit(1);
    }
    out_file.setf(std::ios::scientific);
    out_file.precision(8);


    std::stringstream ss;
    out_file.seekp(0, std::ios::end);  
    if (out_file.tellp() == 0) { //file is empty
        ss << "{ \"Data\": [ {" << std::endl;
    } else { //NOT SURE
        ss << ", {"; // CHANGED
    }

    std::vector<output_t> bp_data_outputs;
    for (auto& o : outputs) {
        if (o != energy && o != nucleosome_orientation)
            bp_data_outputs.push_back(o);
    }

    for (int a = 0; a < amount; ++a) {
        //ss << "\t{" << std::endl;
        ss << "\t\t\"basepair\": [ {" << std::endl;

        std::vector<arma::vec> r = r_buffer.front();
        std::vector<arma::vec> rc = rc_buffer.front();
        std::vector<arma::mat> R = R_buffer.front();
        std::vector<arma::mat> Rc = Rc_buffer.front();
        std::string           seq = seq_buffer.front();
        double e = energy_buffer.front();
        arma::mat nuc_or = nucleosome_or_buffer.front();

        int size = static_cast<int>(R.size());
        for (int i = 0; i < size; ++i) {
            //ss << "\t\t\t{" << std::endl;
            for (size_t j = 0; j < bp_data_outputs.size(); ++j) {
                if (bp_data_outputs.at(j) == position_W) {
                    ss << "\t\t\t\"r\": [ " << std::to_string(r.at(i)(0)) << ", " << std::to_string(r.at(i)(1)) << ", " << std::to_string(r.at(i)(2)) << "]";
                    if (j < bp_data_outputs.size()-1)
                        ss << ",\n";
                }
                if (bp_data_outputs.at(j) == position_C) {
                    ss << "\t\t\t\"rc\": [ " << std::to_string(rc.at(i)(0)) << ", " << std::to_string(rc.at(i)(1)) << ", " << std::to_string(rc.at(i)(2)) << "]";
                    if (j < bp_data_outputs.size()-1)
                        ss << ",\n";
                }
                //TODO implement
                if (bp_data_outputs.at(j) == position_bp) {
                }
                if (bp_data_outputs.at(j) == orientation_W) {
                    ss << "\t\t\t\"R\": [ " << std::to_string(R.at(i)(0,0)) << ", " << std::to_string(R.at(i)(1,0)) << ", " << std::to_string(R.at(i)(2,0)) << ", "
                                      << std::to_string(R.at(i)(0,1)) << ", " << std::to_string(R.at(i)(1,1)) << ", " << std::to_string(R.at(i)(2,1)) << ", "
                                      << std::to_string(R.at(i)(0,2)) << ", " << std::to_string(R.at(i)(1,2)) << ", " << std::to_string(R.at(i)(2,2)) << "]";
                    if (j < bp_data_outputs.size()-1)
                        ss << ",\n";
                }
                if (bp_data_outputs.at(j) == orientation_C) {
                    ss  << "\t\t\t\"Rc\": [ "<< std::to_string(Rc.at(i)(0,0)) << ", " << std::to_string(Rc.at(i)(1,0)) << ", " << std::to_string(Rc.at(i)(2,0)) << ", "
                                       << std::to_string(Rc.at(i)(0,1)) << ", " << std::to_string(Rc.at(i)(1,1)) << ", " << std::to_string(Rc.at(i)(2,1)) << ", "
                                       << std::to_string(Rc.at(i)(0,2)) << ", " << std::to_string(Rc.at(i)(1,2)) << ", " << std::to_string(Rc.at(i)(2,2)) << "]";
                    if (j < bp_data_outputs.size()-1) {
                        //ss << ", ";
                        ss << ",\n";
                    }
                }
                //TODO implement
                if (bp_data_outputs.at(j) == orientation_bp) {
                }
                if (bp_data_outputs.at(j) == sequence_W) {
                    ss << "\t\t\t\"sequence\": \"" << seq[i] << "\"";
                    if (j < bp_data_outputs.size()-1)
                        ss << ", ";
                }
                if (bp_data_outputs.at(j) == shape) {
                    ss << "\t\t\t\"shape\": [ ";
                    if (i < size-1) {
                        ss << "***" << ", " << "***" << std::to_string(i) << ", ";
                    } else {
                        ss << "***" << std::to_string(i) << "]";
                    }
                    if (j < bp_data_outputs.size()-1)
                        ss << ", ";
                }
            }
            if (i < size-1)
                ss << "\n\t\t}, {\n";
            else
                ss << "\n\t\t}\n";
        }
        ss << "\t\t],";
        for (size_t j = 0; j < outputs.size(); ++j) {
            if (outputs.at(j) == energy) {
                ss << "\"energy\": " << std::to_string(e);
                if (!(j == outputs.size()-1))
                    ss << ", ";
            }
            if (outputs.at(j) == nucleosome_orientation) {
                ss << "\"nucleosome_orientation\" : ["  << std::to_string(nuc_or(0,0)) <<  ", " << std::to_string(nuc_or(1,0)) << ", " << std::to_string(nuc_or(2,0)) << ", "
                                                        << std::to_string(nuc_or(0,1)) <<  ", " << std::to_string(nuc_or(1,1)) << ", " << std::to_string(nuc_or(2,1)) << ", "
                                                        << std::to_string(nuc_or(0,2)) <<  ", " << std::to_string(nuc_or(1,2)) << ", " << std::to_string(nuc_or(2,2)) << "]";
                if (!(j == outputs.size()-1))
                    ss << ", ";
            }
        }
        if (energy_buffer.size() > 1)
            ss << "\n\t},{\n";
        else
            ss << "\n\t}\n";

        //GET RID OF THE DATA IN FRONT
        q_mutex.lock();

        R_buffer.pop();
        Rc_buffer.pop();
        r_buffer.pop();
        rc_buffer.pop();
        seq_buffer.pop();
        energy_buffer.pop();
        nucleosome_or_buffer.pop();

        q_mutex.unlock();

    }

    out_file.seekp(0, std::ios_base::end);
    out_file << ss.rdbuf()->str();
    //std::cout << "written things" << std::endl;

    out_file.close();
}

void DNA_IO::start_polling ()
{
    polling = true;
    thd = std::unique_ptr<std::thread>(new std::thread(std::bind(&DNA_IO::poll, this)));
}

void DNA_IO::empty_file ()
{
    std::ofstream out_file;
    out_file.open(filename, std::ios::trunc);
    out_file.close();
}

void DNA_IO::stop_polling ()
{
    polling = false;
    //std::cout << "polling now false" << std::endl;
    if (thd)
        thd->join();
    if (energy_buffer.size() > 0) {
        //std::this_thread::sleep_for(std::chrono::milliseconds(20)); //wait until previous one has been written
        if (output_format == tsf)
            write_data(energy_buffer.size());
        else if (output_format == json) {
            write_data_json(energy_buffer.size());
        }
    }
    if (output_format == json) {
        //Open file, insert ] and }:
        std::ofstream out_file;
        out_file.open(filename, std::ofstream::app);
        if (!out_file.is_open()) {
            std::cout << "Out file not open. Exiting" << std::endl;
            std::exit(1);
        }
        out_file.seekp(0, std::ios::end);   //TODO does this work??? NO
        out_file << "]\n}\n";
        out_file.close();
    }
}

void DNA_IO::poll ()
{
    while (polling) {
        std::this_thread::sleep_for(std::chrono::milliseconds(5000));
        int amount = R_buffer.size();
        //std::cout << "amount: " << amount << std::endl;
        if (amount > 0) {
            if (output_format == tsf)
                write_data(amount);
            else if (output_format == json) {
                write_data_json(amount);
            }
        }
    }
    //std::cout << "stopped polling" << std::endl;
}

