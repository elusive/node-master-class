# Uptime Monitoring API

First application from NodeJS Masterclass is restful api for uptime monitoring.
The users will be allowed to enter URLs that they want to monitor and they will
receive alerts with the URL either "goes down" or "comes back up".

### Requirements

1. Users can enter URL to be monitored
2. Users will receive alert for go down.
3. Users will receive alert for come up.
4. Users will be able to sign up and sign in.
5. Users will get alerts by SMS rather than email.
6. Users will be able to edit settings related.

### API Specification

1. Support http requests on a port and accept:
    - POST 
    - GET
    - PUT
    - DELETE
    - HEAD
2. Client can connect and perform user functions:
    - Create user
    - Update user
    - Delete user
3. Support sign-in via API that returns a token that can be used to authenticate
   subsequent api requests.
4. Support sign-out which will invalidate the token.
5. Support signed in user to use token to create a new "check" which will check
   a given URL and define its UP code (i.e. 200) and its Down code (any 500).
6. Support signed in users to edit or delete any of their "checks". Limit 5.
7. Background workers should perform all checks and send alerts to users when a
   check changes state from up to down or vice versa.

Once per minute all checks should run. Checks should use defined up/down codes
to determine if up down state has changed since last check. If it has changed 
then the user will be alerted via SMS. 

SMS will use Twilio API.
DB will be the file system and JSON key value document.


