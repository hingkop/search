const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// .env 파일 로드
dotenv.config();

const app = express();
const port = 3000;

// PostgreSQL 연결 설정
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 미들웨어 설정
app.use(bodyParser.json());

// index.html 파일 제공
app.get('/', (req, res) => {
  // index.html 파일이 현재 파일과 같은 경로에 있는 경우
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 뉴스 데이터 가져오기 엔드포인트
app.get('/api/articles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM articles');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).send('Error fetching news');
  }
});

// 뉴스 검색 엔드포인트
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM articles 
       WHERE title ILIKE $1 
          OR content ILIKE $2 
          OR press ILIKE $3 
          OR journalist ILIKE $4`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching news:', err);
    res.status(500).send('Error searching news');
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
