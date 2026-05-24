// Store (API-backed) — drop-in แทน LocalStorage เดิม
const Store = {
  API: 'https://pawitra-inventory.free.nf/api.php',

  async _get(action){
    const res = await fetch(`${this.API}?action=${action}`);
    return res.json();
  },
  async _post(action, body){
    const res = await fetch(`${this.API}?action=${action}`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body||{})
    });
    return res.json();
  },

  // เข้ากับโค้ดเดิม
  init(){ /* ไม่ต้อง seed แล้ว */ },
  getData(){ /* ใช้เฉพาะสถิติ users ทั้งหมด -> ให้ดึงจาก admin_list_users */ return {}; },
  setData(){},
  
  // ===== Users (สมัคร/อนุมัติ/ลิสต์/โปรไฟล์) =====
  async addUserPending({username,password,requestedRole}){ 
    const r = await this._post('register',{username,password,requestedRole});
    if (r.error) throw new Error(r.error);
  },
  async approveUser(username, role){
    const r = await this._post('admin_approve_user',{username, role});
    if (r.error) throw new Error(r.error);
  },
  async rejectUser(username){
    const r = await this._post('admin_reject_user',{username});
    if (r.error) throw new Error(r.error);
  },
  async listPendingUsers(){
    const r = await this._get('admin_list_pending');
    return Array.isArray(r)? r : [];
  },
  async listUsers(){
    const r = await this._get('admin_list_users');
    return Array.isArray(r)? r : [];
  },
  async getUser(username){
    const all = await this.listUsers();
    return all.find(u=>u.username===username) || null;
  },
  async addUserApproved({username,password,role,profile={}}){
    const r = await this._post('admin_add_user',{username,password,role,profile});
    if (r.error) throw new Error(r.error);
  },
  async updateUser(username, patch){
    const payload = {
      oldUsername: username,
      username: patch.username ?? username,
      password: patch.password,
      role: patch.role,
      profile: patch.profile || {}
    };
    const r = await this._post('admin_update_user', payload);
    if (r.error) throw new Error(r.error);
  },
  async deleteUser(username){
    const r = await this._post('admin_delete_user', {username});
    if (r.error) throw new Error(r.error);
  },
  async updateUserProfile(username, profile){
    const r = await this._post('profile_update', {username, profile});
    if (r.error) throw new Error(r.error);
  },

  // login session (เก็บทั้ง object ผู้ใช้)
setCurrentUser(user){
  localStorage.setItem('currentUser', JSON.stringify(user || null));
},

logout(){
  localStorage.removeItem('currentUser');
  localStorage.removeItem('currentUserName'); // ลบคีย์เก่าออกด้วย
},

// อ่านข้อมูลผู้ใช้แบบ synchronous จาก localStorage
getCurrentUser(){
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch(e){ return null; }
},


  // ===== Products =====
  async listProducts(){
    const r = await this._get('get_products');
    return Array.isArray(r)? r : [];
  },
  async addProduct(p){
    const r = await this._post('add_product', p);
    if (r.error) throw new Error(r.error);
  },
  async updateProduct(code, patch){
    const r = await this._post('update_product', { oldCode: code, ...patch });
    if (r.error) throw new Error(r.error);
  },
  async deleteProduct(code){
    const r = await this._post('delete_product', { code });
    if (r.error) throw new Error(r.error);
  },

  // ===== Activities (for dashboard) =====
  async getActivities(){
    const r = await this._get('activities_latest');
    return Array.isArray(r)? r : [];
  }
};
