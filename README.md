# The TinyApp Project

This app will take a fullsized URL and shrink it down for better access, storage and organization. You can even share the shrunk URL's with friends(if they have the server running as well)!

## The Goal

TinyApp was developed so that I can practice server side creations and implementing CRUD. This was also created to practice handling registration's and login's securely by encryting your passwords and also securing your cookies. I did not really practice the client side creations so please excuse the UI, I will be learning that shortly.

## Final Product

![Registration Page](https://github.com/RiceRak/tinyapp/blob/master/docs/Registration-Page.png.JPG)


![URL Info](https://github.com/RiceRak/tinyapp/blob/master/docs/URL-info.png.JPG)


![URL List](https://github.com/RiceRak/tinyapp/blob/master/docs/URL-list.png.JPG)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## How to Use/Install

- Clone this repository to your own directory using the command in your terminal.

`git clone git@github.com:RiceRak/tinyapp.git`
-  After you have cloned this cd into the directory

`cd tinyapp`
- Install dependencies

`npm install`
- Start your server (To use app)

`node express_server.js`


- If you would like to build and add on this development. You can input the following command and nodemon will run and restart with each change you make.

`npm start`

- You should see that your server is "app listening on port 8080!" (you can set a port that you desire inside the express_server.js file if you wish, default is 8080).
- Open your browser and visit "http://localhost:8080/register"
- Register with your email and a secure password and you will be taken to your URL's. Notice you do not have an saved? Click "Create New URL" in the header and begin your shrinking journey!

PROTIP:
If you know the ShortURL you can visit the associated webpage directly by entering
localhost:8080/u/"ShortURL"

## Acknowledgements

This project was built with heavy guidance from LHL staff!

## License

This project is open source and available under the [MIT License](LICENSE).