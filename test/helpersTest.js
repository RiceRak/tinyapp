const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUser = testUsers["userRandomID"];
    assert.deepEqual(user, expectedUser, "The user's ID should match the expected ID.")
  });
  it('should return null when the email is not in the database', function() {
    const user = getUserByEmail("user3@example.com", testUsers);
    assert.isNull(user, "If no match, return null");
  });
});
