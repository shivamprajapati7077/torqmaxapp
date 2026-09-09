import"./main-7TLzJnHq.js";import"./shop-vXpf2Dqa.js";function e(){return JSON.parse(localStorage.getItem(`torqmax_cart`)||`[]`)}function t(e){localStorage.setItem(`torqmax_cart`,JSON.stringify(e))}function n(){return e().reduce((e,t)=>{let n=typeof PRODUCTS<`u`?PRODUCTS.find(e=>e.id===t.id):null;return e+(n?n.price*t.qty:0)},0)}function r(){let t=e(),r=document.getElementById(`cart-body`),i=document.getElementById(`cart-empty`),a=document.getElementById(`cart-table`),o=document.getElementById(`order-box`);if(!r)return;if(!t.length){a&&(a.style.display=`none`),i&&(i.style.display=`block`),o&&(o.style.display=`none`);return}a&&(a.style.display=`table`),i&&(i.style.display=`none`),o&&(o.style.display=`block`),r.innerHTML=t.map(e=>{let t=PRODUCTS.find(t=>t.id===e.id);if(!t)return``;let n=t.price*e.qty;return`<tr>
      <td><div style="display:flex;align-items:center;gap:1rem">
        <img class="cart-item-img" src="${t.image}" alt="${t.name}">
        <div><div style="font-weight:600;font-size:.93rem">${t.name}</div></div>
      </div></td>
      <td>₹${t.price.toLocaleString(`en-IN`)}</td>
      <td><div class="qty-ctrl" style="display:inline-flex">
        <button onclick="changeQty('${t.id}',-1)">−</button>
        <span>${e.qty}</span>
        <button onclick="changeQty('${t.id}',1)">+</button>
      </div></td>
      <td style="font-weight:700">₹${n.toLocaleString(`en-IN`)}</td>
      <td><button onclick="removeItem('${t.id}')" style="background:none;border:none;color:#dc2626;font-size:1.1rem;cursor:pointer">✕</button></td>
    </tr>`}).join(``);let s=n(),c=s>=2e3?0:99,l=document.getElementById(`order-summary`);l&&(l.innerHTML=`
    <div class="order-row"><span>Subtotal</span><span>₹${s.toLocaleString(`en-IN`)}</span></div>
    <div class="order-row"><span>Shipping</span><span>${c===0?`<span style="color:#16a34a">FREE</span>`:`₹`+c}</span></div>
    <div class="order-total"><span>Total</span><span>₹${(s+c).toLocaleString(`en-IN`)}</span></div>`)}window.changeQty=function(n,i){let a=e(),o=a.find(e=>e.id===n);o&&(o.qty+=i,o.qty<=0&&a.splice(a.indexOf(o),1)),t(a),r(),typeof updateCartBadge==`function`&&updateCartBadge()},window.removeItem=function(n){t(e().filter(e=>e.id!==n)),r(),typeof updateCartBadge==`function`&&updateCartBadge()},document.getElementById(`checkout-form`)?.addEventListener(`submit`,function(n){if(n.preventDefault(),!e().length){showToast(`Your cart is empty!`);return}t([]),document.querySelector(`.cart-container`).innerHTML=`
    <div style="text-align:center;padding:5rem 2rem">
      <div style="font-size:4rem;margin-bottom:1rem">✅</div>
      <h2 style="font-family:'Poppins',sans-serif;color:var(--teal-dark);font-size:2rem;margin-bottom:1rem">Order Placed!</h2>
      <p style="color:var(--text-muted);margin-bottom:2rem">Your TorqMax mats are on their way. We'll send tracking details to your email. 🚗</p>
      <a href="shop.html" class="btn btn-teal">Continue Shopping →</a>
    </div>`}),r();