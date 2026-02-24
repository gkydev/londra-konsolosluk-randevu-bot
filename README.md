# Londra Konsolosluk Randevu Botu

Cloudflare Worker kullanarak Londra Turk Konsoloslugu randevu sayfasini duzenli olarak kontrol eder. Belirlediginiz gun esiginin altinda bir randevu bulursa Telegram uzerinden bildirim gonderir.

## Gereksinimler

- [Node.js](https://nodejs.org/) (v18+)
- Cloudflare hesabi
- Telegram botu ve chat ID

## Kurulum

### 1. Wrangler'i yukleyin

```bash
npm install -g wrangler
```

### 2. Cloudflare hesabiniza giris yapin

```bash
wrangler login
```

### 3. Telegram bilgilerinizi ekleyin

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
```

Her komuttan sonra ilgili degeri yapistirin.

### 4. Ayarlari yapin

`worker-bot.js` icindeki `DAY_THRESHOLD` degerini isteginize gore degistirin. Varsayilan olarak 10 gun icerisindeki randevular icin bildirim gonderir.

### 5. Deploy edin

```bash
wrangler deploy
```

Bot, her 5 dakikada bir otomatik olarak calisacaktir. `wrangler.toml` dosyasindaki cron ifadesini degistirerek sikligi ayarlayabilirsiniz.

## Test

Yerel olarak test etmek icin:

```bash
wrangler dev
```

Ardindan tarayicinizda `http://localhost:8787` adresini acin.

## Telegram Bot Olusturma

1. Telegram'da [@BotFather](https://t.me/BotFather) ile konusun
2. `/newbot` komutu ile yeni bot olusturun
3. Size verilen token'i `TELEGRAM_BOT_TOKEN` olarak kullanin
4. Chat ID'nizi ogrenmek icin bota mesaj gonderdikten sonra `https://api.telegram.org/bot<TOKEN>/getUpdates` adresini ziyaret edin
