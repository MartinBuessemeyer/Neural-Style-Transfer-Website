# Learning-Website
This is a basic website of mine where I can try out stuff. 
For now, I want to add Deep Learning Stuff by using [tensorflow.js](https://www.tensorflow.org/js). 
With this I can run Deep Learning on the client side. Thus, I could easily host it a raspberry pi.
I am currently working on [Neural Style Transfer](https://en.wikipedia.org/wiki/Neural_Style_Transfer#cite_note-5).
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