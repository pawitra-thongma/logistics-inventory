# Logistics Inventory Management System
> ระบบสารสนเทศการจัดการสินค้าคงคลัง — กรณีศึกษา ร้านขายส่ง

[![Live Demo](https://img.shields.io/badge/Live-Demo-28a745?style=flat-square&logo=google-chrome&logoColor=white)](https://pawitra-inventory.free.nf)
[![GitHub](https://img.shields.io/badge/GitHub-logistics--inventory-black?style=flat-square&logo=github)](https://github.com/pawitra-thongma/logistics-inventory)

---
**Role:** System Analyst & UI/UX Designer
**Tools:** PHP, MySQL, HTML, CSS, JavaScript, draw.io
**Course:** 273481 Business Record and Logistics Management · Naresuan University
 
---

## Features

### Manager
- Add / Edit / Delete product information (name, category, unit, price, stock quantity)
- Record stock-in (purchase orders) and stock-out (sales)
- Manage employee accounts and set access permissions
- View inventory, sales, and purchase reports

### Staff
- Add / Edit / Delete product information
- Record stock-in and stock-out transactions

---

## Tech Stack

![PHP](https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | PHP |
| Database | MySQL |
| Web Server | Apache (XAMPP) |
| Diagram | draw.io |

---

## System Design

### Use Case Diagram

![Use Case Diagram](images/usecase.png)

| Actor | Use Cases |
|---|---|
| Manager | จัดการสินค้า, จัดการประเภทสินค้า, จัดการพนักงาน, บันทึกรับสินค้า, บันทึกการขาย |
| Staff | จัดการสินค้า, บันทึกรับสินค้า, บันทึกการขาย |

### ER Diagram

![ER Diagram](images/er_diagram.png)

**8 Entities:**

| Entity | Key Fields |
|---|---|
| สินค้า (Product) | รหัสสินค้า, ชื่อสินค้า, ประเภท, หน่วยนับ, ราคา, จำนวนคงเหลือ |
| ประเภทสินค้า (Category) | รหัสประเภท, ชื่อประเภท, รายละเอียด |
| พนักงาน (Employee) | รหัสพนักงาน, ชื่อ-นามสกุล, ตำแหน่ง, ชื่อผู้ใช้, รหัสผ่าน |
| การสั่งซื้อ (Customer Order) | รหัสการสั่งซื้อ, วันที่, รหัสลูกค้า, รายการ, จำนวน, ราคารวม |
| การนำเข้าสินค้า (Stock In) | รหัสการนำเข้า, วันที่, รายการ, จำนวน, ราคาซื้อรวม |
| การเบิก/ขาย (Stock Out) | รหัสการขาย, วันที่ขาย, รหัสลูกค้า, จำนวน, ราคารวม |
| การชำระเงิน (Payment) | รหัสการชำระ, วันที่, จำนวนเงิน, วิธีชำระ, สถานะ |
| รายงาน (Report) | รหัสรายงาน, ประเภทรายงาน, ช่วงวันที่, ข้อมูลสรุป |

---

## Screenshots

### หน้า Login และ Dashboard
![Login & Dashboard](images/login_dashboard.png)

### หน้าจัดการสินค้า และ ประเภทสินค้า
![Product Management](images/product_category.png)

### หน้าจัดการพนักงาน และ การสั่งซื้อ
![Employee & Orders](images/employee_orders.png)

### หน้านำเข้าสินค้า และ ขายสินค้า
![Stock In & Out](images/stockin_stockout.png)

### หน้าชำระเงิน และ รายงาน
![Payment & Reports](images/payment_report.png)

---

## How to Run

**🌐 Live Demo:** [https://pawitra-inventory.free.nf](https://pawitra-inventory.free.nf)

```
Login credentials:
Manager: admin / admin123
Staff:   staff / staff123
```
