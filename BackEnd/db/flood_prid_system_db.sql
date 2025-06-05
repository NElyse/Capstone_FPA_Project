-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 21, 2025 at 08:49 PM
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
-- Database: `flood_prid_system_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `flood_data`
--

CREATE TABLE `flood_data` (
  `id` int(11) NOT NULL,
  `water_level` float NOT NULL,
  `rainfall` float NOT NULL,
  `flood_risk` varchar(50) NOT NULL,
  `recorded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flood_data`
--

INSERT INTO `flood_data` (`id`, `water_level`, `rainfall`, `flood_risk`, `recorded_at`) VALUES
(1, 2.3, 10.5, 'Low', '2025-04-18 07:11:09'),
(2, 3.7, 18.2, 'Medium', '2025-04-18 07:11:09'),
(3, 5.1, 25, 'High', '2025-04-18 07:11:09'),
(4, 1.8, 7.2, 'Low', '2025-04-18 07:11:09'),
(5, 4.5, 20.8, 'High', '2025-04-18 07:11:09');

-- --------------------------------------------------------

--
-- Table structure for table `flood_status`
--

CREATE TABLE `flood_status` (
  `id` int(11) NOT NULL,
  `risk_level` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `flood_status`
--

INSERT INTO `flood_status` (`id`, `risk_level`, `location`, `timestamp`) VALUES
(1, 'Low', 'Kigali', '2025-04-18 08:00:00'),
(2, 'Medium', 'Musanze', '2025-04-18 09:30:00'),
(3, 'High', 'Rubavu', '2025-04-18 10:45:00'),
(4, 'Low', 'Huye', '2025-04-18 11:30:00'),
(5, 'Medium', 'Nyamagabe', '2025-04-18 12:15:00'),
(6, 'High', 'Musanze', '2025-04-18 10:02:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `flood_data`
--
ALTER TABLE `flood_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `flood_status`
--
ALTER TABLE `flood_status`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `flood_data`
--
ALTER TABLE `flood_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `flood_status`
--
ALTER TABLE `flood_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
