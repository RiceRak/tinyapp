const helpers = require("./helpers");
const bcrypt = require("bcryptjs");
const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const data = require("./database")
const users = data.users;
const urlDatabase = data.urlDatabase;


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const cookieSessionConfig = cookieSession({
  name: 'myCookieSession',
  keys: ['my-secret-word']
});

app.use(cookieSessionConfig);

// GET

app.get("/", (req, res) => {
  const user = users[req.session.user_id]
  if (!user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");

})

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  // check if a cookie session is active/user is logged in
  if (!user) {
    return res.status(401).send("Unauthorized: Please log in to view URL's")
  }
  // if user is logged in, pass 'urls_index' data to render
  const urlsForUser = helpers.urlsForUser(user.id, urlDatabase);
  const templateVars = {
    user,
    urlsForUser,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  // check if a cookie session is active/user is logged in
  const user = users[req.session.user_id];
  // if user is logged in, redirect to their URL's
  if (user) {
    return res.redirect("/urls");
  }
  // if user is not logged in, render the login page
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  // check if a cookie session is active/user is logged in
  const user = users[req.session.user_id];
  // if user is logged in, redirect to their URL's
  if (user) {
    return res.redirect("/urls");
  }
  // if user is not logged in, render the registration page
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("register", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;
  const urlSearch = urlDatabase[shortURL];
  
  if(!user) {
    return res.status(401).send("Unauthorized: Please log in to view URL's")
  }
  //check if short URL exists
  if (!urlSearch) {
    return res.send('Short URL does not exist');
  }
  // check if user owns URL
  const userURLs = helpers.urlsForUser(user.id, urlDatabase);
  if (!userURLs[shortURL]) {
    return res.status(401).send('You do not have permission to view this URL');
  }
  const templateVars = {
    id: shortURL,
    longURL: urlSearch.longURL,
    user,
  };
  // show the user their page
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id
  const url = urlDatabase[shortURL]
  if (!url) {
    return res.status(400).send('Short URL does not exist');
  }
  res.redirect(url.longURL);
});

// POST

app.post("/register", (req, res) => {
  // deconstruct form object
  const { email, password, } = req.body;
  // make sure fields are filled out
  if (!email || !password) {
    return res.status(400).send('Bad Request - Missing required field');
  }
  // compare input email to existing user database
  if (helpers.getUserByEmail(email, users)) {
    return res.status(400).send('Bad Request - Email already registered');
  }
  // compare the hashed password
  const hashedPassword = bcrypt.hashSync(password, 10);
  // create new user
  const id = helpers.generateRandomString(8);
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  // start a cookie session and show the user their URL's

  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  // Check if user is logged in
  if (!user) {
    return res.status(401).send("Unauthorized: Please log in to create URL's");
  }
  // If user is logged in, check if form is filled
  const longURL = req.body.longURL;
  if (!longURL) {
    res.status(400).send("Please enter the webpage you would like to shorten");
  }
  // Update the URL entry in the database
  const shortURL = helpers.generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  // validate user inputs
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please fill out login details");
  }
  // get user data object with getUserByEmail function call
  const userData = helpers.getUserByEmail(req.body.email, users);
  // get users data
  if (!userData) {
    // if no user found, return error
  return res.status(401).send('Unauthorized: Email Not Found');
  }
  const loggedUser = userData.id;
  // check that there is a user in user database
  if (loggedUser) {
    // verify passwords match
    if (bcrypt.compareSync(req.body.password, userData.password)) {
      //set encrypted cookie
      req.session.user_id = userData.id;
      // show the user their URLs
      return res.redirect("/urls");
    }
      // if user id does not exist in database
      return res.status(403).send('Forbidden: Email/Passwords do not match');
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  // check if user is logged in
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(401).send("Unauthorized: Please log in to delete URLs.");
  }
  // check if user owns URL
  const urlSearch = urlDatabase[shortURL];

  if (!urlSearch || urlSearch.userID !== user.id) {
    return res.status(403).send("Forbidden: You do not have permission to delete this URL.");
  }
  // delete if requirements met
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id/", (req, res) => {
  // check if user is logged in
  const user = users[req.session.user_id];

  if (!user) {
    return res.status(401).send("Unauthorized: Please log in to edit URLs.");
  }

  // check if user owns URL
  const shortURL = req.params.id;
  const urlSearch = urlDatabase[shortURL];
  if (!urlSearch || urlSearch.userID !== user.id) {
    return res.status(403).send("Forbidden: You do not have permission to edit this URL.");
  }

  //check if short URL exists
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("Short URL not found");
  }
  //update database
  const newLongURL = req.body.editURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}!`);
});