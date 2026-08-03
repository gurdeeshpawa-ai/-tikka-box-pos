const defaultMenu = [
  {id: crypto.randomUUID(), name:'Butter Chicken Bowl', category:'Bowls', price:10.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Chicken Tikka Masala Bowl', category:'Bowls', price:10.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Chicken Curry Bowl', category:'Bowls', price:10.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Chana Masala Bowl', category:'Bowls', price:10.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Chili Chicken Bowl', category:'Bowls', price:10.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Afghani Chicken Bowl', category:'Bowls', price:10.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Combo Plate', category:'Combos', price:12.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Chicken Kebab Burger Combo', category:'Combos', price:9.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Butter Chicken Taco', category:'Tacos', price:3.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Chicken Tikka Masala Taco', category:'Tacos', price:3.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Paneer Tikka Taco', category:'Tacos', price:3.99, soldOut:false},
  {id: crypto.randomUUID(), name:'French Fries', category:'Sides', price:3.49, soldOut:false},
  {id: crypto.randomUUID(), name:'Mango Lassi', category:'Drinks', price:3.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Soft Drink', category:'Drinks', price:1.99, soldOut:false},
  {id: crypto.randomUUID(), name:'Water', category:'Drinks', price:1.99, soldOut:false}
];

let menu = JSON.parse(localStorage.getItem('tb_menu') || 'null') || defaultMenu;
let taxRate = Number(localStorage.getItem('tb_tax') || 6);
let sales = JSON.parse(localStorage.getItem('tb_sales') || '[]');
let cart = [];
let selectedCategory = 'All';
let orderType = 'Pickup';

const $ = id => document.getElementById(id);
const money = n => `$${Number(n).toFixed(2)}`;
const saveMenu = () => localStorage.setItem('tb_menu', JSON.stringify(menu));
const saveSales = () => localStorage.setItem('tb_sales', JSON.stringify(sales));

function renderCategories(){
  const cats = ['All', ...new Set(menu.map(x=>x.category))];
  $('categoryTabs').innerHTML = cats.map(c=>`<button class="${c===selectedCategory?'active':''}" data-cat="${c}">${c}</button>`).join('');
  document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{selectedCategory=b.dataset.cat;renderCategories();renderMenu();});
}
function renderMenu(){
  const items = selectedCategory==='All'?menu:menu.filter(x=>x.category===selectedCategory);
  $('menuGrid').innerHTML = items.map(i=>`
    <button class="menu-item ${i.soldOut?'soldout':''}" data-id="${i.id}" ${i.soldOut?'disabled':''}>
      <span>${i.name}${i.soldOut?' — SOLD OUT':''}</span><span class="price">${money(i.price)}</span>
    </button>`).join('');
  document.querySelectorAll('.menu-item').forEach(b=>b.onclick=()=>addToCart(b.dataset.id));
}
function addToCart(id){
  const item=menu.find(x=>x.id===id); if(!item||item.soldOut)return;
  const found=cart.find(x=>x.id===id); found?found.qty++:cart.push({...item,qty:1});
  renderCart();
}
function renderCart(){
  $('cartItems').innerHTML = cart.length?cart.map(i=>`
    <div class="cart-row">
      <div><strong>${i.name}</strong><br>${money(i.price*i.qty)}</div>
      <div class="qty"><button data-minus="${i.id}">−</button><span>${i.qty}</span><button data-plus="${i.id}">+</button></div>
    </div>`).join(''):'<p>No items yet.</p>';
  document.querySelectorAll('[data-minus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.minus,-1));
  document.querySelectorAll('[data-plus]').forEach(b=>b.onclick=()=>changeQty(b.dataset.plus,1));
  updateTotals();
}
function changeQty(id,d){const i=cart.find(x=>x.id===id);if(!i)return;i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);renderCart();}
function totals(){
  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tax=subtotal*(taxRate/100);
  return {subtotal,tax,total:subtotal+tax};
}
function updateTotals(){const t=totals();$('subtotal').textContent=money(t.subtotal);$('tax').textContent=money(t.tax);$('total').textContent=money(t.total);}
function completeSale(method,cashReceived=null){
  if(!cart.length){alert('Add at least one item.');return;}
  const t=totals();
  const sale={id:Date.now(),date:new Date().toISOString(),orderType,method,cashReceived,change:cashReceived===null?null:cashReceived-t.total,notes:$('orderNotes').value,items:cart.map(x=>({...x})),...t};
  sales.push(sale);saveSales();printReceipt(sale);cart=[];$('orderNotes').value='';renderCart();
}
function printReceipt(sale){
  const area=document.createElement('div');area.className='print-area receipt';
  area.innerHTML=`<h2>Tikka Box</h2><p>${new Date(sale.date).toLocaleString()}</p><p>${sale.orderType} • ${sale.method}</p><hr>
  ${sale.items.map(i=>`<p>${i.qty} x ${i.name}<br>${money(i.price*i.qty)}</p>`).join('')}
  <hr><p>Subtotal: ${money(sale.subtotal)}</p><p>Tax: ${money(sale.tax)}</p><h3>Total: ${money(sale.total)}</h3>
  ${sale.notes?`<p>Notes: ${sale.notes}</p>`:''}<p>Thank you!</p>`;
  document.body.appendChild(area);window.print();area.remove();
}
function resetForm(){['editId','itemName','itemCategory','itemPrice'].forEach(id=>$(id).value='');$('itemSoldOut').checked=false;}
function renderSettingsList(){
  $('settingsMenuList').innerHTML=menu.map(i=>`<div class="settings-item">
    <div><strong>${i.name}</strong><br>${i.category} • ${money(i.price)}${i.soldOut?' • SOLD OUT':''}</div>
    <button data-edit="${i.id}">Edit</button><button data-toggle="${i.id}">${i.soldOut?'In Stock':'Sold Out'}</button><button data-delete="${i.id}">Delete</button>
  </div>`).join('');
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editItem(b.dataset.edit));
  document.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>toggleSoldOut(b.dataset.toggle));
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteItem(b.dataset.delete));
}
function editItem(id){const i=menu.find(x=>x.id===id);$('editId').value=i.id;$('itemName').value=i.name;$('itemCategory').value=i.category;$('itemPrice').value=i.price;$('itemSoldOut').checked=i.soldOut;}
function toggleSoldOut(id){const i=menu.find(x=>x.id===id);i.soldOut=!i.soldOut;saveMenu();renderAll();}
function deleteItem(id){if(confirm('Delete this menu item?')){menu=menu.filter(x=>x.id!==id);saveMenu();renderAll();}}
function saveItem(){
  const name=$('itemName').value.trim(),category=$('itemCategory').value.trim(),price=Number($('itemPrice').value),id=$('editId').value;
  if(!name||!category||Number.isNaN(price)){alert('Enter name, category, and price.');return;}
  const obj={id:id||crypto.randomUUID(),name,category,price,soldOut:$('itemSoldOut').checked};
  if(id) menu=menu.map(x=>x.id===id?obj:x); else menu.push(obj);
  saveMenu();resetForm();renderAll();
}
function todaySales(){const d=new Date().toDateString();return sales.filter(s=>new Date(s.date).toDateString()===d);}
function renderReport(){
  const t=todaySales(), cash=t.filter(s=>s.method==='Cash').reduce((a,s)=>a+s.total,0), card=t.filter(s=>s.method==='Card').reduce((a,s)=>a+s.total,0);
  $('reportContent').innerHTML=`<p><strong>Orders:</strong> ${t.length}</p><p><strong>Cash:</strong> ${money(cash)}</p><p><strong>Card:</strong> ${money(card)}</p><p><strong>Total sales:</strong> ${money(cash+card)}</p>
  <table class="report-table"><thead><tr><th>Time</th><th>Type</th><th>Payment</th><th>Total</th></tr></thead><tbody>
  ${t.map(s=>`<tr><td>${new Date(s.date).toLocaleTimeString()}</td><td>${s.orderType}</td><td>${s.method}</td><td>${money(s.total)}</td></tr>`).join('')}</tbody></table>`;
}
function exportCSV(){
  const rows=[['Date','Order ID','Order Type','Payment','Subtotal','Tax','Total','Notes']];
  sales.forEach(s=>rows.push([s.date,s.id,s.orderType,s.method,s.subtotal.toFixed(2),s.tax.toFixed(2),s.total.toFixed(2),s.notes||'']));
  const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='tikka-box-sales.csv';a.click();
}
function renderAll(){renderCategories();renderMenu();renderCart();renderSettingsList();}

document.querySelectorAll('.type-btn').forEach(b=>b.onclick=()=>{orderType=b.dataset.type;document.querySelectorAll('.type-btn').forEach(x=>x.classList.toggle('active',x===b));});
$('clearBtn').onclick=()=>{if(confirm('Clear this order?')){cart=[];renderCart();}};
$('settingsBtn').onclick=()=>{$('taxRateInput').value=taxRate;renderSettingsList();$('settingsDialog').showModal();};
$('saveTaxBtn').onclick=()=>{taxRate=Number($('taxRateInput').value)||0;localStorage.setItem('tb_tax',taxRate);updateTotals();alert('Tax saved.');};
$('saveItemBtn').onclick=saveItem;$('resetItemBtn').onclick=resetForm;
$('cashBtn').onclick=()=>{if(!cart.length)return alert('Add items first.');$('cashTotal').textContent=money(totals().total);$('cashReceived').value='';$('changeDue').textContent='$0.00';$('cashDialog').showModal();};
$('cashReceived').oninput=()=>{$('changeDue').textContent=money(Math.max(0,Number($('cashReceived').value||0)-totals().total));};
$('completeCashBtn').onclick=e=>{const r=Number($('cashReceived').value);if(r<totals().total){e.preventDefault();alert('Cash received is less than total.');return;}completeSale('Cash',r);};
$('cardBtn').onclick=()=>{if(confirm('Was the card approved on your external terminal?'))completeSale('Card');};
$('reportBtn').onclick=()=>{renderReport();$('reportDialog').showModal();};
$('exportBtn').onclick=exportCSV;

if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}
renderAll();
