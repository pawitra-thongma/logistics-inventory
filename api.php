<?php
// ===== Bootstrap =====
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET,POST,OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD']==='OPTIONS'){ echo json_encode(['ok'=>true]); exit; }

function json($data, $code=200){
  http_response_code($code);
  echo json_encode($data);
  exit;
}

function db(){
  static $pdo;
  if ($pdo) return $pdo;
  $dsn = "mysql:host=sql201.infinityfree.com;dbname=if0_42008217_inventory;charset=utf8mb4";
try{
    $pdo = new PDO($dsn, 'if0_42008217', 'pawitra005600', [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
  }catch(PDOException $e){
    json(['error'=>'Database connection failed: '.$e->getMessage()], 500);
  }
  return $pdo;
}

function body(){
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $j = json_decode($raw, true);
  return is_array($j)? $j : [];
}

function activity($type,$text){
  try{
    $pdo = db();
    $st = $pdo->prepare("INSERT INTO activities(type,text) VALUES(?,?)");
    $st->execute([$type,$text]);
  }catch(Exception $e){ /* swallow */ }
}

// ===== Routing =====
$action = $_GET['action'] ?? $_POST['action'] ?? '';

try{
  switch($action){

  // ---------- AUTH ----------
  case 'login': {
    $in = body();
    $username = trim($in['username'] ?? '');
    $password = $in['password'] ?? '';
    if ($username===''){ json(['error'=>'กรอกชื่อผู้ใช้'], 400); }
    $pdo = db();
    $st = $pdo->prepare("SELECT * FROM users WHERE username=? LIMIT 1");
    $st->execute([$username]);
    $u = $st->fetch();
    if (!$u || (string)$u['password'] !== (string)$password){
      json(['error'=>'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'], 401);
    }
    if ($u['status']!=='approved'){ json(['error'=>'บัญชียังไม่ผ่านการอนุมัติ'], 403); }
    $user = [
      'username'=>$u['username'],
      'role'=>$u['role'],
      'profile'=>[
        'firstName'=>$u['first_name']??'',
        'lastName'=>$u['last_name']??'',
        'idNumber'=>$u['id_number']??'',
        'age'=>$u['age'],
        'gender'=>$u['gender']??'',
        'address'=>$u['address']??'',
        'phone'=>$u['phone']??'',
      ]
    ];
    json(['user'=>$user]);
  }

  case 'register': {
    $in = body();
    $username = trim($in['username'] ?? '');
    $password = $in['password'] ?? '';
    $requested = $in['requestedRole'] ?? 'staff';
    if ($username==='' || $password===''){ json(['error'=>'กรอกชื่อผู้ใช้และรหัสผ่าน'], 400); }
    $pdo = db();
    $st = $pdo->prepare("SELECT id FROM users WHERE username=?");
    $st->execute([$username]);
    if ($st->fetch()){ json(['error'=>'ชื่อนี้ถูกใช้แล้ว'], 400); }
    $st = $pdo->prepare("INSERT INTO users(username,password,role,status,requested_role) VALUES(?,?,?,?,?)");
    $st->execute([$username,$password,'staff','pending',$requested==='manager'?'manager':'staff']);
    activity('user', "สมัครผู้ใช้ใหม่: $username ($requested)");
    json(['ok'=>true]);
  }

  // ---------- USERS (Admin) ----------
  case 'admin_list_pending': {
    $pdo = db();
    $st = $pdo->query("SELECT username, requested_role FROM users WHERE status='pending' ORDER BY id DESC");
    $rows = $st->fetchAll();
    $out = array_map(fn($r)=>['username'=>$r['username'],'requestedRole'=>$r['requested_role']], $rows);
    json($out);
  }

  case 'admin_list_users': {
    $pdo = db();
    $st = $pdo->query("SELECT * FROM users ORDER BY id DESC");
    $rows = $st->fetchAll();
    $out = [];
    foreach($rows as $r){
      $out[] = [
        'username'=>$r['username'],
        'password'=>$r['password'], // NOTE: demo เท่านั้น
        'role'=>$r['role'],
        'profile'=>[
          'firstName'=>$r['first_name']??'',
          'lastName'=>$r['last_name']??'',
          'idNumber'=>$r['id_number']??'',
          'age'=>$r['age'],
          'gender'=>$r['gender']??'',
          'address'=>$r['address']??'',
          'phone'=>$r['phone']??'',
        ],
        'requestedRole'=>$r['requested_role']
      ];
    }
    json($out);
  }

  case 'admin_approve_user': {
    $in = body();
    $username = trim($in['username']??'');
    $role = $in['role']==='manager'? 'manager':'staff';
    if ($username===''){ json(['error'=>'ไม่พบผู้ใช้'], 400); }
    $pdo = db();
    $st = $pdo->prepare("UPDATE users SET status='approved', role=?, requested_role=NULL WHERE username=?");
    $st->execute([$role,$username]);
    activity('user', "อนุมัติผู้ใช้: $username เป็น $role");
    json(['ok'=>true]);
  }

  case 'admin_reject_user': {
    $in = body();
    $username = trim($in['username']??'');
    if ($username===''){ json(['error'=>'ไม่พบผู้ใช้'], 400); }
    $pdo = db();
    $st = $pdo->prepare("DELETE FROM users WHERE username=? AND status='pending'");
    $st->execute([$username]);
    activity('user', "ปฏิเสธคำขอสมัคร: $username");
    json(['ok'=>true]);
  }

  case 'admin_add_user': {
    $in = body();
    $username = trim($in['username']??'');
    $password = $in['password'] ?? '';
    $role = $in['role']==='manager'? 'manager':'staff';
    $p = $in['profile'] ?? [];
    if ($username===''||$password===''){ json(['error'=>'กรอกชื่อผู้ใช้และรหัสผ่าน'], 400); }
    $pdo = db();
    $st = $pdo->prepare("SELECT id FROM users WHERE username=?");
    $st->execute([$username]);
    if ($st->fetch()){ json(['error'=>'ชื่อนี้ถูกใช้แล้ว'], 400); }
    $st = $pdo->prepare("INSERT INTO users(username,password,role,status,first_name,last_name,id_number,age,gender,address,phone) VALUES(?,?,?,?,?,?,?,?,?,?,?)");
    $st->execute([$username,$password,$role,'approved',
      $p['firstName']??'',$p['lastName']??'',$p['idNumber']??'', $p['age']??null,$p['gender']??'',$p['address']??'',$p['phone']??''
    ]);
    activity('user', "เพิ่มพนักงาน: $username ($role)");
    json(['ok'=>true]);
  }

  case 'admin_update_user': {
    $in = body();
    $old = trim($in['oldUsername']??'');
    $username = trim($in['username']??$old);
    $password = $in['password'] ?? null;
    $role = $in['role']==='manager'? 'manager':'staff';
    $p = $in['profile'] ?? [];
    if ($old===''){ json(['error'=>'ไม่พบผู้ใช้เดิม'], 400); }
    $pdo = db();
    if ($username!==$old){
      $st = $pdo->prepare("SELECT id FROM users WHERE username=?");
      $st->execute([$username]);
      if ($st->fetch()){ json(['error'=>'ชื่อผู้ใช้ใหม่ซ้ำ'], 400); }
    }
    $sql = "UPDATE users SET username=?, role=?, first_name=?, last_name=?, id_number=?, age=?, gender=?, address=?, phone=?";
    $args = [$username,$role,$p['firstName']??'',$p['lastName']??'',$p['idNumber']??'', $p['age']??null,$p['gender']??'',$p['address']??'',$p['phone']??''];
    if ($password!==null && $password!==''){ $sql.=", password=?"; $args[]=$password; }
    $sql.=" WHERE username=?";
    $args[]=$old;
    $st = $pdo->prepare($sql);
    $st->execute($args);
    activity('user', "แก้ไขผู้ใช้: $old → $username ($role)");
    json(['ok'=>true]);
  }

  case 'admin_delete_user': {
    $in = body();
    $username = trim($in['username']??'');
    if ($username===''){ json(['error'=>'ไม่พบผู้ใช้'], 400); }
    $pdo = db();
    $st = $pdo->prepare("DELETE FROM users WHERE username=?");
    $st->execute([$username]);
    activity('user', "ลบผู้ใช้: $username");
    json(['ok'=>true]);
  }

  case 'profile_update': {
    $in = body();
    $username = trim($in['username']??'');
    $p = $in['profile'] ?? [];
    if ($username===''){ json(['error'=>'ไม่พบผู้ใช้'], 400); }
    $pdo = db();
    $st = $pdo->prepare("UPDATE users SET first_name=?, last_name=?, id_number=?, age=?, gender=?, address=?, phone=? WHERE username=?");
    $st->execute([
      $p['firstName']??'',$p['lastName']??'',$p['idNumber']??'', $p['age']??null,$p['gender']??'',$p['address']??'',$p['phone']??'', $username
    ]);
    activity('user', "อัปเดตโปรไฟล์: $username");
    json(['ok'=>true]);
  }

  // ---------- PRODUCTS ----------
  case 'get_products': {
    $pdo = db();
    $st = $pdo->query("SELECT code,name,category,unit,price,stock,`desc` FROM products ORDER BY id DESC");
    json($st->fetchAll());
  }

  case 'add_product': {
    $in = body();
    $code = trim($in['code']??'');
    $name = trim($in['name']??'');
    if ($code===''||$name===''){ json(['error'=>'กรอกรหัสและชื่อสินค้า'], 400); }
    $pdo = db();
    $st = $pdo->prepare("SELECT id FROM products WHERE code=?");
    $st->execute([$code]);
    if ($st->fetch()){ json(['error'=>'รหัสสินค้าซ้ำ'], 400); }
    $st = $pdo->prepare("INSERT INTO products(code,name,category,unit,price,stock,`desc`) VALUES(?,?,?,?,?,?,?)");
    $st->execute([
      $code,$name,$in['category']??'',$in['unit']??'', $in['price']??0, $in['stock']??0, $in['desc']??''
    ]);
    activity('add', "เพิ่มสินค้า: [$code] $name");
    json(['ok'=>true]);
  }

  case 'update_product': {
    $in = body();
    $old = trim($in['oldCode']??'');
    $code = trim($in['code']??$old);
    if ($old===''){ json(['error'=>'ไม่พบสินค้าที่จะแก้ไข'], 400); }
    $pdo = db();
    if ($code!==$old){
      $st = $pdo->prepare("SELECT id FROM products WHERE code=?");
      $st->execute([$code]);
      if ($st->fetch()){ json(['error'=>'รหัสสินค้าใหม่ซ้ำ'], 400); }
    }
    $st = $pdo->prepare("UPDATE products SET code=?, name=?, category=?, unit=?, price=?, stock=?, `desc`=? WHERE code=?");
    $st->execute([
      $code, trim($in['name']??''), $in['category']??'', $in['unit']??'',
      $in['price']??0, $in['stock']??0, $in['desc']??'', $old
    ]);
    activity('edit', "แก้ไขสินค้า: $old → $code");
    json(['ok'=>true]);
  }

  case 'delete_product': {
    $in = body();
    $code = trim($in['code']??'');
    if ($code===''){ json(['error'=>'ไม่พบรหัสสินค้า'], 400); }
    $pdo = db();
    $st = $pdo->prepare("DELETE FROM products WHERE code=?");
    $st->execute([$code]);
    activity('delete', "ลบสินค้า: $code");
    json(['ok'=>true]);
  }

  // ---------- ACTIVITIES ----------
  case 'activities_latest': {
    $pdo = db();
    $st = $pdo->query("SELECT type,text,ts FROM activities ORDER BY id DESC LIMIT 50");
    json($st->fetchAll());
  }

  default: json(['error'=>'Unknown action'], 400);
  }
}catch(Throwable $e){
  json(['error'=>'Server error: '.$e->getMessage()], 500);
}
