const itemsPerPage = 10;
let currentPage = 1;
let currentQuery = '';
let articles = [];

async function fetchNews(page = 1) {
  try {
    const response = await fetch(`/api/articles?page=${page}&limit=${itemsPerPage}`);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    const news = await response.json();
    articles = news.items;
    displayNewsList(news.items);
    updatePagination(news.totalPages, page);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    alert('Failed to fetch news. Please try again later.');
  }
}

async function searchNews(page = 1) {
  currentQuery = document.getElementById('searchQuery').value.trim();
  currentPage = page;
  try {
    const response = await fetch(`/api/search?query=${encodeURIComponent(currentQuery)}&page=${page}&limit=${itemsPerPage}`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const news = await response.json();
    articles = news.items;
    displayNewsList(news.items);
    updatePagination(news.totalPages, page);
  } catch (error) {
    console.error('Search error:', error.message);
    alert('Search failed. Please try again later.');
  }
}

function displayNewsList(news) {
  const container = document.getElementById('newsContainer');
  container.innerHTML = '';
  document.getElementById('newsDetail').style.display = 'none';
  container.style.display = 'block';

  news.forEach((item, index) => {
    const div = document.createElement('div');
    div.classList.add('news-item');
    div.onclick = () => displayNewsDetail(index);
    div.innerHTML = `
      <h2>${item.title}</h2>
      <p>${(item.content || '').substring(0, 100)}...</p>
      <p><strong>날짜:</strong> ${item.datetime}</p>
    `;
    container.appendChild(div);
  });
}

function displayNewsDetail(index) {
  const item = articles[index];
  document.getElementById('newsContainer').style.display = 'none';
  document.getElementById('newsDetail').style.display = 'block';
  document.getElementById('detailTitle').innerText = item.title;
  document.getElementById('detailPress').innerText = item.press;
  document.getElementById('detailJournalist').innerText = item.journalist;
  document.getElementById('detailDate').innerText = item.datetime;
  document.getElementById('detailContent').innerText = item.content;
  document.getElementById('detailLink').href = item.href;
}

function goBack() {
  document.getElementById('newsDetail').style.display = 'none';
  document.getElementById('newsContainer').style.display = 'block';
}

function updatePagination(totalPages, currentPage) {
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  const maxPagesToShow = 8; // 한 번에 표시할 페이지 번호 버튼의 수
  let startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(endPage - maxPagesToShow + 1, 1);
  }

  if (currentPage > 1) {
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.onclick = () => {
      if (currentQuery) {
        searchNews(currentPage - 1);
      } else {
        fetchNews(currentPage - 1);
      }
    };
    pagination.appendChild(prevButton);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    if (i === currentPage) {
      pageButton.disabled = true;
    } else {
      pageButton.onclick = () => {
        if (currentQuery) {
          searchNews(i);
        } else {
          fetchNews(i);
        }
      };
    }
    pagination.appendChild(pageButton);
  }

  if (currentPage < totalPages) {
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.onclick = () => {
      if (currentQuery) {
        searchNews(currentPage + 1);
      } else {
        fetchNews(currentPage + 1);
      }
    };
    pagination.appendChild(nextButton);
  }
}

// 페이지 로드 시 모든 뉴스 불러오기
window.onload = () => fetchNews(currentPage);
