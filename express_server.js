const express = require("express");
const cookieParser = require("cookie-parser")
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = function(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
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
      return true;
    }
  }
  return false;
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  j8iKhBnj: {
    id: "j8iKhBnj",
    email: "user@email.com",
    password: "password",
  },
  ig7HnF5d: {
    id: "ig7HnF5d",
    email: "user2@email.com",
    password: "2password"
  },
};

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id]
  const templateVars = { 
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  
  res.render("register")
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["users"]
  }
  res.render("urls_new", templateVars);
});


app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('Bad Request - Missing required field');
  }
  if (getUserByEmail(email)) {
    return res.status(400).send('Bad Request - Email already registered');
  }
  const id = generateRandomString(8);
  users[id] = { 
    id,
    email,
    password,
    };
  res.cookie('user_id', id);
  res.redirect("/urls")
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL
  urlDatabase[shortURL] = longURL;
  console.log(req.body);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});



app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL]
  const templateVars = { 
    id: shortURL, longURL,
    username: req.cookies["users"] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id
  const longURL = urlDatabase[shortURL]
  if (!longURL) {
    return res.send('Short URL does not exist');
  }
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id/", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.editURL;

  urlDatabase[shortURL] = longURL;
  
  res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});