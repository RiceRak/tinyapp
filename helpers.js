// function to match input email to email's in database
const getUserByEmail = function(email, users) {
  for (const userId in users) {
    if (users[userId].email === email) {
      // return the entire user object so that it can be used appropriately
      return users[userId];
    }
  }
  return null;
};

// funtion to gather all of the users unique URL list
const urlsForUser = function(id, urlDatabase) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

// function to generate random strings for the converted URL and to create users ID upon registration
const generateRandomString = function(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

module.exports = { 
  getUserByEmail,
  urlsForUser,
  generateRandomString,
 }