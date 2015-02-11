# angular-persona-jwt

AngularJS Service for Mozilla Persona authentication.

## Usage

```js
persona.login.then(function(loggedUser) {
  // User is logged in
});

persona.getLoggedUser(); // Returns logged user, or null

persona.logout(); // User is logged out
```
