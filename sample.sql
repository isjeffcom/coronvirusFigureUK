-- phpMyAdmin SQL Dump
-- version 4.4.15.10
-- https://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: 2020-03-07 07:50:18
-- 服务器版本： 5.7.26-log
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `corona`
--

-- --------------------------------------------------------

--
-- 表的结构 `current`
--

CREATE TABLE IF NOT EXISTS `current` (
  `id` int(11) NOT NULL,
  `source` text,
  `link` text,
  `domId` text,
  `confirm` int(11) DEFAULT NULL,
  `death` int(11) DEFAULT NULL,
  `cured` int(11) DEFAULT NULL,
  `icu` int(11) DEFAULT NULL,
  `nagative` int(11) DEFAULT NULL,
  `suspect` int(11) DEFAULT NULL,
  `area` text,
  `ts` bigint(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 表的结构 `current_shadow`
--

CREATE TABLE IF NOT EXISTS `current_shadow` (
  `id` int(11) NOT NULL,
  `source` text,
  `link` text,
  `domId` text,
  `confirm` int(11) DEFAULT NULL,
  `death` int(11) DEFAULT NULL,
  `cured` int(11) DEFAULT NULL,
  `icu` int(11) DEFAULT NULL,
  `nagative` int(11) DEFAULT NULL,
  `suspect` int(11) DEFAULT NULL,
  `area` text,
  `ts` bigint(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 表的结构 `history`
--

CREATE TABLE IF NOT EXISTS `history` (
  `id` int(11) NOT NULL,
  `date` bigint(128) NOT NULL,
  `confirm` int(11) NOT NULL,
  `death` int(11) NOT NULL,
  `cured` int(11) NOT NULL,
  `icu` int(11) NOT NULL,
  `nagative` int(11) NOT NULL,
  `suspect` int(11) NOT NULL,
  `area` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- 表的结构 `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL,
  `name` varchar(128) DEFAULT NULL,
  `psw` varchar(512) DEFAULT NULL,
  `token` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `current`
--
ALTER TABLE `current`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `current_shadow`
--
ALTER TABLE `current_shadow`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `current`
--
ALTER TABLE `current`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `current_shadow`
--
ALTER TABLE `current_shadow`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
