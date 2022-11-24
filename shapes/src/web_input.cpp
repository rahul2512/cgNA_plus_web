#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

#include "web_input.hpp"

std::string web_input::multiply_string (const std::string& input, int amount) {
    std::string multiplied = "";
    for (int i = 0; i < amount; i++) {
        multiplied.append(input);
    }

    if (amount == 0)
        return input;

    return multiplied;
}

bool web_input::all_brackets_matched (const std::string& input) {
    int opens = 0;
    int closes = 0;
    for (auto& c : input) {
        if (c == '(')
            opens++;
        if (c == ')')
            closes++;
    }
    return opens == closes;
}

bool web_input::all_valid_characters (const std::string& input) {
    bool input_is_valid = true;
    for (auto& c : input) {
        if (c != 'A' && c != 'a' &&
            c != 'C' && c != 'c' &&
            c != 'G' && c != 'g' &&
            c != 'T' && c != 't' &&
            c != '(' && c != ')' &&
            c != '[' && c != ']' &&
            c != '_' && !isdigit(c) )
            input_is_valid = false;
    }

    return input_is_valid;
}

//TODO WRONG: sequence hasnt been expanded yet
int web_input::find_center (std::string input) {
    //we already know it's in the right level.. otherwise an error has been submitted
    //we also know that there's only ONE basepair given as center
    //so now just return that basepair index
    int raw_input_center = 0;
    bool brackets_found = false;
    for (int i = 0; i < input.size(); i++) {
        if (input[i] == '[') {
            brackets_found = true;
            raw_input_center = i+1;
        }
    }
    if (brackets_found) {
        input.erase(std::remove(input.begin(), input.end(), '['), input.end());
        input.erase(std::remove(input.begin(), input.end(), ']'), input.end());

        int expanded_input_center = web_input::substr_length(input.substr(0, raw_input_center), 0, 0);
        //std::cout << "center: " << expanded_input_center << std::endl;
        return expanded_input_center-1; //-1, since we're returning an index, not a size
    } else 
        return 0; //otherwise there's no brackets, and the default is returned
}

//TODO check to make sure this is correct!!
bool web_input::is_valid_input (const std::string& input) {
    bool input_is_valid = true;
    for (int i = 0; i < input.size(); i++) {
        if (input[i] == '_' &&  !(input[i-1] == ')' || isalpha(input[i-1]))) //for recursive input
            return false;
        /*
        if (input[i] == '_') {
            if (input[i-1] != ')' || ( i+1 < input.size() && !isdigit(input[i+1])))
                return false;
        }
        */
        if (isdigit(input[i]) && !(input[i-1] == '_' || isdigit(input[i-1])))
            return false;
        if (input[i] == ')' && !(isalpha(input[i-1]) || isdigit(input[i-1])))
            return false;
    }

    int level = 0;
    bool already_found_brackets = false;
    for (int i = 0; i < input.size(); i++) {
        if (input[i] == '[' && (i+2 < input.size() && input[i+2] != ']'))
            return false;
        if (input[i] == ']' && (i+2 >= 0 && input[i-2] != '['))
            return false;
        if (input[i] == '[' && level > 0)
            return false;
        if (input[i] == '(')
            level++;
        if (input[i] == ')')
            level--;
        if (input[i] == '[' && !already_found_brackets)
            already_found_brackets = true;
        else if (input[i] == '[' && already_found_brackets)
            return false;
    }

    return input_is_valid;
}

// OLD ONE
/*
std::string web_input::expand_sequence (const std::string& input)
{
    int max_levels = 10;
    std::vector<std::string> level_input;
    std::vector<int> level_input_mult;
    int index = 0;
    for (int i = 0; i < max_levels; i++) {
        level_input.push_back("");
        level_input_mult.push_back(0);
    }

    for (int i = 0; i < input.size(); ++i) {
        //std::cout << "input: " << input[i] << std::endl;
        //std::cout << "level_input: " << std::endl;
        //for (int i = 0; i < max_levels; ++i)
        //    std::cout << level_input[i] << " | " << level_input_mult[i] << std::endl;
        if (input[i] == '(') {
            index++;
        } else if (input[i] == ')') {
            while (i+2 < input.size() && isdigit(input[i+2])) {
                level_input_mult[index] *= 10;
                level_input_mult[index] += (int) input[i+2]-'0';
                i++;
            }
            i+=1;
            level_input[index-1].append(multiply_string(level_input[index],level_input_mult[index]));
            level_input[index] = "";
            level_input_mult[index] = 0;
            index--;
        } else if (isalpha(input[i])){
            level_input[index].push_back(input[i]);
        }
    }

    //std::cout << "expanded sequence: " << level_input[0] << std::endl;

    return level_input[0];
}
*/

//RECURSIVE
std::string web_input::expand_sequence (const std::string& substring, int mult_factor_current, int level)
{
    std::string tmpstring = substring;
    int index1 = 0;
    int index2 = tmpstring.size();
    std::string prefactor = "";
    for (int p = 0; p < level; p++)
        prefactor += "\t";

    //std::cout << prefactor << "input string: " << substring << std::endl;
    //std::cout << prefactor << "mult_factor_current: " << mult_factor_current << std::endl;

    //Look for underscores from right to left:
    bool is_expanded = false;
    for (int i = tmpstring.size()-1; i >= 0; --i) {
        if (tmpstring[i] == '_') {
            //std::cout << prefactor << "input: " << tmpstring[i] << std::endl;
            //first get multiplication factor:
            int j = i;
            int mult_factor_next = 0;
            while (j+1 < tmpstring.size() && isdigit(tmpstring[j+1])) {
                mult_factor_next *= 10;
                mult_factor_next += static_cast<int>(tmpstring[j+1]-'0');
                j++;
            }
            j+=1;
            index2 = j;
            //std::cout << prefactor << "index2: " << index2 << std::endl;
            //std::cout << prefactor << "tmpstring[index2]: " << tmpstring[index2] << std::endl;
            //then get substring to be expanded
            std::string ss = "";
            //THIS ONE SEEMS TO BE CORRECT
            if (i-1 >= 0 && isalpha(tmpstring[i-1])) {
                //single letter:
                index1= i-1;
                //std::cout << prefactor << "index1: " << index1 << std::endl;
                //std::cout << prefactor << "tmpstring[index1]: " << tmpstring[index1] << std::endl;
                ss = tmpstring.substr(index1, 1);
                //std::cout << prefactor << "ss: " << ss << std::endl;
                tmpstring.replace(index1, index2-index1, expand_sequence(ss, mult_factor_next, level+1));
                //std::cout << prefactor << "tmpstring: " << tmpstring << std::endl;
                is_expanded = true;
            } else if (i-1 >= 0 && tmpstring[i-1] == ')') {
                //possibly multiple letters:
                index1=i-2;
                //find the matching parenthesis
                int paren_level = 0;
                while (index1 > 0) {
                    if (tmpstring[index1] == '(' && paren_level == 0)
                        break;
                    if (tmpstring[index1] == ')')
                        paren_level--;
                    if (tmpstring[index1] == '(')
                        paren_level++;
                    index1--;
                }
                //std::cout << prefactor << "index1: " << index1 << std::endl;
                //std::cout << prefactor << "tmpstring[index1]: " << tmpstring[index1] << std::endl;
                int len_substr = (i-1)-(index1+1);
                //std::cout << prefactor << "len_substr: " << len_substr << std::endl;
                ss = tmpstring.substr(index1+1, len_substr);
                //std::cout << prefactor << "ss: " << ss << std::endl;
                tmpstring.replace(index1, index2-index1, expand_sequence(ss, mult_factor_next, level+1));
                //std::cout << prefactor << "tmpstring: " << tmpstring << std::endl;
                is_expanded = true;
            }
            //i = index1-1;
        }
        if (is_expanded) {
            i = tmpstring.size()-1;
            index1 = 0;
            index2 = tmpstring.size();
            is_expanded = false;
        }
    }
    //std::cout << prefactor << "tmpstring: " << tmpstring << std::endl;


    //std::cout << prefactor << "seq before multiplying: " << tmpstring << std::endl;
    tmpstring = multiply_string(tmpstring, mult_factor_current);
    //std::cout << prefactor << "seq after multiplying: " << tmpstring << std::endl;


    std::string output = tmpstring;

    //std::cout << prefactor << "outputted sequence: " << output << std::endl;

    return output;
}

int web_input::substr_length (const std::string& substring, int mult_factor_current, int level)
{
    std::string tmpstring = substring;
    int index1 = 0;
    int index2 = tmpstring.size();
    std::string prefactor = "";
    for (int p = 0; p < level; p++)
        prefactor += "\t";

    //std::cout << prefactor << "input string: " << substring << std::endl;
    //std::cout << prefactor << "mult_factor_current: " << mult_factor_current << std::endl;

    //Look for underscores from right to left:
    bool is_expanded = false;
    for (int i = tmpstring.size()-1; i >= 0; --i) {
        if (tmpstring[i] == '_') {
            //std::cout << prefactor << "input: " << tmpstring[i] << std::endl;
            //first get multiplication factor:
            int j = i;
            int mult_factor_next = 0;
            while (j+1 < tmpstring.size() && isdigit(tmpstring[j+1])) {
                mult_factor_next *= 10;
                mult_factor_next += static_cast<int>(tmpstring[j+1]-'0');
                j++;
            }
            j+=1;
            index2 = j;
            //std::cout << prefactor << "index2: " << index2 << std::endl;
            //std::cout << prefactor << "tmpstring[index2]: " << tmpstring[index2] << std::endl;
            //then get substring to be expanded
            std::string ss = "";
            //THIS ONE SEEMS TO BE CORRECT
            if (i-1 >= 0 && isalpha(tmpstring[i-1])) {
                //single letter:
                index1= i-1;
                //std::cout << prefactor << "index1: " << index1 << std::endl;
                //std::cout << prefactor << "tmpstring[index1]: " << tmpstring[index1] << std::endl;
                ss = tmpstring.substr(index1, 1);
                //std::cout << prefactor << "ss: " << ss << std::endl;
                tmpstring.replace(index1, index2-index1, expand_sequence(ss, mult_factor_next, level+1));
                //std::cout << prefactor << "tmpstring: " << tmpstring << std::endl;
                is_expanded = true;
            } else if (i-1 >= 0 && tmpstring[i-1] == ')') {
                //possibly multiple letters:
                index1=i-2;
                //find the matching parenthesis
                int paren_level = 0;
                while (index1 > 0) {
                    if (tmpstring[index1] == '(' && paren_level == 0)
                        break;
                    if (tmpstring[index1] == ')')
                        paren_level--;
                    if (tmpstring[index1] == '(')
                        paren_level++;
                    index1--;
                }
                //std::cout << prefactor << "index1: " << index1 << std::endl;
                //std::cout << prefactor << "tmpstring[index1]: " << tmpstring[index1] << std::endl;
                int len_substr = (i-1)-(index1+1);
                //std::cout << prefactor << "len_substr: " << len_substr << std::endl;
                ss = tmpstring.substr(index1+1, len_substr);
                //std::cout << prefactor << "ss: " << ss << std::endl;
                tmpstring.replace(index1, index2-index1, expand_sequence(ss, mult_factor_next, level+1));
                //std::cout << prefactor << "tmpstring: " << tmpstring << std::endl;
                is_expanded = true;
            }
            //i = index1-1;
        }
        if (is_expanded) {
            i = tmpstring.size()-1;
            index1 = 0;
            index2 = tmpstring.size();
            is_expanded = false;
        }
    }
    //std::cout << prefactor << "tmpstring: " << tmpstring << std::endl;


    //std::cout << prefactor << "seq before multiplying: " << tmpstring << std::endl;
    tmpstring = multiply_string(tmpstring, mult_factor_current);
    //std::cout << prefactor << "seq after multiplying: " << tmpstring << std::endl;


    std::string output = tmpstring;

    //std::cout << prefactor << "outputted sequence: " << output << std::endl;

    return output.size();
}
