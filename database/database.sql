CREATE DATABASE IF NOT EXISTS instituto_sereia
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE instituto_sereia;

CREATE TABLE IF NOT EXISTS assistidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cpf CHAR(11) UNIQUE,
  data_nascimento DATE,
  email VARCHAR(150),
  telefone VARCHAR(30) NOT NULL,
  cep VARCHAR(9),
  logradouro VARCHAR(150),
  numero VARCHAR(10),
  complemento VARCHAR(80),
  bairro VARCHAR(80),
  cidade VARCHAR(100),
  status VARCHAR(10) NOT NULL DEFAULT 'Ativo'
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS voluntarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  telefone VARCHAR(30),
  cpf CHAR(11) NOT NULL UNIQUE,
  sexo VARCHAR(20),
  idade INT,
  estado_civil VARCHAR(30),
  status VARCHAR(10) NOT NULL DEFAULT 'Ativo',
  data_nascimento DATE,
  cep VARCHAR(9),
  logradouro VARCHAR(150),
  numero VARCHAR(10),
  complemento VARCHAR(80),
  bairro VARCHAR(80),
  cidade VARCHAR(100)
);