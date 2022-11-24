#include <algorithm>
#include <cctype>

#include "rbDNA.hpp"
#include "rbDNAutils.hpp"
#include "rbDNAparamset.hpp"
#include "DNA_IO.hpp"
#include "web_input.hpp"

std::string make_output (const std::string& sequence, rbDNA dna, arma::vec shape, const std::string& error, int center_at=0)
{
    std::string output = "";

    output += "{\n";
    output += "\t\"sequence\" : \"" + dna.sequence() + "\",\n";
    output += "\t\"center\" : \"" + std::to_string(center_at) + "\",\n";

    output += "\t\"shapes\" : [\n";
    for (int i = 0; i < shape.size(); ++i) {
        output += "\t\t" + std::to_string(shape.at(i));
        if (i != shape.size()-1)
            output += ",\n";
        else
            output += "\n";
    }
    output += "\t],\n";

    output += "\t\"coords\" : [\n";
    for (int i = 0; i < dna.size(); ++i) {
        output += "\t\t{\n";
        // D
        output += "\t\t\t\"D\" : [\n";
        output += "\t\t\t\t" + std::to_string(dna.R(i)(0,0)) + ",\t" + std::to_string(dna.R(i)(0,1)) + ",\t" + std::to_string(dna.R(i)(0,2)) + ",\n";
        output += "\t\t\t\t" + std::to_string(dna.R(i)(1,0)) + ",\t" + std::to_string(dna.R(i)(1,1)) + ",\t" + std::to_string(dna.R(i)(1,2)) + ",\n";
        output += "\t\t\t\t" + std::to_string(dna.R(i)(2,0)) + ",\t" + std::to_string(dna.R(i)(2,1)) + ",\t" + std::to_string(dna.R(i)(2,2)) + "\n";
        output += "\t\t\t],\n";
        // Dc
        output += "\t\t\t\"Dc\" : [\n";
        output += "\t\t\t\t" + std::to_string(dna.Rc(i)(0,0)) + ",\t" + std::to_string(dna.Rc(i)(0,1)) + ",\t" + std::to_string(dna.Rc(i)(0,2)) + ",\n";
        output += "\t\t\t\t" + std::to_string(dna.Rc(i)(1,0)) + ",\t" + std::to_string(dna.Rc(i)(1,1)) + ",\t" + std::to_string(dna.Rc(i)(1,2)) + ",\n";
        output += "\t\t\t\t" + std::to_string(dna.Rc(i)(2,0)) + ",\t" + std::to_string(dna.Rc(i)(2,1)) + ",\t" + std::to_string(dna.Rc(i)(2,2)) + "\n";
        output += "\t\t\t],\n";
        // r
        output += "\t\t\t\"r\" : [\n";
        output += "\t\t\t\t" + std::to_string(dna.r(i)(0)) + ",\t" + std::to_string(dna.r(i)(1)) + ",\t" + std::to_string(dna.r(i)(2)) + "\n";
        output += "\t\t\t],\n";
        // rc
        output += "\t\t\t\"rc\" : [\n";
        output += "\t\t\t\t" + std::to_string(dna.rc(i)(0)) + ",\t" + std::to_string(dna.rc(i)(1)) + ",\t" + std::to_string(dna.rc(i)(2)) + "\n";
        output += "\t\t\t]\n";
        // end
        if (i != dna.size()-1)
            output += "\t\t},\n";
        else
            output += "\t\t}\n";
    }
    output += "\t],\n";
    output += "\t\"error\": \""+error+"\"\n";
    output += "}\n";

    return output;
}

int main (int argc, char** argv)
{
    std::string input = "";
    std::string paramset = "";
    int center = 0;

    if (argc < 2) {
        std::cout << make_output("", rbDNA(), arma::vec(), "not enough arguments") << std::endl;
        exit(1);
    }

    if (argc < 3) {
        //paramset = "paramset2s";
        paramset = "PS4";
    } else {
        paramset = argv[2];
    }


    input = argv[1];


    //remove whitespace:
    input.erase(remove_if(input.begin(), input.end(), ::isspace), input.end());

    //check if empty:
    if (input.size() < 2) {
        std::cout << make_output("", rbDNA(), arma::vec(),  "input too small") << std::endl;
        exit(1);
    }

    //Check if input isn't too long:
    if (web_input::substr_length(input, 1, 0) > 3000) {
        std::cout << make_output("", rbDNA(), arma::vec(),  "input too long") << std::endl;
        exit(1);
    }
        

    //check if valid input:
    if (!web_input::all_valid_characters(input)) {
        //std::cout << "invalid characters" << std::endl;
        std::cout << make_output("", rbDNA(), arma::vec(),  "invalid input") << std::endl;
        exit(1);
    }
    if (!web_input::is_valid_input(input)) {
        //std::cout << "invalid input" << std::endl;
        std::cout << make_output("", rbDNA(), arma::vec(),  "invalid input") << std::endl;
        exit(1);
    }

    //check if all parentheses and brackets match
    if (!web_input::all_brackets_matched(input)) {
        std::cout << make_output("", rbDNA(), arma::vec(), "unmatched parentheses") << std::endl;
        exit(1);
    }

    //transform to upper case
    std::transform(input.begin(), input.end(), input.begin(), toupper);

    //find center:
    center = web_input::find_center(input);
    //remove brackets because the rest of the program doesn't like them:
    input.erase(std::remove(input.begin(), input.end(), '['), input.end());
    input.erase(std::remove(input.begin(), input.end(), ']'), input.end());

    //expand stuff in parentheses
    //std::string sequence = web_input::expand_sequence(input);
    //for new recursive input parser:
    std::string sequence = web_input::expand_sequence(input, 0, 0);

    //at this point sequence contains only A,C,G or T letters, so check:
    if (sequence.size() < 2) {
        std::cout << make_output("", rbDNA(), arma::vec(), "input too short") << std::endl;
        exit(1);
    }

    for (auto c : sequence) {
        if (!(c == 'A' || c == 'C' || c == 'G' || c == 'T')) {
            std::cout << make_output("", rbDNA(), arma::vec(), "bug in program") << std::endl;
            exit(1);
        }
    }


    //std::cout << sequence << std::endl;

    //get paramset
    DNA_IO io;
    arma::mat K;
    arma::vec w;

    //remove quotes from string:
    paramset.erase(std::remove(paramset.begin(), paramset.end(), '\"'), paramset.end());
    //if (paramset == "\"PS1\"") {
    if (paramset == "PS1") {
        Parameter_set p = io.read_paramset("/home/debruin/shapes/data/cgDNAparamset1.txt");
        K = utils::make_K(sequence, p);
        w = utils::make_w_tridiag(sequence, p, K);
    //} else if (paramset == "\"PS2\"") {
    } else if (paramset == "PS2") {
        Parameter_set p = io.read_paramset("/home/debruin/shapes/data/cgDNAparamset2.txt");
        K = utils::make_K(sequence, p);
        w = utils::make_w_tridiag(sequence, p, K);
    //} else if (paramset == "\"PS3\"") {
    } else if (paramset == "PS3") {
        Parameter_set p = io.read_paramset("/home/debruin/shapes/data/cgDNAparamset3final.txt");
        K = utils::make_K(sequence, p);
        w = utils::make_w_tridiag(sequence, p, K);
    //} else if (paramset == "\"PS4\"") {
    } else if (paramset == "PS4") {
        Parameter_set_prime p = io.read_paramset_prime("/home/debruin/shapes/data/cgDNAparamset4.maxlike.txt");
        K = utils::make_K_prime(sequence, p);
        w = utils::make_w_tridiag_prime(sequence, p, K);
    }

    auto dna = utils::construct_configuration(sequence, w);

    //Output:
    std::cout << make_output(sequence, dna, w, "none", center) << std::endl;

    return 0;
}

