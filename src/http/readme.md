maintaining backwards compatability while painting over api gateway has been a bit painful here so leaving some notes for a future refactor

# deprecated

- helpers/_url
- session
- validate
- _err-tmpl
- _err
- _fmt
- _response

# still useful

- `index`
- `helpers/_csrf`
- `_request`
- `_session-read`
- `_session-write`
- `helpers/_static`
- `_interpolate-params`
- `_url`

# ideal shape

```
http
|-helpers
| |-params
| |-crsf
| |-static
| '-url
|-session
| |-providers
| | |-jwe.js
| | '-ddb.js
| |-read
| '-write
|-request.js
|-response.js
'-index.js
```
