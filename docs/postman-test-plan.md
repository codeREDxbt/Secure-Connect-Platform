# Postman Test Plan

**Student Name:** Vinayak Vashisth  
**Roll Number:** 2501730150  

Run the server first and use `http://localhost:5000`.

1. `GET /` should return the API status.
2. `POST /api/auth/signup` with username, email and password (8+ chars) should return `201`.
3. Repeat signup with the same email; should return `409`.
4. `POST /api/auth/login` with correct credentials should return a JWT.
5. Login with a wrong password; should return `401`.
6. `GET /api/protected` without Authorization header should return `401`.
7. `GET /api/protected` with `Authorization: Bearer <token>` should return `200`.
8. `GET /api/notes` without token should return `401`.
9. With token, create, list, read, update and delete a note.
10. Create a second user and confirm the first user cannot read/update/delete the second user's note.
11. `GET /api/admin` with a normal user token should return `403`.
12. In a lab database only, change a test user's role to `admin`, log in again, and verify `/api/admin` succeeds.
13. Connect a Socket.IO client, join `general`, send a `chat_message`, and verify the server logs it and room members receive it.
14. Confirm `user:signup`, `user:login`, `note:created`, and `chat:message` events appear in the terminal.
