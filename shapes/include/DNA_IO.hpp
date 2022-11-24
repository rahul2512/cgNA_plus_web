/**
 * This class handles all the IO for the simulation. The idea is to have the write-to-file be asynchronous, so that the saving of the data
 * (which takes a lot longer than computing conformations) is not on the same execution thread as the computations, thus saving time.
 */
#pragma once

//basic io stuff
#include <iostream>
#include <fstream>
#include <sstream>

//containers
#include <queue>
#include <vector>
#include <unordered_map>

//threads
#include <thread>
#include <mutex>
#include <chrono>

//external lib
#include <armadillo>

//custom headers
#include "rbDNA.hpp"
#include "rbDNAutils.hpp"
#include "dna_code.hpp"
#include "rbDNAoutput.hpp"
#include "rbDNAparamset.hpp"
#include "rbDNAcondition.hpp"

class DNA_IO {
    public:
        DNA_IO () {polling = false;}

        ~DNA_IO () {
            if (polling)
                stop_polling();
        }

        //=====================================================================
        //  Interface to stiffnesses and shapes by dinucleotide
        //=====================================================================
        /**
         * Initialise the stiffness matrix and sigma in the DNA_IO class so the simulation can easily
         * access it to make the block stiffness matrix and the w.
         */
        Parameter_set read_paramset (const std::string& filename);

        /**
         * Initialise the stiffness matrix and sigma in the DNA_IO class so the simulation can easily
         * access it to make the block stiffness matrix and the w. For the new parameter set format.
         */
        Parameter_set_prime read_paramset_prime (const std::string& filename);

        /**
         * Set the filename of the file to write the data to, and remove its contents.
         */
        void set_output_filename (const std::string& _filename)
        {
            filename = _filename;
            empty_file();
        }

        /**
         * Start to check for data in the queues.
         */
        void start_polling ();

        /**
         * Stop checking for data in the queues.
         */
        void stop_polling ();

        //=====================================================================
        //  Reading:
        //=====================================================================

        /**
         * Reads at what positions the bound midframes are and returns those in
         * a hash map indexed with ints.
         *
         * @return  hash map with binding sites in it
         */
        std::unordered_map<int, coupled_condition> read_binding_sites (const std::string& filename);


        /**
         * Reads in the orientation of the nucleosome.
         *
         * @return  3x3 matrix
         */
        arma::mat read_nucleosome_orientation (const std::string& filename);

        /**
         * Reads a sequence file and returns a string containing that sequence.
         *
         * @return  string of nucleotides of size N_bp
         */
        std::string read_sequence (const std::string& filename, int from_pos_in_file, int amount);

        /**
         * Reads in the DNA conformation given in a file and return an rbDNA object.
         *
         * @pre:    assumes the file has a basepair configuration on each line. Also assumes that 
         *          on one line; it has the following format:
         *          R00 R10 R20 R01 R11 R21 R02 R12 R22 r0 r1 r2 Rc00 Rc10 Rc20 Rc01 Rc11 Rc21 Rc02 Rc12 Rc22 rc0 rc1 rc2
         *
         * @return  rbDNA object with conformation as specfied in the file, but poly(A) for a sequence.
         */
        rbDNA read_dna_configuration (const std::string& old_seq, const std::string& filename, int from_pos_in_file);

        rbDNA read_dna_configuration_fra (const std::string& old_seq, const std::string& filename);

        rbDNA read_dna_configuration_shapes (const std::string& old_seq, const std::string& filename);

        rbDNA read_phosphate_configurations_pfra (const std::string& filename);

        //=====================================================================
        // Setting output data
        //=====================================================================

        void set_output_format (output_format_t of);

        /**
         * Adds output possibilities. Can choose any cmobination of 
         *      position_W,
         *      position_C,
         *      orientation_W,
         *      orientation_C,
         *      sequence_W,
         *      shape,
         *      energy,
         *      nucleosome_orientation
         * Note tht it removes the previously set output
         */
        void set_output (const std::initializer_list<output_t>& out);

        /**
         * Add an output to the current number of outputs. Choose from the ones described at set_output.
         */
        void add_output (output_t new_output);
        void add_output (const std::initializer_list<output_t>& new_outputs);
        
        /**
         * Remove an output of the current number of outputs. Choose from the ones described at set_output.
         * If it does not exist, or is not in the outputs, DO NOTHING (!!!).
         */
        void remove_output (output_t out);
        //void remove_output (const std::initializer_list<output_t>& out);
        
        void print_outputs () const;

        //=====================================================================
        // Read parameter set:
        //=====================================================================

        /**
         * Reads in the stiffness matrices for the base pairs and outputs
         * those in a hash map.
         *
         * @return hash map with monomer stiffnesses coded with {"A", "C", "G", "T"}.
         */
        std::unordered_map<std::string,arma::mat> read_bp_stiffness_matrices (const std::string& filename);

        /**
         * Reads in the stiffness matrices for the base pairs steps and outputs
         * those in a hash map.
         *
         * @return hash map with dimer stiffnesses coded with {"AA", "AC", "AG", "AT", ... , "TG", "TT"}.
         */
        //std::unordered_map<std::string, arma::mat> read_bps_stiffness_matrices (const std::string& filename); //superseded by the one with the  extra postfix argument.

        /**
         * Reads in the shape vectors/equilibrium values for the conformation
         * of the individual base pairs and outputs those in a hash map.
         *
         * @return hash map with monomer shapes coded with {"A", "C", "G", "T"}.
         */
        std::unordered_map<std::string, arma::vec> read_bp_dimless_shape_vectors (const std::string& filename);

        /**
         * Reads in the shape vectors/equilibrium values for the conformation
         * of the individual base pair steps and outputs those in a hash map.
         *
         * @return hash map with dimer shapes coded with {"AA", "AC", "AG", "AT", ... , "TG", "TT"}.
         */
        //std::unordered_map<std::string, arma::vec> read_bps_dimless_shape_vectors (const std::string& filename); //superseded by the one with the  extra postfix argument.

        /**
         * Reads in the shape vectors/equilibrium values for the conformation
         * of the individual base pair steps and outputs those in a hash map.
         * Adds a possible postfix to the keys in the hash map.
         *
         * @return hash map with dimer shapes coded with {"AA", "AC", "AG", "AT", ... , "TG", "TT"}.
         */
        std::unordered_map<std::string, arma::mat> read_bps_stiffness_matrices (const std::string& filename, const std::string& postfix="");

        /**
         * Reads in the shape vectors/equilibrium values for the conformation
         * of the individual base pair steps and outputs those in a hash map.
         * Adds a possible postfix to the keys in the hash map.
         *
         * @return hash map with dimer shapes coded with {"AA", "AC", "AG", "AT", ... , "TG", "TT"}.
         */
        std::unordered_map<std::string, arma::vec> read_bps_dimless_shape_vectors (const std::string& filename, const std::string& postfix="");
        
        
        /**
         * Removes the contents of the data file.
         */
        void empty_file();

        //=====================================================================
        // Saving:
        //=====================================================================

        /**
         * Writes the data in the arguments to the queues of the IO class.
         */
        void save_data (const std::vector<arma::mat>& R_s, 
                        const std::vector<arma::mat>& Rc_s,
                        const std::vector<arma::vec>& r_s,
                        const std::vector<arma::vec>& rc_s,
                        const std::string& seq_s,
                        double energy,
                        const arma::mat& nucleosome_or = arma::eye(3,3));

    private:
        //=====================================================================
        //Writing:
        //=====================================================================

        /**
         * Writes the data in the queues asynchronously to the data file with given filename.
         *
         * @param amount    The number of elements of each queue to be written. 
         */
        void write_data (int amount);
        void write_data_json (int amount);

        /**
         * Writes the data in the queues with the conformational part of the data
         * to file asynchronously.
         *
         * @note    does not work yet
         */
        void write_bp_conformation (bool append);

        /**
         * Writes the data in the queues with the sequence part of the data
         * to file asynchronously.
         *
         * @note    does not work yet
         */
        void write_bp_code (const std::string& filename, const std::vector<code_t>& code, const std::vector<int>& indices, bool append);

        /**
         * Check whether there's new data in the queues to write.
         */
        void poll();

        //The queues containing the data on the DNA
        std::queue<std::vector<arma::mat>>  R_buffer;
        std::queue<std::vector<arma::mat>>  Rc_buffer;
        std::queue<std::vector<arma::vec>>  r_buffer;
        std::queue<std::vector<arma::vec>>  rc_buffer;
        std::queue<std::string>             seq_buffer;
        std::queue<double>                  energy_buffer;
        std::queue<arma::mat>               nucleosome_or_buffer;

        //name of the data file to write to
        std::string filename;

        //The output format: tab-separated file (tsf) or json.
        output_format_t output_format = tsf;
        //The outputs of the simulation.
        std::vector<output_t> outputs;

        //true if currently checking for data to write, false otherwise.
        bool polling;

        std::mutex q_mutex;

        std::unique_ptr<std::thread> thd;
};
