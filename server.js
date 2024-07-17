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
app.use(express.static(path.join(__dirname, 'public')));

// 뉴스 데이터 가져오기 엔드포인트
app.get('/api/articles', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM articles');
    const totalItems = totalResult.rows[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query('SELECT * FROM articles ORDER BY datetime DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json({ items: result.rows, totalPages });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).send('Error fetching news');
  }
});

// 뉴스 검색 엔드포인트
app.get('/api/search', async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const totalResult = await pool.query(
      `SELECT COUNT(*) FROM articles 
       WHERE title ILIKE $1 
          OR content ILIKE $2 
          OR press ILIKE $3 
          OR journalist ILIKE $4`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );
    const totalItems = totalResult.rows[0].count;
    const totalPages = Math.ceil(totalItems / limit);

    const result = await pool.query(
      `SELECT * FROM articles 
       WHERE title ILIKE $1 
          OR content ILIKE $2 
          OR press ILIKE $3 
          OR journalist ILIKE $4 
       ORDER BY datetime DESC
       LIMIT $5 OFFSET $6`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, limit, offset]
    );
    res.json({ items: result.rows, totalPages });
  } catch (err) {
    console.error('Error searching news:', err);
    res.status(500).send('Error searching news');
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
