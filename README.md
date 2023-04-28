# Neural Style Transfer - Website

This is a basic website of mine where I tried out to use [tensorflow.js](https://www.tensorflow.org/js) for [Neural Style Transfer (NST)](https://en.wikipedia.org/wiki/Neural_Style_Transfer#cite_note-5). The NST process takes place on the clients device. Thanks to that, one could host the website on a raspberry pi. 

# Used Knowledge Resources

#### Setup
- Webpacker, Typescript, React:
    - [youtube]((https://www.youtube.com/playlist?list=PLiKs97d-BatHEeclprFtCaw8RcNOYXUqN))
    - [developer handboook](https://developerhandbook.com/webpack/how-to-configure-scss-modules-for-webpack/) 
    for SCSS usage with [MiniCssExtractPlugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
- React Resources:
    - [w3schools](https://www.w3schools.com/react/react_es6.asp)
    - [react official tutorial](https://reactjs.org/tutorial/tutorial.html)
    
    
#### Upgrade Dependencies
Minor
    
    - npm update --save/--save-dev
Major

    - npx npm-check-updates -u
    - npm install


#### Starting the server
    - npm run start
    
#### Linting
    - npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0
