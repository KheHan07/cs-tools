# Customer Service

## Version: 1

---

## POST /contacts/search

### Summary

Get a list of contacts for given filters.

---

### Request Parameters

| Name  | Located In | Description     | Required | Schema |
| :--- | :--- | :--- | :--- | :--- |
| Input | Payload   | Contact filters | Optional | See Schema Below |

**Request Body Schema:**

```json
{
  "email": "user@wso2.com"
}
json```

**Responses**

[
  {
    "id": "C001",
    "email": "user@wso2.com",
    "account": {
      "id": "A101"
    }
  },
  {
    "id": "C002",
    "email": "user2@wso2.com",
    "account": null
  }
]
