
const DEFAULT_MENU = [
  {id:"butter-chicken", name:"Butter Chicken", category:"Bowls", price:10.99, emoji:"🍛", available:true},
  {id:"chicken-tikka-masala", name:"Chicken Tikka Masala", category:"Bowls", price:10.99, emoji:"🍛", available:true},
  {id:"afghani-chicken", name:"Afghani Chicken", category:"Bowls", price:10.99, emoji:"🍗", available:true},
  {id:"chicken-curry", name:"Chicken Curry", category:"Bowls", price:10.99, emoji:"🍛", available:true},
  {id:"chana-masala", name:"Chana Masala", category:"Bowls", price:10.99, emoji:"🥣", available:true},
  {id:"shahi-paneer", name:"Shahi Paneer", category:"Bowls", price:10.99, emoji:"🧀", available:true},
  {id:"matar-paneer", name:"Matar Paneer", category:"Bowls", price:10.99, emoji:"🫛", available:true},

  {id:"samosa-chaat", name:"Samosa Chaat", category:"Street Food", price:6.99, emoji:"🥟", available:true},
  {id:"butter-chicken-taco", name:"Butter Chicken Taco", category:"Tacos", price:3.99, emoji:"🌮", available:true},
  {id:"chicken-tikka-taco", name:"Chicken Tikka Taco", category:"Tacos", price:3.99, emoji:"🌮", available:true},
  {id:"paneer-tikka-taco", name:"Paneer Tikka Taco", category:"Tacos", price:3.99, emoji:"🌮", available:true},

  {id:"chicken-kebab-burger", name:"Chicken Kebab Burger", category:"Burgers & Wraps", price:6.99, emoji:"🍔", available:true},
  {id:"kebab-burger-combo", name:"Kebab Burger Combo", category:"Combos", price:9.99, emoji:"🍔", available:true},
  {id:"butter-chicken-wrap", name:"Butter Chicken Wrap", category:"Burgers & Wraps", price:8.99, emoji:"🌯", available:true},
  {id:"chicken-tikka-wrap", name:"Chicken Tikka Wrap", category:"Burgers & Wraps", price:8.99, emoji:"🌯", available:true},

  {id:"french-fries", name:"French Fries", category:"Sides", price:3.49, emoji:"🍟", available:true},
  {id:"mango-lassi", name:"Mango Lassi", category:"Drinks", price:3.99, emoji:"🥭", available:true},
  {id:"rooh-afza", name:"Rooh Afza", category:"Drinks", price:2.99, emoji:"🥤", available:true},
  {id:"jeera-water", name:"Jeera Water", category:"Drinks", price:2.99, emoji:"🧊", available:true},
  {id:"soft-drink", name:"Soft Drink", category:"Drinks", price:1.99, emoji:"🥤", available:true}
];

const DEFAULT_SETTINGS = {
  taxRate: 6,
  restaurantName: "Tikka Box",
  phone: "616-844-9044",
  address: "220 N Beacon Blvd, Grand Haven, MI"
};

let menu = JSON.parse(localStorage.getItem("tb_menu") || "null") || structuredClone(DEFAULT_MENU);
let settings = JSON.parse(localStorage.getItem("tb_settings") || "null") || {...DEFAULT_SETTINGS};
let sales = JSON.parse(localStorage.getItem("tb_sales") || "[]");
let cart = [];
let selectedCategory = "All";
let orderType = "Pickup";
let lastSale = null;

const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(n)||0);
const todayKey = () => new Date().toISOString().slice(0,10);

function saveAll(){
  localStorage.setItem("tb_menu", JSON.stringify(menu));
  localStorage.setItem("tb_settings", JSON.stringify(settings));
  localStorage.setItem("tb_sales", JSON.stringify(sales));
}
function toast(msg){
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  setTimeout(()=>$("toast").classList.remove("show"),1800);
}
function categories(){
  return ["All", ...new Set(menu.map(i=>i.category))];
}
function renderCategories(){
  $("categoryTabs").innerHTML = categories().map(c =>
    `<button class="category-tab ${c===selectedCategory?"active":""}" data-cat="${c}">${c}</button>`
  ).join("");
  document.querySelectorAll(".category-tab").forEach(btn=>btn.onclick=()=>{
    selectedCategory=btn.dataset.cat; renderCategories(); renderMenu();
  });
}
function renderMenu(){
  const items = menu.filter(i=>selectedCategory==="All" || i.category===selectedCategory);
  $("menuGrid").innerHTML = items.map(i=>`
    <button class="menu-item ${i.available?"":"sold-out"}" data-id="${i.id}" ${i.available?"":"disabled"}>
      <span class="emoji">${i.emoji||"🍽️"}</span>
      <span class="item-name">${i.name}</span>
      <strong class="price">${money(i.price)}</strong>
    </button>
  `).join("");
  document.querySelectorAll(".menu-item").forEach(btn=>btn.onclick=()=>addItem(btn.dataset.id));
}
function addItem(id){
  const item = menu.find(i=>i.id===id);
  if(!item || !item.available) return;
  const line = cart.find(i=>i.id===id);
  if(line) line.qty++;
  else cart.push({...item,qty:1});
  renderCart();
}
function changeQty(id,delta){
  const line=cart.find(i=>i.id===id);
  if(!line)return;
  line.qty+=delta;
  if(line.qty<=0) cart=cart.filter(i=>i.id!==id);
  renderCart();
}
function totals(){
  const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
  const tax=subtotal*(settings.taxRate/100);
  return {subtotal,tax,total:subtotal+tax};
}
function renderCart(){
  if(!cart.length){
    $("cartItems").innerHTML='<div class="empty-state">Tap a menu item to begin.</div>';
  } else {
    $("cartItems").innerHTML=cart.map(i=>`
      <div class="cart-row">
        <div>
          <div class="name">${i.name}</div>
          <div class="unit">${money(i.price)} each · ${money(i.price*i.qty)}</div>
        </div>
        <div class="qty-controls">
          <button onclick="changeQty('${i.id}',-1)">−</button>
          <strong>${i.qty}</strong>
          <button onclick="changeQty('${i.id}',1)">+</button>
          <button class="remove" onclick="changeQty('${i.id}',-${i.qty})">×</button>
        </div>
      </div>`).join("");
  }
  const t=totals();
  $("subtotal").textContent=money(t.subtotal);
  $("tax").textContent=money(t.tax);
  $("total").textContent=money(t.total);
  $("taxRateLabel").textContent=`(${settings.taxRate}%)`;
}
function nextOrderNumber(){
  const date=todayKey();
  return sales.filter(s=>s.date===date).length+1;
}
function updateOrderNumber(){
  $("orderNumber").textContent=`Order #${nextOrderNumber()}`;
}
function newOrder(){
  cart=[];
  $("customerName").value="";
  $("orderNotes").value="";
  orderType="Pickup";
  document.querySelectorAll(".toggle").forEach(b=>b.classList.toggle("active",b.dataset.orderType==="Pickup"));
  renderCart(); updateOrderNumber();
}
function requireCart(){
  if(!cart.length){toast("Add at least one item"); return false}
  return true;
}
function openCash(){
  if(!requireCart())return;
  const t=totals();
  $("cashAmountDue").textContent=money(t.total);
  $("cashReceived").value="";
  $("changeDue").textContent=money(0);
  const amounts=[Math.ceil(t.total),20,50,100].filter((v,i,a)=>v>=t.total && a.indexOf(v)===i);
  $("quickCash").innerHTML=amounts.map(a=>`<button type="button" data-amt="${a}">${money(a)}</button>`).join("");
  document.querySelectorAll("#quickCash button").forEach(b=>b.onclick=()=>{
    $("cashReceived").value=b.dataset.amt; updateChange();
  });
  $("cashDialog").showModal();
}
function updateChange(){
  const due=totals().total;
  const received=Number($("cashReceived").value||0);
  $("changeDue").textContent=money(Math.max(0,received-due));
}
function completeSale(payment, cashReceived=null){
  const t=totals();
  const sale={
    id:crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date:todayKey(),
    timestamp:new Date().toISOString(),
    orderNumber:nextOrderNumber(),
    orderType,
    customerName:$("customerName").value.trim(),
    notes:$("orderNotes").value.trim(),
    items:cart.map(i=>({id:i.id,name:i.name,price:i.price,qty:i.qty})),
    subtotal:t.subtotal,tax:t.tax,total:t.total,
    payment,
    cashReceived,
    change:cashReceived==null?null:Math.max(0,cashReceived-t.total)
  };
  sales.push(sale); saveAll(); lastSale=sale;
  $("cashDialog").close(); $("cardDialog").close();
  showReceipt(sale); newOrder();
}
function showReceipt(sale){
  $("receiptPreview").innerHTML=receiptHTML(sale,false);
  $("receiptDialog").showModal();
}
function receiptHTML(sale,kitchen=false){
  const when=new Date(sale.timestamp);
  const lines=sale.items.map(i=>`
    <div class="receipt-line"><span>${i.qty} × ${i.name}</span><span>${kitchen?"":money(i.price*i.qty)}</span></div>`
  ).join("");
  if(kitchen){
    return `<div class="receipt-paper">
      <h2>KITCHEN TICKET</h2>
      <p><strong>ORDER #${sale.orderNumber}</strong></p>
      <p>${sale.orderType} · ${when.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}</p>
      ${sale.customerName?`<p>Customer: <strong>${sale.customerName}</strong></p>`:""}
      <div class="receipt-rule"></div>${lines}
      ${sale.notes?`<div class="receipt-rule"></div><p style="text-align:left"><strong>NOTES:</strong> ${sale.notes}</p>`:""}
    </div>`;
  }
  return `<div class="receipt-paper">
    <h2>${settings.restaurantName}</h2>
    <p>${settings.address}</p><p>${settings.phone}</p>
    <div class="receipt-rule"></div>
    <p>Order #${sale.orderNumber} · ${sale.orderType}</p>
    <p>${when.toLocaleString()}</p>
    ${sale.customerName?`<p>Customer: ${sale.customerName}</p>`:""}
    <div class="receipt-rule"></div>${lines}
    <div class="receipt-rule"></div>
    <div class="receipt-line"><span>Subtotal</span><span>${money(sale.subtotal)}</span></div>
    <div class="receipt-line"><span>Tax</span><span>${money(sale.tax)}</span></div>
    <div class="receipt-line"><strong>Total</strong><strong>${money(sale.total)}</strong></div>
    <div class="receipt-line"><span>Payment</span><span>${sale.payment}</span></div>
    ${sale.cashReceived!=null?`<div class="receipt-line"><span>Cash</span><span>${money(sale.cashReceived)}</span></div><div class="receipt-line"><span>Change</span><span>${money(sale.change)}</span></div>`:""}
    ${sale.notes?`<div class="receipt-rule"></div><p style="text-align:left"><strong>Notes:</strong> ${sale.notes}</p>`:""}
    <div class="receipt-rule"></div><p>Thank you!</p>
  </div>`;
}
function printHTML(html,title){
  const win=window.open("","_blank","width=520,height=720");
  win.document.write(`<html><head><title>${title}</title><style>
  body{font-family:ui-monospace,monospace;padding:18px;color:#000}
  .receipt-paper{max-width:360px;margin:auto}.receipt-line{display:flex;justify-content:space-between;gap:12px;margin:6px 0}
  .receipt-rule{border-top:1px dashed #000;margin:10px 0}h2,p{text-align:center;margin:4px 0}
  </style></head><body>${html}</body></html>`);
  win.document.close();
  setTimeout(()=>{win.focus();win.print();},250);
}
function renderReports(){
  const todays=sales.filter(s=>s.date===todayKey());
  $("todaySales").textContent=money(todays.reduce((a,s)=>a+s.total,0));
  $("todayOrders").textContent=todays.length;
  $("todayCash").textContent=money(todays.filter(s=>s.payment==="Cash").reduce((a,s)=>a+s.total,0));
  $("todayCard").textContent=money(todays.filter(s=>s.payment==="Card").reduce((a,s)=>a+s.total,0));
  $("reportRows").innerHTML=todays.slice().reverse().map(s=>`
    <tr><td>${new Date(s.timestamp).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</td>
    <td>#${s.orderNumber}</td><td>${s.payment}</td><td>${money(s.total)}</td></tr>
  `).join("") || '<tr><td colspan="4">No sales today.</td></tr>';
}
function exportCSV(){
  const rows=[["Date","Time","Order","Type","Payment","Subtotal","Tax","Total","Customer","Notes","Items"]];
  sales.forEach(s=>rows.push([
    s.date,new Date(s.timestamp).toLocaleTimeString(),s.orderNumber,s.orderType,s.payment,
    s.subtotal.toFixed(2),s.tax.toFixed(2),s.total.toFixed(2),s.customerName,s.notes,
    s.items.map(i=>`${i.qty}x ${i.name}`).join("; ")
  ]));
  const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const blob=new Blob([csv],{type:"text/csv"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`tikka-box-sales-${todayKey()}.csv`; a.click();
}
function renderEditor(){
  $("taxRateInput").value=settings.taxRate;
  $("restaurantNameInput").value=settings.restaurantName;
  $("phoneInput").value=settings.phone;
  $("addressInput").value=settings.address;
  $("menuEditor").innerHTML=menu.map((i,idx)=>`
    <div class="editor-row">
      <input data-field="name" data-index="${idx}" value="${i.name.replaceAll('"','&quot;')}" />
      <input data-field="price" data-index="${idx}" type="number" step="0.01" min="0" value="${i.price}" />
      <label><input data-field="available" data-index="${idx}" type="checkbox" ${i.available?"checked":""}/> Available</label>
    </div>`).join("");
}
function saveSettings(){
  settings.taxRate=Number($("taxRateInput").value||0);
  settings.restaurantName=$("restaurantNameInput").value.trim()||"Tikka Box";
  settings.phone=$("phoneInput").value.trim();
  settings.address=$("addressInput").value.trim();
  document.querySelectorAll("#menuEditor input[data-index]").forEach(el=>{
    const i=Number(el.dataset.index), field=el.dataset.field;
    if(field==="name") menu[i].name=el.value.trim()||menu[i].name;
    if(field==="price") menu[i].price=Number(el.value||0);
    if(field==="available") menu[i].available=el.checked;
  });
  saveAll(); renderCategories(); renderMenu(); renderCart(); $("manageDialog").close(); toast("Changes saved");
}

$("newOrderBtn").onclick=()=>{if(cart.length && !confirm("Clear the current order?"))return;newOrder()};
$("clearCartBtn").onclick=()=>{if(cart.length && confirm("Clear this order?"))newOrder()};
document.querySelectorAll(".toggle").forEach(b=>b.onclick=()=>{
  orderType=b.dataset.orderType;
  document.querySelectorAll(".toggle").forEach(x=>x.classList.toggle("active",x===b));
});
$("cashBtn").onclick=openCash;
$("cashReceived").oninput=updateChange;
$("completeCashBtn").onclick=()=>{
  const received=Number($("cashReceived").value||0), due=totals().total;
  if(received<due){toast("Cash received is less than total");return}
  completeSale("Cash",received);
};
$("cardBtn").onclick=()=>{
  if(!requireCart())return;
  $("cardAmountDue").textContent=money(totals().total);
  $("cardDialog").showModal();
};
$("completeCardBtn").onclick=()=>completeSale("Card");
$("closeReceiptBtn").onclick=()=>$("receiptDialog").close();
$("printReceiptBtn").onclick=()=>lastSale&&printHTML(receiptHTML(lastSale,false),"Receipt");
$("printKitchenBtn").onclick=()=>lastSale&&printHTML(receiptHTML(lastSale,true),"Kitchen Ticket");
$("reportsBtn").onclick=()=>{renderReports();$("reportsDialog").showModal()};
$("closeReportsBtn").onclick=()=>$("reportsDialog").close();
$("exportSalesBtn").onclick=exportCSV;
$("clearSalesBtn").onclick=()=>{
  if(confirm("Permanently delete all saved sales?")){
    sales=[];saveAll();renderReports();updateOrderNumber();toast("Sales data cleared");
  }
};
$("manageBtn").onclick=()=>{renderEditor();$("manageDialog").showModal()};
$("closeManageBtn").onclick=()=>$("manageDialog").close();
$("saveSettingsBtn").onclick=saveSettings;
$("resetMenuBtn").onclick=()=>{
  if(confirm("Reset the menu and prices to the original defaults?")){
    menu=structuredClone(DEFAULT_MENU);renderEditor();toast("Default menu restored. Tap Save Changes.");
  }
};

renderCategories();renderMenu();renderCart();updateOrderNumber();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));
}
