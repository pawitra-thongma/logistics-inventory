// UI helpers & rendering (async-ready)
const UI = (()=>{
  const el = id => document.getElementById(id);

  function toast(message, type='success'){
    const toast = document.createElement('div');
    toast.className = `fixed top-20 left-4 right-4 p-4 rounded-xl text-white z-50 ${type==='success'?'bg-green-500':'bg-red-500'}`;
    toast.innerHTML = `<div class="flex items-center space-x-2"><i class="fas fa-${type==='success'?'check':'exclamation'}-circle"></i><span>${message}</span></div>`;
    document.body.appendChild(toast);
    setTimeout(()=> toast.remove(), 2500);
  }

  function showSection(event, id){
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    el(id).classList.remove('hidden');
    if (event && event.target){
      document.querySelectorAll('.mobile-nav-item').forEach(i=>i.classList.remove('active'));
      event.target.closest('.mobile-nav-item').classList.add('active');
    }
    // hide user menu & notif
    el('userMenu')?.classList.add('hidden');
    el('notifPanel')?.classList.add('hidden');
  }

  // ===== Stats =====
  async function renderStats(){
    const products = await Store.listProducts();
    const total = products.reduce((a,b)=> a + (Number(b.stock)||0), 0);
    el('statTotalStock').textContent = total.toLocaleString();

    const users = await Store.listUsers();
    el('statUserCount').textContent = users.length.toLocaleString();

    const pending = (await Store.listPendingUsers()).length;
    el('statPending').textContent = pending.toLocaleString();

    await renderActivities();
    await renderLowStock();
  }

  async function renderActivities(){
    const list = el('activityList'); if (!list) return;
    const items = (await Store.getActivities()).slice(0,10);
    list.innerHTML = '';
    if (items.length===0){
      list.innerHTML = '<div class="text-gray-500 text-sm">ยังไม่มีกิจกรรม</div>';
      return;
    }
    items.forEach(a=>{
      const row = document.createElement('div');
      const colorMap = {add:'bg-green-50', edit:'bg-blue-50', delete:'bg-red-50', user:'bg-purple-50'};
      row.className = `flex items-center space-x-3 p-3 rounded-xl ${colorMap[a.type]||'bg-gray-50'}`;
      row.innerHTML = `<div class="w-8 h-8 rounded-full flex items-center justify-center ${a.type==='add'?'bg-green-500':a.type==='edit'?'bg-blue-500':a.type==='delete'?'bg-red-500':'bg-purple-500'}">
        <i class="fas ${a.type==='add'?'fa-plus':a.type==='edit'?'fa-pen':a.type==='delete'?'fa-trash':'fa-user'} text-white text-xs"></i></div>
        <div class="flex-1"><p class="text-sm font-medium text-gray-800">${a.text}</p>
        <p class="text-xs text-gray-500">${new Date(a.ts).toLocaleString()}</p></div>`;
      list.appendChild(row);
    });
  }

  // ===== Low stock (bottom of dashboard) =====
  async function renderLowStock(){
    const box = document.getElementById('lowStockBox');
    if (!box) return;
    const THRESHOLD = 10; // เกณฑ์ "เหลือน้อย"
    let items = (await Store.listProducts()).filter(p => Number(p.stock) <= THRESHOLD)
      .sort((a,b)=> (a.stock||0)-(b.stock||0));
    box.innerHTML = '';
    if (items.length === 0){
      box.innerHTML = '<div class="text-gray-500 text-sm">ยังไม่มีสินค้าใกล้หมด</div>';
      return;
    }
    items.forEach(p=>{
      const row = document.createElement('div');
      const statusClass = p.stock<=0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
      const statusText = p.stock<=0 ? 'หมด' : `เหลือ ${p.stock}`;
      row.className = 'flex items-center justify-between p-3 rounded-xl bg-gray-50';
      row.innerHTML = `
        <div>
          <p class="text-sm font-medium text-gray-800">${p.name} <span class="text-xs text-gray-400">(${p.code})</span></p>
          <p class="text-xs text-gray-500">${p.category} • ฿${p.price}</p>
        </div>
        <span class="status-badge ${statusClass}">${statusText}</span>
      `;
      box.appendChild(row);
    });
  }

  // ===== Products List =====
  async function renderProductsList(keyword=''){
    const list = el('productsListMobile'); if (!list) return;
    const you = Store.getCurrentUser();
    const canEdit = !!you; // both roles can manage products

    let items = await Store.listProducts();
    if (keyword) items = items.filter(p => (p.name+p.code+p.category).toLowerCase().includes(keyword.toLowerCase()));
    list.innerHTML = '';
    if (items.length===0){
      list.innerHTML = '<div class="text-center text-gray-500 py-6">ไม่พบสินค้า</div>';
      return;
    }
    items.forEach(p=>{
      const card = document.createElement('div');
      card.className='mobile-card';
      const statusClass = p.stock<=0 ? 'bg-red-100 text-red-800' : (p.stock<=10 ? 'bg-yellow-100 text-yellow-800':'bg-green-100 text-green-800');
      const statusText  = p.stock<=0 ? 'หมด' : `เหลือ ${p.stock}`;
      const icon = p.category==='เครื่องดื่ม' ? 'fa-bottle-water text-blue-500' : p.category==='ขนม' ? 'fa-bread-slice text-orange-500' : 'fa-box text-gray-500';
      card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center"><i class="fas ${icon}"></i></div>
            <div>
              <h3 class="font-medium text-gray-800">${p.name}</h3>
              <p class="text-sm text-gray-500">${p.code} • ${p.category}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-gray-800">฿${p.price}</p>
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
        </div>
        <div class="flex space-x-2">
          <button data-code="${p.code}" class="btn-view flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium"><i class="fas fa-eye mr-1"></i>รายละเอียด</button>
          ${canEdit?`<button data-code="${p.code}" class="btn-edit flex-1 bg-blue-50 text-blue-600 py-2 rounded-xl text-sm font-medium"><i class="fas fa-edit mr-1"></i>แก้ไข</button>
          <button data-code="${p.code}" class="btn-del flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-medium"><i class="fas fa-trash mr-1"></i>ลบ</button>`:''}
        </div>`;
      list.appendChild(card);
    });
    // binds
    list.querySelectorAll('.btn-view').forEach(b=> b.addEventListener('click', e=>{
      const code = e.currentTarget.dataset.code; const p = items.find(x=>x.code===code);
      if (!p) return;
      alert(`รายละเอียดสินค้า\n\nรหัส: ${p.code}\nชื่อ: ${p.name}\nหมวด: ${p.category}\nหน่วย: ${p.unit}\nราคา: ฿${p.price}\nคงเหลือ: ${p.stock}\nรายละเอียด: ${p.desc||'-'}`);
    }));
    list.querySelectorAll('.btn-edit').forEach(b=> b.addEventListener('click', e=> openEditProductModal(e.currentTarget.dataset.code)));
    list.querySelectorAll('.btn-del').forEach(b=> b.addEventListener('click', async e=>{
      const code = e.currentTarget.dataset.code;
      if (confirm('ยืนยันลบสินค้า?')){ 
        await Store.deleteProduct(code); 
        toast('ลบสินค้าแล้ว','success'); 
        await renderProductsList(el('productSearch').value); 
        await renderStats(); 
      }
    }));
  }

  function openAddProductModal(){
    el('productMode').value='create';
    el('productOldCode').value='';
    el('productModalTitle').textContent='เพิ่มสินค้าใหม่';
    el('productForm').reset();
    openModal('productModal');
  }

  async function openEditProductModal(code){
    const items = await Store.listProducts();
    const p = items.find(x=>x.code===code); if (!p) return;
    el('productMode').value='edit';
    el('productOldCode').value=p.code;
    el('productModalTitle').textContent='แก้ไขสินค้า';
    el('productCode').value=p.code;
    el('productName').value=p.name;
    el('productCategory').value=p.category;
    el('productUnit').value=p.unit;
    el('productPrice').value=p.price;
    el('productStock').value=p.stock;
    el('productDesc').value=p.desc||'';
    openModal('productModal');
  }

  function openModal(id){ const m = el(id); m.classList.remove('hidden'); m.classList.add('flex'); document.body.style.overflow='hidden'; }
  function closeModal(id){ const m = el(id); m.classList.add('hidden'); m.classList.remove('flex'); document.body.style.overflow='auto'; }

  // ===== Approvals (admin) =====
  async function renderPendingUsers(){
    const box = el('pendingUsers'); if (!box) return;
    const items = await Store.listPendingUsers();
    box.innerHTML='';
    if (items.length===0){ box.innerHTML='<div class="text-center text-gray-500 py-6">ไม่มีคำขอสมัคร</div>'; return; }
    items.forEach(u=>{
      const card = document.createElement('div');
      card.className='mobile-card';
      card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div><h3 class="font-medium text-gray-800">${u.username}</h3>
          <p class="text-sm text-gray-500">ขอสิทธิ์: ${u.requestedRole==='manager'?'แอดมิน':'พนักงาน'}</p></div>
          <div class="text-right"><span class="status-badge bg-yellow-100 text-yellow-800">รออนุมัติ</span></div>
        </div>
        <div class="flex items-center space-x-2">
          <select data-user="${u.username}" class="role-select flex-1 border border-gray-200 rounded-xl px-3 py-2">
            <option value="staff" ${u.requestedRole==='staff'?'selected':''}>พนักงาน</option>
            <option value="manager" ${u.requestedRole==='manager'?'selected':''}>แอดมิน</option>
          </select>
          <button data-user="${u.username}" class="btn-approve flex-1 bg-green-50 text-green-700 py-2 rounded-xl text-sm font-medium"><i class="fas fa-check mr-1"></i>อนุมัติ</button>
          <button data-user="${u.username}" class="btn-reject flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-medium"><i class="fas fa-times mr-1"></i>ปฏิเสธ</button>
        </div>`;
      box.appendChild(card);
    });
    // binds
    box.querySelectorAll('.btn-approve').forEach(b=> b.addEventListener('click', async e=>{
      const username = e.currentTarget.dataset.user;
      const role = e.currentTarget.parentElement.querySelector('.role-select').value;
      await Store.approveUser(username, role);
      toast('อนุมัติแล้ว','success');
      await renderPendingUsers(); await renderStats(); await renderNotifications();
    }));
    box.querySelectorAll('.btn-reject').forEach(b=> b.addEventListener('click', async e=>{
      const username = e.currentTarget.dataset.user;
      if (confirm('ยืนยันปฏิเสธคำขอ?')){
        await Store.rejectUser(username);
        toast('ปฏิเสธคำขอแล้ว','success');
        await renderPendingUsers(); await renderStats(); await renderNotifications();
      }
    }));
  }

  // ===== Employees (admin) =====
  async function renderEmployees(filterText=''){
    const box = document.getElementById('employeesList'); if (!box) return;
    const you = Store.getCurrentUser();
    let all = await Store.listUsers();
    all = all.filter(u => u.username.toLowerCase().includes(filterText.toLowerCase())
      || (u.profile?.firstName||'').includes(filterText) || (u.profile?.lastName||'').includes(filterText));
    box.innerHTML='';
    if (all.length===0){ box.innerHTML='<div class="text-center text-gray-500 py-6">ไม่พบพนักงาน</div>'; return; }
    all.forEach(u=>{
      const card = document.createElement('div');
      card.className='mobile-card';
      card.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div>
            <h3 class="font-medium text-gray-800">${u.username} <span class="ml-2 text-xs px-2 py-0.5 rounded-full ${u.role==='manager'?'bg-purple-100 text-purple-800':'bg-blue-100 text-blue-800'}">${u.role==='manager'?'แอดมิน':'พนักงาน'}</span></h3>
            <p class="text-sm text-gray-500">${(u.profile?.firstName||'-')} ${(u.profile?.lastName||'')}</p>
            <p class="text-xs text-gray-400">${u.profile?.phone || ''}</p>
          </div>
          <div class="text-right">
            <button data-user="${u.username}" class="btn-edit-user px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm"><i class="fas fa-edit mr-1"></i>แก้ไข</button>
            <button data-user="${u.username}" class="btn-del-user px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm ml-2" ${you && you.username===u.username?'disabled title="ห้ามลบตัวเอง"':''}><i class="fas fa-trash mr-1"></i>ลบ</button>
          </div>
        </div>`;
      box.appendChild(card);
    });
    box.querySelectorAll('.btn-edit-user').forEach(b=> b.addEventListener('click', e=>{
      const u = all.find(x=>x.username===e.currentTarget.dataset.user);
      openUserModal(u); // ประกาศใน auth.js และถูก expose เป็น global
    }));
    box.querySelectorAll('.btn-del-user').forEach(b=> b.addEventListener('click', async e=>{
      const username = e.currentTarget.dataset.user;
      if (confirm('ยืนยันลบผู้ใช้นี้?')){
        await Store.deleteUser(username);
        toast('ลบผู้ใช้เรียบร้อย','success');
        await renderEmployees(document.getElementById('empSearch').value);
        await renderStats();
      }
    }));
  }

  // ===== Notifications =====
  async function renderNotifications(){
    const user = Store.getCurrentUser();
    const bell = document.getElementById('notifBell');
    const badge = document.getElementById('notifBadge');
    const panel = document.getElementById('notifPanel');
    if (!bell || !badge || !panel) return;
    let count = 0, items = [];
    if (user && user.role==='manager'){ items = await Store.listPendingUsers(); count = items.length; }
    badge.classList.toggle('hidden', count===0);
    badge.textContent = String(count);
    panel.innerHTML = '';
    if (count===0){ panel.innerHTML = '<div class="p-3 text-sm text-gray-500">ไม่มีการแจ้งเตือน</div>'; }
    else{
      items.forEach(u=>{
        const row = document.createElement('div');
        row.className='p-3 border-b last:border-none flex items-center justify-between';
        row.innerHTML = `<div><div class="text-sm font-medium text-gray-800">คำขอสมัครใหม่</div><div class="text-xs text-gray-500">${u.username} ขอสิทธิ์ ${u.requestedRole==='manager'?'แอดมิน':'พนักงาน'}</div></div>
        <button class="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-lg goto-approve">ไปจัดการ</button>`;
        row.querySelector('.goto-approve').addEventListener('click', async ()=>{
          showSection(null,'admin');
          await renderPendingUsers();
          panel.classList.add('hidden');
        });
        panel.appendChild(row);
      });
    }
  }

  return {
    toast, showSection,
    renderStats, renderActivities,
    renderProductsList, openAddProductModal, openEditProductModal,
    openModal, closeModal,
    renderPendingUsers, renderEmployees, renderNotifications
  };
})();
