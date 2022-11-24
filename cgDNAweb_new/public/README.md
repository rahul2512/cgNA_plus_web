npm run build ; npm run build-js ; npm run build-css
# Short documentation

Initialise and install all dependencies by running `npm install`. Then run `npm i postinstall` to patch a faulty line in the `jszip` package.

## Compiling

Run `npm run build` to build both the javascript and the CSS.

### Compiling the javascript

Run `npm run build-js` to just build the javascript.

Otherwise, run `browserify src/cgDNAweb_main.js -o cgDNAweb.js`.

### CSS

The website styling is done with SCSS/SASS, a CSS preprocessor. One therefore needs to only adjust the .scss files, and generally never touch the (generated) .css file. The SCSS/SASS stylesheets are compiled with the following command:

Run `npm run build-css` to just build the css. Otherwise use `sass stylesheets/stylesheet.scss stylesheet.css`.

## Adding extra parametersets

To add extra parameter sets, the following needs to be done:

1. The file _input_slider.scss has a mixin right below the comment `//parameter set selection`. If naming the new parameter set with a consecutive number, one can simply have the loop over j go for another value: add one to the value `$n_seq_inputs`, located at the top of the file. If another name is chosen, something else needs to be thought of, possibly typing out all possible instances again or using the more powerful mixin capabilities of SCSS. Check the documentation for this.
2. The script shapes_and_coords.cpp needs to be able to parse the new value for the new parameter set. This is as easy as adding another if statement to he already existing ones.
3. In templates/viewer/view1.html.ep: An extra entry needs to be added to the parameter set selection dropdown for EACH seq input. This means adding an extra `<li> ... </li>` to `<ul class="params_dropdown">`. More powerful HTML preprocessors should/will be looked into.
4. Also. need to make changes in dsDNAio.cpp and make_CSC.cpp and shapes_and_coords.cpp to read the parameter set with a correct NA type. 
Compiling the data providing script
===================================

This binary is called `make_shapes` and is called somewhere in the perl script. The script itself comes from a c++ file, called `shapes_and_coords.cpp`. The command to compile this script is as follows:

```
clang++ -std=c++11 -O3 -march=native -I/opt/local/include -L/opt/local/lib rbDNA.cpp DNA_IO.cpp rbDNAutils.cpp ./shapes_and_coords_ps3.cpp -o ./make_shapes -larmadillo
```

This assumes that the armadillo library is "installed" and accessible via the `$PATH`. If this is not the case, then one needs to add `-I/path/to/arma/lib` to the command above. (armadillo is a header-only library)

Program structure
=================

The viewer program is written in model-view-controller (MVC) style. The model (dnaModel.js) contains all necesssary data. The view (dnaView.js) provides the visuals to the user, and the controller (dnaController.js) provides the ability for the user to interact with the view (and possibly model).
