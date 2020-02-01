

# A3 Starter template

The starter code for creating interactive visualization prototypes.

## Getting Started

This repo is set up to use the [Parcel](https://parceljs.org/) bundler. If you don't
like the way we've set things up, feel free to change it however you like!

The only restriction is that __your final HTML/CSS/JS output must be stored in the "docs" folder__ so that
GitHub knows how to serve it as a static site.

### Install

#### Required software

You must have Node.js installed. I prefer to install it using [nvm](https://github.com/nvm-sh/nvm)
because it doesn't require sudo and makes upgrades easier, but you can also just get it directly from
https://nodejs.org/en/.

#### Install dependecies

Once you've got `node`, run the command `npm install` in this project folder
and it will install all of the project-specific dependencies (if you're curious open up `package.json` to see where these are listed).

npm is the _node package manager_.

### Running the local dev server

To run the project locally, run `npm start` and it will be available at http://localhost:1234/.

### Building the final output

Run `npm run build` and all of your assets will be compiled and placed into the `docs/` folder. Note
that this command will overwrite the existing docs folder.

Once pushed to GitHub, the output should be available at UW-CSE442-WI20.github.io/your-repo-name/


## Other notes

### Using 3rd party libraries

You are more than welcome to use open source packages such as D3.js, just make sure to cite these.

To add a new one run `npm install --save <library-name>`, e.g. `npm install --save d3`. This will
add the library locally so it is available for use in your JS files. It will also add `d3` to the
list of dependencies in `package.json`.

_Note that if you install a library your teammates will need to install it too. Once the dep is added
to `package.json` simply running `npm install` in this directory will download the new dependency._
