#LOCAL COPY OF ARMADILLO LIBRARY
echo "Compiling shape maker"
clang++-3.5 -std=c++11 -O3 -march=native -Wall -Wextra src/rbDNA.cpp src/rbDNAutils.cpp src/DNA_IO.cpp src/web_input.cpp src/shapes_and_coords.cpp -I./include -I./armadillo-7.800.3/include -L./src -llapack -lblas -lpthread -o make_shapes

echo "Compiling CSC maker"
clang++-3.5 -std=c++11 -O3 -march=native -Wall -Wextra src/rbDNA.cpp src/rbDNAutils.cpp src/DNA_IO.cpp src/web_input.cpp src/make_CSC.cpp -I./include -I./armadillo-7.800.3/include -L./src -llapack -lblas -lpthread -o make_CSC

#ARMADILLO LIBRARY IN PATH
#g++ -std=c++11 -O3 -march=native -Wall -Wextra src/rbDNA.cpp src/rbDNAutils.cpp src/DNA_IO.cpp src/web_input.cpp src/shapes_and_coords.cpp -I./include -L./src -larmadillo -llapack -lblas -lpthread -o make_shapes
