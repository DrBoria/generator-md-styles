'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');
const _ = require('lodash');
const fs = require('fs');

const addThemeProvider = () => {
  // Specify the path to the .tsx file
  const filePath = path.join("src", "app", "page.tsx");

  // Read the contents of the file
  let indexContents = fs.readFileSync(filePath, "utf8");

  // Check if ThemeProvider is already imported
  const themeProviderImport = "import ThemeProviderWrapper from 'styles/ThemeProviderWrapper'";
  
  if (!indexContents.includes(themeProviderImport)) {
      // Add the import statement for ThemeProvider at the top of the file
      indexContents = `${themeProviderImport}\n${indexContents}`;
  }

  // Check if content is already wrapped with ThemeProvider to avoid double wrapping
  if (!indexContents.includes("<ThemeProviderWrapper>")) {
      // The rest of your existing logic to wrap with ThemeProvider goes here...

      // Identify the part of the string that needs to be wrapped
      const returnStartIndex = indexContents.indexOf("return (");
      const returnEndIndex = indexContents.lastIndexOf(");");

      if (returnStartIndex !== -1 && returnEndIndex > returnStartIndex) {
      const beforeReturn = indexContents.substring(
          0,
          returnStartIndex + "return (".length
      );
      const afterReturn = indexContents.substring(returnEndIndex);

      // The content that will be wrapped by the ThemeProvider
      let returnContent = indexContents.substring(
          beforeReturn.length,
          returnEndIndex
      );

      // Add the ThemeProvider wrapper
      returnContent = `
          <ThemeProviderWrapper>
              ${returnContent.trim()}
          </ThemeProviderWrapper>
          `.trim();

      // Construct the new contents
      indexContents = beforeReturn + returnContent + afterReturn;

      // Write the modified content back to the file
      fs.writeFileSync(filePath, indexContents, "utf8");
      }
  }
};

module.exports = class extends Generator {
  prompting() {
    this.log(
      yosay(
        `Welcome to the ${chalk.red('md-styles')} generator!`
      )
    );

    const styleLibraryMapper = {
      'Styled Components': 'styled',
      'SCSS': 'scss'
    }

    const prompts = [
      {
        type: 'list', // This specifies that it is a list prompt
        name: 'stylesLibrary',
        message: 'What style library do you want to use?',
        choices: [
          'Styled Components',
          'SCSS',
        ],
        default: 'Styled Components'
      }
    ];

    return this.prompt(prompts).then(props => {
      this.stylesLibrary = styleLibraryMapper[props.stylesLibrary];
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath(`${this.stylesLibrary}/styles`),
      this.destinationPath('styles')
    );

    addThemeProvider();
    
    // Merge Package Json
    const templateJSON = this.fs.readJSON(this.templatePath(`${this.stylesLibrary}/package.json`));
    const usersJSON = this.fs.readJSON(this.destinationPath("package.json"));
    const newPackageJsonContent = _.merge(templateJSON, usersJSON);
    fs.writeFileSync(
      this.destinationPath("package.json"),
      JSON.stringify(newPackageJsonContent, null, 4)
    );
  }

  install() {
    this.installDependencies({
      npm: true,
      yarn: true,
      callback: function() {
        console.log("Everything is ready!");
        console.log("Thanks for using MD tools");
      }
    });
  }
};
