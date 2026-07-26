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

1. `news-app` フォルダーを GitHub リポジトリにコミットします。
2. Netlify にログインし、`news-app` フォルダーを新規サイトとしてデプロイします。
   - GitHub 連携でリポジトリを選び、ブランチを指定します。
   - ビルドコマンドは不要です。
   - パブリッシュディレクトリは `news-app` ではなく `news-app` の中身が root になる構成です。Netlify の自動検出で問題なければそのままで OK です。
3. `news-app/netlify.toml` は関数の場所を `functions` に設定し、静的ルートを `.` にしています。
4. デプロイ完了後、Netlify が発行したサイト URL を確認します。
5. `app.js` の `serverlessProxyBase` を次のように設定します。
   - 例: `const serverlessProxyBase = 'https://your-netlify-site.netlify.app/.netlify/functions/news-proxy?url=';`
   - `your-netlify-site` はそのままでは動きません。Netlify が発行したあなたのサイト名に必ず置き換えてください。
6. GitHub Pages にデプロイしている静的サイトはそのまま使い、RSS 取得は Netlify 関数経由で行います。

#### Netlify CLI でのデプロイ手順（任意）

1. `npm install -g netlify-cli` を実行。
2. `cd news-app` で移動。
3. `netlify login` を実行してログイン。
4. `netlify deploy --prod --dir=. --functions=functions` を実行。
5. デプロイ後に通知される URL を `serverlessProxyBase` に設定します。

#### 重要な補足

- Netlify 関数 URL は `https://<your-site>.netlify.app/.netlify/functions/news-proxy?url=` の形式です。
- GitHub Pages 上では `app.js` から直接 RSS を取得せず、Netlify 関数を経由してください。
- `serverlessProxyBase` を設定すると、公開プロキシのフォールバックは使わなくなります。
