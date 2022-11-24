# cgDNAweb: a web interface to the cgDNA sequence-dependent coarse-grain model of double-stranded DNA.

This repository contains all the files for the front-end of cgDNAweb. This front-end need the back-end located [here](https://github.com/EPFL-FSB-LCVMM/shapes) to function. The back-end should be put in the same folder as the front-end. Meaning that both are put in a top-folder with their respective folder structures intact.

## Installation

1. Install perlbrew
2. Enable/install cpanm via perlbrew
3. Possibly add the perl /home/.../perl5 to the PATH.
4. install the experimental module via cpanm
5. install Mojolicious via cpanm (possibly called Mojo)
6. install dependencies via cpanm

## Running the website

To run the website, use the script *cgdna_web.sh*, e.g. use the commands `cgdna_web.sh start` to start the webserver and `cgdna_web.sh stop` to stop it. The webserver can also be run locally by using the binary `bin/runit`.

## Architecture

The website uses a standard Model-View-Controller (MVC) architecture. All of this is done in Javascript and is located in the `public` subfolder.  This is also where the CSS is located. The HTML is located in the `templates` folder.

## To be done:

### Documentation
1. Credits need to be changed
2. Documentation/resources used etc need to be changed.
3. Put paramset differences in table (low priority)

### Interface
1. delete-sequence button needs to stay at the right
2. Settings in navbar need to be removed and settings button bottom right needs to take its function.
3. Exports need a down-array (low priority)

### Viewer
1. Colours phosphate need to have better contrast with background.
2. Put in correct tetrahedron for phosphates
3. Put in outlines of bases/bp/phosphates/atoms.
4. For each DNA molecule put in, calculate a (near) optimal viewing angle and distance 
5. Base/bp/phosphate frames should have coloured tips to distinguish between different direcions (low priority)

### Plots
1. Layout of plots needs to change when resizing window (2x3 -> 3x2 -> 6x1)
2. There's a circle in each plot (top left) when hovering over it.
3. Hovering is laggy when there are > 1000 bp in the molecule.
4. Change labels of phosphate plots.

