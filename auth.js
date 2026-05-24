// Auth + Events
(function(){
  const $ = id => document.getElementById(id);

  // init data (เดิมใช้ placeholder)
  Store.init();

  // ===== login =====
  $('loginForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = $('username').value.trim();
    const password = $('password').value;

    try{
      const res = await fetch(`${Store.API}?action=login`, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password})
      });

      let data;
      try { data = await res.json(); }
      catch(parseErr){
        throw new Error('เซิร์ฟเวอร์ตอบไม่ใช่ JSON');
      }

      if (!res.ok || data?.error){
        throw new Error(data?.error || `เข้าสู่ระบบล้มเหลว (HTTP ${res.status})`);
      }

      // เก็บทั้ง object ผู้ใช้ไว้ใน localStorage
      Store.setCurrentUser(data.user);
      await afterLogin();
      UI.toast('เข้าสู่ระบบสำเร็จ!','success');
    }catch(err){
      UI.toast(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ','error'); // แสดงสาเหตุจริง
    }
  });

  // toggle password
  $('togglePassword').addEventListener('click', ()=>{
    const input = $('password'); const icon = $('passwordToggle');
    if (input.type==='password'){ input.type='text'; icon.className='fas fa-eye-slash'; } else { input.type='password'; icon.className='fas fa-eye'; }
  });

  // forgot
  $('forgotBtn').addEventListener('click', ()=> UI.toast('ลิงก์รีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว','success'));

  // ===== register =====
  $('registerForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const username = $('regUsername').value.trim();
    const password = $('regPassword').value;
    const requestedRole = $('regRole').value;
    try{
      const r = await fetch(`${Store.API}?action=register`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({username,password,requestedRole})
      });
      const data = await r.json().catch(()=> ({}));
      if (!r.ok || data.error){ throw new Error(data.error || `สมัครล้มเหลว (HTTP ${r.status})`); }
      UI.toast('สมัครสำเร็จ! กรุณารอแอดมินอนุมัติ','success');
      $('registerForm').reset();
      // รีเฟรช badge แจ้งเตือนให้แอดมินเห็น
      await UI.renderNotifications();
    }catch(err){ UI.toast(err.message||'เกิดข้อผิดพลาด','error'); }
  });

  // logout
  $('logoutBtn').addEventListener('click', ()=>{
    Store.logout();
    $('mainApp').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');
    UI.toast('ออกจากระบบเรียบร้อยแล้ว','success');
  });

  // open user menu
  $('userMenuBtn').addEventListener('click', ()=> $('userMenu').classList.toggle('hidden'));
  document.addEventListener('click', (e)=>{
    const menu = $('userMenu'); const btn = $('userMenuBtn');
    const bell = $('notifBell'); const panel = $('notifPanel');
    if (menu && !menu.contains(e.target) && !btn.contains(e.target)) menu.classList.add('hidden');
    if (panel && !panel.contains(e.target) && !bell.contains(e.target)) panel.classList.add('hidden');
  });

  // notification bell
  $('notifBell').addEventListener('click', ()=> $('notifPanel').classList.toggle('hidden'));

  // profile open/save
  $('openProfileBtn').addEventListener('click', ()=>{
    const me = Store.getCurrentUser(); if (!me) return;
    $('pfFirstName').value = me.profile?.firstName || '';
    $('pfLastName').value  = me.profile?.lastName || '';
    $('pfIdNumber').value  = me.profile?.idNumber || '';
    $('pfAge').value       = me.profile?.age || '';
    $('pfGender').value    = me.profile?.gender || '';
    $('pfAddress').value   = me.profile?.address || '';
    $('pfPhone').value     = me.profile?.phone || '';
    UI.openModal('profileModal');
  });
  $('profileForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const me = Store.getCurrentUser(); if (!me) return;
    try{
      await Store.updateUserProfile(me.username, {
        firstName: $('pfFirstName').value.trim(),
        lastName:  $('pfLastName').value.trim(),
        idNumber:  $('pfIdNumber').value.trim(),
        age:       $('pfAge').value.trim(),
        gender:    $('pfGender').value,
        address:   $('pfAddress').value.trim(),
        phone:     $('pfPhone').value.trim()
      });
      UI.toast('บันทึกโปรไฟล์แล้ว','success');
      UI.closeModal('profileModal');
      await UI.renderEmployees(); // เผื่อแสดงผลรายชื่อ
    }catch(err){ UI.toast(err.message||'เกิดข้อผิดพลาด','error'); }
  });

  // ===== products: search + submit =====
  $('productSearch').addEventListener('input', e=> UI.renderProductsList(e.target.value));

  $('productForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const mode = $('productMode').value;
    const payload = {
      code:$('productCode').value.trim(),
      name:$('productName').value.trim(),
      category:$('productCategory').value,
      unit:$('productUnit').value.trim(),
      price:Number($('productPrice').value||0),
      stock:Number($('productStock').value||0),
      desc:$('productDesc').value.trim()
    };
    try{
      if (mode==='create'){
        await Store.addProduct(payload);
        UI.toast('เพิ่มสินค้าเรียบร้อย','success');
      }else{
        await Store.updateProduct($('productOldCode').value, payload);
        UI.toast('แก้ไขสินค้าเรียบร้อย','success');
      }
      UI.closeModal('productModal');
      await UI.renderProductsList($('productSearch').value);
      await UI.renderStats();
    }catch(err){
      UI.toast(err.message||'เพิ่ม/แก้ไขสินค้าไม่สำเร็จ','error');
    }
  });

  // employees search/add
  $('empSearch').addEventListener('input', e=> UI.renderEmployees(e.target.value));
  $('empAddBtn').addEventListener('click', ()=> openUserModal(null));

  // user modal save
  $('userForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const oldUsername = $('uOldUsername').value;
    const username = $('uUsername').value.trim();
    const password = $('uPassword').value;
    const role = $('uRole').value;
    const profile = {
      firstName:$('uFirstName').value.trim(),
      lastName:$('uLastName').value.trim(),
      idNumber:$('uIdNumber').value.trim(),
      age:$('uAge').value.trim(),
      gender:$('uGender').value,
      address:$('uAddress').value.trim(),
      phone:$('uPhone').value.trim()
    };
    try{
      if (oldUsername){
        await Store.updateUser(oldUsername, { username, password, role, profile });
        UI.toast('บันทึกข้อมูลพนักงานแล้ว','success');
      }else{
        await Store.addUserApproved({ username, password, role, profile });
        UI.toast('เพิ่มพนักงานแล้ว','success');
      }
      UI.closeModal('userModal');
      await UI.renderEmployees($('empSearch').value);
      await UI.renderStats();
    }catch(err){ UI.toast(err.message||'เกิดข้อผิดพลาด','error'); }
  });

  // helpers
  function openUserModal(user){
    $('userModalTitle').textContent = user ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงาน';
    $('uOldUsername').value = user ? user.username : '';
    $('uUsername').value = user ? user.username : '';
    $('uPassword').value = user ? (user.password||'') : '';
    $('uRole').value = user ? user.role : 'staff';
    $('uFirstName').value = user?.profile?.firstName || '';
    $('uLastName').value  = user?.profile?.lastName || '';
    $('uIdNumber').value  = user?.profile?.idNumber || '';
    $('uAge').value       = user?.profile?.age || '';
    $('uGender').value    = user?.profile?.gender || '';
    $('uAddress').value   = user?.profile?.address || '';
    $('uPhone').value     = user?.profile?.phone || '';
    UI.openModal('userModal');
  }
  window.openUserModal = openUserModal;

  // ===== after login =====
  async function afterLogin(){
    const me = Store.getCurrentUser();
    if (!me) return;
    $('loginScreen').classList.add('hidden');
    $('mainApp').classList.remove('hidden');
    $('currentUser').textContent = me.username;
    $('currentUserRole').textContent = me.role==='manager'?'แอดมิน':'พนักงาน';
    $('userRole').textContent = `${me.role==='manager'?'แอดมิน':'พนักงาน'} • ${me.username}`;

    $('adminNavBtn').classList.toggle('hidden', !(me.role==='manager'));
    $('employeesNavBtn').classList.toggle('hidden', !(me.role==='manager'));

    await UI.renderStats();
    await UI.renderProductsList();
    await UI.renderNotifications();
    if (me.role==='manager'){
      await UI.renderPendingUsers();
      await UI.renderEmployees();
      const c = (await Store.listPendingUsers()).length;
      if (c>0) UI.toast(`มีคำขอสมัครใหม่ ${c} รายการ`,'success');
    }
  }

  // autologin if any
  (function auto(){
    const me = Store.getCurrentUser();
    if (me){ afterLogin(); }
  })();
})();
