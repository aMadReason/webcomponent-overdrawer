import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>Hello Vanilla!</h1>
<div>
  We use Parcel to bundle this sandbox, you can find more info about Parcel
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
  <button>Trigger</button>

  <wc-overdrawer data-position="bottom" data-open="false">
  
    Moo

    <button>Music</button>
  
  </wc-overdrawer>
</div>
`;

const menu = document.querySelector("wc-overdrawer");
const btn = document.querySelector("button");

btn.addEventListener("click", e => menu.open(e.target));
