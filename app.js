const newsList = document.getElementById('news-list');
const status = document.getElementById('status');
const refreshButton = document.getElementById('refresh-button');

const serverlessProxyBase = 'https://playful-pavlova-af0e9d.netlify.app/.netlify/functions/news-proxy?url='; // Netlify の公開関数 URL を設定します。
const proxyBases = serverlessProxyBase
  ? [serverlessProxyBase]
  : [
      'https://api.allorigins.win/raw?url=',
      'https://thingproxy.freeboard.io/fetch/'
    ];
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const feedSources = [
  { title: 'NHK ニュース', url: 'https://www3.nhk.or.jp/rss/news/cat0.xml', region: '国内' },
  { title: 'BBC News', url: 'https://feeds.bbci.co.uk/news/rss.xml', region: '海外' },
  { title: 'CNN', url: 'https://rss.cnn.com/rss/edition.rss', region: '海外' }
];

function parseFeed(xmlText, source) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, 'application/xml');
  const parseError = xml.querySelector('parsererror');
  if (parseError) {
    throw new Error('XMLを解析できませんでした。');
  }

  return Array.from(xml.querySelectorAll('item')).map(item => {
    const title = item.querySelector('title')?.textContent?.trim() || '見出しなし';
    const descriptionRaw = item.querySelector('description')?.textContent || '';
    const description = descriptionRaw.replace(/<[^>]+>/g, '').trim();
    const linkNode = item.querySelector('link');
    const link = linkNode?.textContent?.trim() || linkNode?.getAttribute('href') || '';
    const pubDateText = item.querySelector('pubDate')?.textContent || item.querySelector('dc\:date')?.textContent || '';
    const published = pubDateText ? new Date(pubDateText) : new Date();

    return {
      title,
      description,
      link,
      published,
      source: source.title,
      region: source.region
    };
  });
}

function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '日時不明';
  }
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderNews(items) {
  newsList.innerHTML = '';
  if (!items.length) {
    status.textContent = '直近24時間の国内・海外ニュースが見つかりませんでした。もう一度更新してください。';
    return;
  }

  status.textContent = `最新 ${items.length} 件を表示しています。`;

  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'news-card';

    const title = document.createElement('h2');
    title.textContent = item.title;

    const description = document.createElement('p');
    description.textContent = item.description || '概要がありません。';

    const meta = document.createElement('div');
    meta.className = 'news-meta';
    meta.innerHTML = `
      <span>${item.region}</span>
      <span>${item.source}</span>
      <span>${formatDate(item.published)}</span>
      <a href="${item.link}" target="_blank" rel="noopener noreferrer">記事を開く</a>
    `;

    li.append(title, description, meta);
    newsList.appendChild(li);
  });
}

async function fetchFeed(source) {
  let lastError = null;

  for (const base of proxyBases) {
    const url = base + encodeURIComponent(source.url);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        lastError = new Error(`${source.title} を取得できませんでした。ステータス: ${response.status}`);
        continue;
      }
      return response.text();
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`${source.title} を取得できませんでした。${lastError?.message || ''}`);
}

async function loadNews() {
  status.textContent = 'ニュースを取得中です...';
  newsList.innerHTML = '';
  refreshButton.disabled = true;

  try {
    const now = Date.now();
    const feedPromises = feedSources.map(async source => {
      const xmlText = await fetchFeed(source);
      return parseFeed(xmlText, source);
    });

    const feedResults = await Promise.all(feedPromises);
    const allItems = feedResults.flat();
    const recentItems = allItems
      .filter(item => item.published && now - item.published.getTime() <= ONE_DAY_MS)
      .sort((a, b) => b.published - a.published)
      .slice(0, 20);

    renderNews(recentItems);
  } catch (error) {
    status.textContent = `エラー: ${error.message}`;
  } finally {
    refreshButton.disabled = false;
  }
}

refreshButton.addEventListener('click', loadNews);
window.addEventListener('load', loadNews);
