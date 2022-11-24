#include <algorithm>
#include <cctype>
#include <cmath>

#include "rbDNA.hpp"
#include "rbDNAutils.hpp"
#include "rbDNAparamset.hpp"
#include "DNA_IO.hpp"

#include "web_input.hpp"

std::string make_CSR_format (const arma::mat& K);

std::string make_output (const std::string& sequence, arma::mat K, const std::string& error)
{
    std::string output = "";

    output += "{\n";
    output += "\t\"sequence\" : \"" + sequence + "\",\n";

    output += make_CSR_format(K);
    output += "\t\"error\": \""+error+"\"\n";
    output += "}\n";

    return output;
}

/**
 * Stores data in the Compressed column storage format
 */
std::string make_CSR_format (const arma::mat& K) {
    std::vector<double> val; //values
    std::vector<int> col_ptr; 
    col_ptr.push_back(0);
    std::vector<int> row_ind; //column indices

    int N = K.n_cols; //K is square

    for (int i = 0; i < N; i++) {
        int NNZ = 0;
        for (int j = 0; j < N; j++) {
            if (!(std::abs(K(i,j)) < arma::datum::eps)) { //check if 0
                NNZ++;
                val.push_back(K(i,j));
                row_ind.push_back(j);
            }
        }
        col_ptr.push_back(col_ptr.at(col_ptr.size()-1)+NNZ);
    }
    std::string output = "";
    output += "\t\"K\" : {\n";
    output += "\t\t\"val\" : [\n";
    for (int i = 0; i < val.size(); ++i) {
        output += "\t\t\t" + std::to_string(val[i]);// + ",\n";
        if (i != val.size()-1)
            output += ",\n";
        else
            output += "\n";
    }
    output += "\t\t],\n";

    output += "\t\t\"col_ptr\" : [\n";
    for (int i = 0; i < col_ptr.size(); ++i) {
        output += "\t\t\t" + std::to_string(col_ptr[i]);// + ",\n";
        if (i != col_ptr.size()-1)
            output += ",\n";
        else
            output += "\n";
    }
    output += "\t\t],\n";

    output += "\t\t\"row_ind\" : [\n";
    for (int i = 0; i < row_ind.size(); ++i) {
        output += "\t\t\t" + std::to_string(row_ind[i]);// + ",\n";
        if (i != row_ind.size()-1)
            output += ",\n";
        else
            output += "\n";
        
    }
    output += "\t\t]\n";
    output += "\t},\n";

    return output;
}

int main (int argc, char** argv)
{
    std::string input = "";
    std::string paramset = "";

    if (argc < 2) {
        std::cout << make_output("", arma::mat(), "not enough arguments") << std::endl;
        exit(1);
    }

    if (argc < 3) {
        //paramset = "paramset2s";
        paramset = "\"PS3\"";
    } else {
        paramset = argv[2];
    }


    input = argv[1];


    //remove whitespace:
    input.erase(remove_if(input.begin(), input.end(), ::isspace), input.end());

    //check if empty:
    if (input.size() < 2) {
        std::cout << make_output("", arma::mat(),  "input too small") << std::endl;
        exit(1);
    }

    if (web_input::substr_length(input, 1, 0) > 3000) {
        std::cout << make_output("", arma::mat(),  "input too long") << std::endl;
        exit(1);
    }

    //check if valid input:
    if (!web_input::all_valid_characters(input)) {
        //std::cout << "invalid characters" << std::endl;
        std::cout << make_output("", arma::mat(),  "invalid input") << std::endl;
        exit(1);
    }
    if (!web_input::is_valid_input(input)) {
        //std::cout << "invalid input" << std::endl;
        std::cout << make_output("", arma::mat(),  "invalid input") << std::endl;
        exit(1);
    }

    //check if all brackets match
    if (!web_input::all_brackets_matched(input)) {
        std::cout << make_output("", arma::mat(), "unmatched parentheses") << std::endl;
        exit(1);
    }

    //transform to upper case
    std::transform(input.begin(), input.end(), input.begin(), toupper);

    //remove possible brackets because the rest of the program doesn't like them:
    input.erase(std::remove(input.begin(), input.end(), '['), input.end());
    input.erase(std::remove(input.begin(), input.end(), ']'), input.end());

    //expand stuff in parentheses
    std::string sequence = web_input::expand_sequence(input,0,0);

    //at this point sequence contains only A,C,G or T letters, so check:

    if (sequence.size() < 2) {
        std::cout << make_output("", arma::mat(), "input too short") << std::endl;
        exit(1);
    }

    for (auto c : sequence) {
        if (!(c == 'A' || c == 'C' || c == 'G' || c == 'T')) {
            std::cout << make_output("", arma::mat(), "bug in program") << std::endl;
            exit(1);
        }
    }

    //get paramset
    DNA_IO io;
    arma::mat K;

    //remove quotes from string:
    paramset.erase(std::remove(paramset.begin(), paramset.end(), '\"'), paramset.end());
    if (paramset == "PS1") {
        Parameter_set p = io.read_paramset("/home/debruin/shapes/data/cgDNAparamset1.txt");
        K = utils::make_K(sequence, p);
    } else if (paramset == "PS2") {
        Parameter_set p = io.read_paramset("/home/debruin/shapes/data/cgDNAparamset2.txt");
        K = utils::make_K(sequence, p);
    } else if (paramset == "PS3") {
        Parameter_set p = io.read_paramset("/home/debruin/shapes/data/cgDNAparamset3final.txt");
        K = utils::make_K(sequence, p);
    } else if (paramset == "PS4") {
        Parameter_set_prime p = io.read_paramset_prime("/home/debruin/shapes/data/cgDNAparamset4.maxlike.txt");
        K = utils::make_K_prime(sequence, p);
    }
    
    //Output:
    std::cout << make_output(sequence,  K, "none") << std::endl;

    return 0;
}

