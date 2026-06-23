const res = await fetch('http://localhost:8080/api/auth/me', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer eyJhbGciOiJIUzM4NCJ9.eyJyb2xlIjoiQ1VTVE9NRVIiLCJ1c2VySWQiOjEyLCJjb2RlIjoiVVNSLTAwOSIsInN1YiI6ImhhaWxlMTExMjJrMUBnbWFpbC5jb20iLCJpYXQiOjE3Nzg0MTEyNTQsImV4cCI6MTc3ODQxMjE1NH0.i7xibgcHBVzLrINnFyZ523GUMg1Ut1djAOIAk5aGcG0UbQ_leI_evALhYLfsG2zi`
    }
})
const data = await res.json()
console.log(data)