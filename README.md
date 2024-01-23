# The TinyApp Project

This app will take a fullsized URL and shrink it down for better access, storage and organization. You can even share the shrunk URL's with friends(if they have the server running as well)!

## The Goal

TinyApp was developed so that I can practice server side creations and implementing CRUD. This was also created to practice handling registration's and login's securely by encryting your passwords and also securing your cookies. I did not really practice the client side creations so please excuse the UI, I will be learning that shortly.


## How to Use/Install

- Clone this repository to your own directory using the command in your terminal.
`git clone git@github.com:RiceRak/tinyapp.git`
-  After you have cloned this cd into the directory
`cd tinyapp`
- Install dependencies
`npm install`
- Start your server
`npm start`
- You should see that your server is "app listening on port 8080!" (you can set a port that you desire inside the express_server.js file if you wish, default is 8080).
- Open your browser and visit "http://localhost:8080/register"
- Register with your email and a secure password and you will be taken to your URL's. Notice you do not have an saved? click "Create New URL" in the header and begin your shrinking journey!

## Testing

This API uses the Mocha test framework which can be ran by using the command:
`npm test`
Test are located in ./test/helpersTest. Here is an example of the test structure:
```javascript
describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUser = testUsers["userRandomID"];
    assert.deepEqual(user, expectedUser, "The user's ID should match the expected ID.")
  });
});```
