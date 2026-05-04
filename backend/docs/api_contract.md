# Weave Our Tapestry - API Contrac(Generated)

## Base URL
Local: http://127.0.0.1:8000/api

---

## GET /stories

Returns:
[
  {
    "id": number,
    "title": string,
    "culture": string | null,
    "text": string,
    "views": number
  }
]

---

## POST /stories

Request:
{
  "title": string,
  "culture": string | null,
  "text": string
}

Response:
{
  "id": number,
  "title": string,
  "culture": string | null,
  "text": string,
  "views": number
}

---

## GET /stories/{id}

Response:
{
  "id": number,
  "title": string,
  "culture": string | null,
  "text": string,
  "views": number
}

Error (404):
{
  "detail": "Story not found"
}

---

## POST /stories/{id}/views

Response:
{
  "id": number,
  "views": number
}

---

## GET /stories/{id}/comments

Returns comments for a story, oldest first. No auth required.

Response:
[
  {
    "id": number,
    "story_id": number,
    "text": string,
    "author": string,
    "created_at": string
  }
]

Error (404):
{
  "detail": "Story not found"
}

---

## POST /stories/{id}/comments

Posts a comment on a story. Requires `Authorization: Bearer <token>`.

Request:
{
  "text": string
}

Response (201):
{
  "id": number,
  "story_id": number,
  "text": string,
  "author": string,
  "created_at": string
}

Errors:
- 400: `{"detail": "Comment text is required"}` (empty / whitespace-only text)
- 401: invalid or missing token
- 404: `{"detail": "Story not found"}`

---

## GET /search

Query Params:
- q (required)
- limit (default 10)
- offset (default 0)
- sort (views | newest | relevance)

Response:
{
  "query": string,
  "total": number,
  "results": [
    {
      "id": number,
      "title": string,
      "culture": string | null,
      "snippet": string,
      "views": number
    }
  ]
}