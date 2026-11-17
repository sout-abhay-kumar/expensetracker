# SmartSpend API Documentation

**API name:** SmartSpend API\
**Version:** 1.0.0\
**OpenAPI version:** 3.1.0\
**Backend:** FastAPI\
**Default local base URL:** `http://localhost:8000`

> This documentation is based on the project's uploaded OpenAPI
> specification. The base URL above is a local-development default;
> change it if your backend runs on a different host or port.

------------------------------------------------------------------------

## 1. Overview

The SmartSpend API provides endpoints for:

-   Google authentication and retrieving the current user.
-   Retrieving expense categories.
-   Creating, listing, updating, and deleting transactions.
-   Creating and listing monthly budgets.
-   Retrieving dashboard data.
-   Checking whether the API is running.

Most application endpoints require a JWT access token using HTTP Bearer
authentication. The root and health-check endpoints are public.

## 2. Base URL and API format

  Setting           Value
  ----------------- ----------------------------------------
  Local base URL    `http://localhost:8000`
  API prefix        `/api`
  Request format    JSON
  Response format   JSON
  Authentication    Bearer token (for protected endpoints)

Example full endpoint:

``` text
http://localhost:8000/api/transactions
```

## 3. Authentication

### How authentication works

1.  The frontend obtains a Google ID token through Google Sign-In.
2.  The frontend sends that token to `POST /api/auth/google` in the
    `credential` field.
3.  The backend returns an application access token and user details.
4.  The frontend sends the returned access token with protected API
    requests.

For protected endpoints, include this HTTP header:

``` http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Do not share or commit real access tokens, Google credentials, or other
secrets.

### 3.1 Google Login

`POST /api/auth/google`

Authenticates a user using a Google credential and returns an
application access token.

**Authentication required:** No

Request body:

``` json
{
  "credential": "GOOGLE_ID_TOKEN"
}
```

Successful response --- `200 OK`:

``` json
{
  "access_token": "YOUR_APPLICATION_ACCESS_TOKEN",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Example User",
    "picture": "https://example.com/profile.jpg"
  }
}
```

`picture` may be `null`.

### 3.2 Get Current User

`GET /api/auth/me`

Returns the profile of the currently authenticated user.

**Authentication required:** Yes

Headers:

``` http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response --- `200 OK`:

``` json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Example User",
  "picture": null
}
```

------------------------------------------------------------------------

## 4. Categories

### 4.1 List Categories

`GET /api/categories`

Returns the categories available to the authenticated user.

**Authentication required:** Yes

Headers:

``` http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response --- `200 OK`:

``` json
[
  {
    "id": 1,
    "name": "Food",
    "kind": "expense"
  },
  {
    "id": 2,
    "name": "Salary",
    "kind": "income"
  }
]
```

The example values are illustrative. Use category IDs returned by your
own API when creating transactions or budgets.

------------------------------------------------------------------------

## 5. Transactions

Transactions represent recorded income or expenses.

### Transaction fields

  ----------------------------------------------------------------------------
  Field                Type                          Required Validation /
                                                              meaning
  -------------------- ---------------- --------------------- ----------------
  `title`              string                             Yes 1--160
                                                              characters

  `amount`             number or                          Yes Greater than 0;
                       numeric string                         maximum
                                                              999,999,999

  `kind`               string                             Yes Transaction
                                                              kind, such as
                                                              `expense` or
                                                              `income`

  `category_id`        integer                            Yes ID of an
                                                              existing
                                                              category

  `transaction_date`   date string                        Yes Date in
                                                              `YYYY-MM-DD`
                                                              format

  `note`               string or null                      No Maximum 500
                                                              characters
  ----------------------------------------------------------------------------

### 5.1 List Transactions

`GET /api/transactions`

Returns transactions for the authenticated user. Optional query
parameters can filter the results by month and year.

**Authentication required:** Yes

Query parameters:

  Parameter   Type        Required Allowed range
  ----------- --------- ---------- ---------------
  `month`     integer           No 1--12
  `year`      integer           No 2020--2100

Example:

``` http
GET /api/transactions?month=11&year=2026
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response --- `200 OK`:

``` json
[
  {
    "id": 10,
    "title": "Lunch",
    "amount": "250.00",
    "kind": "expense",
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Food",
      "kind": "expense"
    },
    "transaction_date": "2026-11-17",
    "note": "Lunch with friends"
  }
]
```

### 5.2 Create Transaction

`POST /api/transactions`

Creates a transaction for the authenticated user.

**Authentication required:** Yes

Request body:

``` json
{
  "title": "Lunch",
  "amount": 250.00,
  "kind": "expense",
  "category_id": 1,
  "transaction_date": "2026-11-17",
  "note": "Lunch with friends"
}
```

Successful response --- `201 Created`:

``` json
{
  "id": 10,
  "title": "Lunch",
  "amount": "250.00",
  "kind": "expense",
  "category_id": 1,
  "category": {
    "id": 1,
    "name": "Food",
    "kind": "expense"
  },
  "transaction_date": "2026-11-17",
  "note": "Lunch with friends"
}
```

The response includes the generated transaction ID and category details.

### 5.3 Update Transaction

`PUT /api/transactions/{transaction_id}`

Updates a transaction identified by its ID.

**Authentication required:** Yes

Path parameter:

  Parameter          Type        Required Description
  ------------------ --------- ---------- ---------------------------------
  `transaction_id`   integer          Yes ID of the transaction to update

Request body: send the transaction fields using the same schema as
Create Transaction.

``` json
{
  "title": "Dinner",
  "amount": 350.00,
  "kind": "expense",
  "category_id": 1,
  "transaction_date": "2026-11-17",
  "note": "Updated transaction"
}
```

Successful response --- `200 OK`: returns the updated transaction using
the `TransactionOut` response structure shown in the Create Transaction
section.

### 5.4 Delete Transaction

`DELETE /api/transactions/{transaction_id}`

Deletes a transaction identified by its ID.

**Authentication required:** Yes

Path parameter:

  Parameter          Type        Required Description
  ------------------ --------- ---------- ---------------------------------
  `transaction_id`   integer          Yes ID of the transaction to delete

Example:

``` http
DELETE /api/transactions/10
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response --- `200 OK`.

The OpenAPI specification does not define a response-body schema for
this endpoint, so the exact response body is not documented here.

------------------------------------------------------------------------

## 6. Budgets

Budgets allow the authenticated user to set an amount for a category for
a particular month and year.

### Budget fields

  ------------------------------------------------------------------------
  Field            Type                          Required Validation /
                                                          meaning
  ---------------- ---------------- --------------------- ----------------
  `category_id`    integer                            Yes Category ID

  `amount`         number or                          Yes Greater than 0;
                   numeric string                         maximum
                                                          999,999,999

  `month`          integer                            Yes 1--12

  `year`           integer                            Yes 2020--2100
  ------------------------------------------------------------------------

### 6.1 List Budgets

`GET /api/budgets`

Returns budgets for the authenticated user. The API specification
exposes optional `month` and `year` query parameters.

**Authentication required:** Yes

Example:

``` http
GET /api/budgets?month=11&year=2026
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response --- `200 OK`:

``` json
[
  {
    "id": 3,
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Food",
      "kind": "expense"
    },
    "amount": "5000.00",
    "month": 11,
    "year": 2026
  }
]
```

### 6.2 Create or Update Budget

`POST /api/budgets`

Creates a budget or performs the upsert operation described by the API's
operation summary.

**Authentication required:** Yes

Request body:

``` json
{
  "category_id": 1,
  "amount": 5000.00,
  "month": 11,
  "year": 2026
}
```

Successful response --- `201 Created`:

``` json
{
  "id": 3,
  "category_id": 1,
  "category": {
    "id": 1,
    "name": "Food",
    "kind": "expense"
  },
  "amount": "5000.00",
  "month": 11,
  "year": 2026
}
```

------------------------------------------------------------------------

## 7. Dashboard

### 7.1 Get Dashboard Data

`GET /api/dashboard`

Returns dashboard information for the authenticated user.

**Authentication required:** Yes

Headers:

``` http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Successful response --- `200 OK`.

**Response note:** The uploaded OpenAPI specification does not define
the dashboard response object's fields. Check the live FastAPI `/docs`
page or the backend route implementation for the exact response
structure before relying on specific fields.

------------------------------------------------------------------------

## 8. Public Endpoints

These endpoints do not require a Bearer token.

### 8.1 Root

`GET /`

Checks the root endpoint of the API.

Successful response --- `200 OK`.

The response schema is not specified in the uploaded OpenAPI document.

### 8.2 Health Check

`GET /health`

Checks the API health endpoint.

Successful response --- `200 OK`.

The response schema is not specified in the uploaded OpenAPI document.

------------------------------------------------------------------------

## 9. Data Models

This section summarizes the response models defined in the OpenAPI
specification.

### UserOut

  Field       Type               Required
  ----------- ---------------- ----------
  `id`        integer                 Yes
  `email`     string (email)          Yes
  `name`      string                  Yes
  `picture`   string or null           No

### CategoryOut

  Field    Type        Required
  -------- --------- ----------
  `id`     integer          Yes
  `name`   string           Yes
  `kind`   string           Yes

### TransactionOut

  Field                Type               Required
  -------------------- ---------------- ----------
  `id`                 integer                 Yes
  `title`              string                  Yes
  `amount`             string                  Yes
  `kind`               string                  Yes
  `category_id`        integer                 Yes
  `category`           CategoryOut             Yes
  `transaction_date`   date string             Yes
  `note`               string or null          Yes

### BudgetOut

  Field           Type            Required
  --------------- ------------- ----------
  `id`            integer              Yes
  `category_id`   integer              Yes
  `category`      CategoryOut          Yes
  `amount`        string               Yes
  `month`         integer              Yes
  `year`          integer              Yes

### AuthOut

  Field            Type                        Required
  ---------------- --------- --------------------------
  `access_token`   string                           Yes
  `token_type`     string      No; defaults to `bearer`
  `user`           UserOut                          Yes

------------------------------------------------------------------------

## 10. Error Handling

The OpenAPI specification explicitly documents `422` validation
responses for endpoints with validated request bodies or query/path
parameters.

### 422 Unprocessable Entity

This generally means that the request data did not satisfy the API's
validation rules.

Example response shape:

``` json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "String should have at least 1 character",
      "type": "string_too_short"
    }
  ]
}
```

The exact validation message depends on the invalid field and input.

### Authentication and other errors

Protected endpoints use HTTP Bearer authentication. The uploaded
specification does not enumerate all possible authentication, not-found,
or server-error response bodies/status codes. Confirm those details
against the running API and its implementation rather than assuming a
particular error format.

------------------------------------------------------------------------

## 11. Endpoint Quick Reference

  --------------------------------------------------------------------------------------------
  Method            Endpoint                               Purpose           Authentication
  ----------------- -------------------------------------- ----------------- -----------------
  `POST`            `/api/auth/google`                     Google login      No

  `GET`             `/api/auth/me`                         Get current user  Yes

  `GET`             `/api/categories`                      List categories   Yes

  `GET`             `/api/transactions`                    List/filter       Yes
                                                           transactions      

  `POST`            `/api/transactions`                    Create            Yes
                                                           transaction       

  `PUT`             `/api/transactions/{transaction_id}`   Update            Yes
                                                           transaction       

  `DELETE`          `/api/transactions/{transaction_id}`   Delete            Yes
                                                           transaction       

  `GET`             `/api/budgets`                         List budgets      Yes

  `POST`            `/api/budgets`                         Create/update     Yes
                                                           budget            

  `GET`             `/api/dashboard`                       Get dashboard     Yes
                                                           data              

  `GET`             `/`                                    Root endpoint     No

  `GET`             `/health`                              Health check      No
  --------------------------------------------------------------------------------------------

------------------------------------------------------------------------

## 12. Testing with FastAPI Swagger UI

FastAPI provides interactive API documentation when the backend is
running.

1.  Start the backend server from the backend project directory.
2.  Open `http://localhost:8000/docs` in your browser.
3.  Expand an endpoint to inspect its parameters, request body, and
    responses.
4.  For protected endpoints, click **Authorize** and enter the access
    token as required by the Swagger UI.
5.  Execute the request and inspect the response status and JSON.

You can also use the generated Postman collection to test the endpoints.

## 13. Testing with Postman

1.  Start the FastAPI backend.
2.  Open Postman and import your SmartSpend API collection.
3.  Set the `base_url` variable to your backend URL, for example
    `http://localhost:8000`.
4.  Complete Google login and obtain an application access token.
5.  Set the collection/environment `access_token` variable to that token
    if your collection does not save it automatically.
6.  Send the category request and use a real returned `category_id`.
7.  Test transaction creation, listing, updating, and deletion.
8.  Test budget creation/listing and dashboard retrieval.
9.  Try invalid values to check validation behavior.

Use test records when testing create, update, and delete operations.

## 14. Important Implementation Notes

-   Use a valid category ID returned by `GET /api/categories`; do not
    assume that category ID `1` exists.
-   Send dates in `YYYY-MM-DD` format.
-   Send positive amounts within the documented maximum.
-   Keep the access token private.
-   The `PUT` transaction endpoint expects the complete
    `TransactionCreate` request schema according to the OpenAPI
    document.
-   The OpenAPI document does not describe a transaction detail
    `GET /api/transactions/{transaction_id}` endpoint.
-   The dashboard, root, health, and delete response schemas are not
    fully described in the uploaded specification. Update this document
    if the backend implementation defines additional details.

------------------------------------------------------------------------

**Documentation status:** Generated from the project's OpenAPI 3.1.0
specification for SmartSpend API version 1.0.0. Verify examples and
undocumented response details against the running backend before
treating them as exact runtime behavior.
