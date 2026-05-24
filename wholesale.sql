-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2026 at 02:40 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wholesale`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `type` enum('add','edit','delete','user') DEFAULT 'user',
  `text` text DEFAULT NULL,
  `ts` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `type`, `text`, `ts`) VALUES
(1, 'edit', 'แก้ไขสินค้า: P003 → P003', '2026-05-24 12:37:40'),
(2, 'add', 'เพิ่มสินค้า: [P005] ลูกอม', '2026-05-24 12:39:02');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `stock` int(11) DEFAULT 0,
  `desc` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `code`, `name`, `category`, `unit`, `price`, `stock`, `desc`, `created_at`) VALUES
(1, 'P001', 'น้ำดื่ม 600ml', 'เครื่องดื่ม', 'ขวด', 10.00, 100, 'น้ำดื่มบริสุทธิ์บรรจุขวด', '2026-05-24 12:07:15'),
(2, 'P002', 'ขนมปังกรอบ', 'ขนม', 'ถุง', 25.00, 50, 'ขนมปังกรอบรสเนย', '2026-05-24 12:07:15'),
(3, 'P003', 'ปลากระป๋อง', 'อาหารแห้ง', 'กระป๋อง', 30.00, 30, 'ปลาซาร์ดีนในซอสมะเขือเทศ', '2026-05-24 12:07:15'),
(4, 'P005', 'ลูกอม', 'ขนม', 'ถุง', 10.00, 50, '', '2026-05-24 12:39:02');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('staff','manager') DEFAULT 'staff',
  `status` enum('pending','approved') DEFAULT 'pending',
  `requested_role` enum('staff','manager') DEFAULT NULL,
  `first_name` varchar(100) DEFAULT '',
  `last_name` varchar(100) DEFAULT '',
  `id_number` varchar(100) DEFAULT '',
  `age` int(11) DEFAULT NULL,
  `gender` varchar(20) DEFAULT '',
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT '',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `status`, `requested_role`, `first_name`, `last_name`, `id_number`, `age`, `gender`, `address`, `phone`, `created_at`) VALUES
(1, 'admin', 'admin123', 'manager', 'approved', 'manager', 'แอด', 'มิน', '', NULL, '', NULL, '', '2026-05-24 12:07:15'),
(2, 'staff', 'staff123', 'staff', 'approved', 'staff', 'พนักงาน', 'ร้าน', '', NULL, '', NULL, '', '2026-05-24 12:07:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activities`
--
ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
