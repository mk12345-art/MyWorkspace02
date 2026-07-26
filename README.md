# 24時間ニュースアプリ

このアプリは、直近24時間以内の国内・海外ニュースを20件まで表示します。

## 使い方

1. `index.html` をブラウザーで開きます。
2. ページが読み込まれると、自動的にニュースを取得します。
3. 「更新」ボタンを押すと、ニュースを再取得します。

## 特徴

- 国内と海外のニュースを混在して表示
- 見出し・概要・公開日時・記事リンクを表示
- 24時間以内に公開された記事のみ表示
- 最大20件まで表示

## 注意

- ブラウザーの制限により、RSS読み込みにプロキシを使っています。
- GitHub Pages など HTTPS 配信環境では、HTTP の RSS フィードを直接取得するとブロックされます。そのため、すべてのニュースソースは HTTPS に対応している必要があります。
- 一部のプロキシサービスやニュースソースは一時的に利用できない場合があります。

## サーバーレス関数を使ったプロキシ

GitHub Pages 自体はサーバーレス関数をホストできないため、以下のようにフロントエンドと関数を別にデプロイする構成が必要です。

1. `news-app/functions/news-proxy.js` を Netlify などの関数ホストにデプロイする。
2. `app.js` の `serverlessProxyBase` に、関数の公開 URL を設定する。
   - 例: `https://your-site.netlify.app/.netlify/functions/news-proxy?url=`
3. GitHub Pages には静的な `index.html` と `app.js` を置き、関数呼び出し先をこの URL にする。

### Netlify での使い方

- `news-app/functions/news-proxy.js` は API プロキシとして機能します。
- `news-app/netlify.toml` を追加済みです。
- GitHub Pages の静的ファイルと関数ホストを組み合わせることで、CORS / mixed-content 問題を回避できます。
