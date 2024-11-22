export const fetchHelloWorld = () => {
  return fetch("http://localhost:5000")
    .then(res => res.json())
    .then(r => {console.log(r); return r})
}
