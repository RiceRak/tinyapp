const bcrypt = require("bcryptjs");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

const getUserByEmail = function(email) {
  for (const userId in users) {
    if (users[userId].email === email) {
      return userId;
    }
  }
  return false;
};

const urlsForUser = function(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "j8iKhBnj",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "j8iKhBnj",
  },
};

const users = {
  j8iKhBnj: {
    id: "j8iKhBnj",
    email: "user@email.com",
    password: "password",
  },
};

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = {
    user,
    urlsForUser,
  };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    user,
  };
  if (user) {
    return res.redirect("/urls");
  };

  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  if (user) {
    return res.redirect("/urls");
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  // deconstruct form object
  const { email, password, } = req.body;
  // compare plain text password to hashed password
  const hashedPassword = bcrypt.hashSync(password, 10);
  // make sure fields are filled out
  if (!email || !password) {
    return res.status(400).send('Bad Request - Missing required field');
  }
  // compare input email to existing user database
  if (getUserByEmail(email)) {
    return res.status(400).send('Bad Request - Email already registered');
  }
  // create new user
  const id = generateRandomString(8);
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  // Check if user is logged in
  if (!user) {
    return res.status(401).send("Unauthorized: Please log in to create URL's");
  }
  // If user is logged in, check if form is filled
  const longURL = req.body.longURL;
  if (!longURL) {
    res.send("Please enter the webpage you would like to shorten")
  }
  // Update the URL entry in the database
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: user.id,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  // get user email with getUserByEmail function call
  const userKey = getUserByEmail(req.body.email);
  // validate user inputs
  if (!req.body.email || !req.body.password) {
    return res.send("Please fill out login details");
  }
  // get users id
  const loggedUser = users[userKey];
  //check that there is a user thats validate in DB
  if (loggedUser) {
    // verify passwords match
    if (bcrypt.compareSync(req.body.password, loggedUser.password)) {
      //set cookies
      res.cookie("user_id", loggedUser.id);
      // show the user its URLs
      return res.redirect("/urls");
   
    } else {
      // if user id does not exist in database
      return res.status(403).send('Forbidden: Email/Passwords do not match');
    }
  }
  // if no user found, return error
  return res.status(401).send('Unauthorized: Email Not Found');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id]
  const shortURL = req.params.id;
  const urlSearch = urlDatabase[shortURL];
  //check if short URL exists
  if (!urlSearch) {
    return res.send('Short URL does not exist');
  };
  // check if user owns URL
  const userURLs = urlsForUser(user.id);
  if (!userURLs[shortURL]) {
    return res.send('You do not have permission to view this URL');
  };
  
  const templateVars = {
    id: shortURL,
    longURL: urlSearch.longURL,
    user,
  };
  // show the user thier page
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  // check if user is logged in
  const user = users[req.cookies.user_id];
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
  const user = users[req.cookies.user_id];

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
  const newlongURL = req.body.editURL;
  
  if (!urlDatabase[shortURL]) {
    return res.send("Short URL not found");
  }
  //update database
  urlDatabase[shortURL].longURL = newLongURL;
    res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});