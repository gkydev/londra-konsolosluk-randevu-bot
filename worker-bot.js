export default {
    async scheduled(event, env, ctx) {
      await checkAppointments(env);
    },
  
    async fetch(request, env) {
      await checkAppointments(env);
      return new Response("Done");
    }
  };
  
  async function checkAppointments(env) {
    const res1 = await fetch('https://www.konsolosluk.gov.tr/Appointment/Index/5007', {
      redirect: 'manual',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Upgrade-Insecure-Requests': '1',
      }
    });
  
    const setCookie = res1.headers.get('set-cookie') || '';
    const sessionId = setCookie.match(/ASP\.NET_SessionId=([^;]+)/)?.[1];
  
    if (!sessionId) {
      console.error('Failed to get session cookie');
      return;
    }
  
    const cookies = `ASP.NET_SessionId=${sessionId}; langCookie=tr`;
    console.log('Got session:', sessionId);
  
    await fetch('https://www.konsolosluk.gov.tr/Home/Index', {
      headers: {
        'Cookie': cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Referer': 'https://www.konsolosluk.gov.tr/Appointment/Index/5007',
      }
    });
  
    await fetch('https://www.konsolosluk.gov.tr/Home/GetMissionsList', {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.konsolosluk.gov.tr/Home/Index',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      body: 'countryId=9985'
    });
  
    await fetch('https://www.konsolosluk.gov.tr/Home/MissionSelected', {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.konsolosluk.gov.tr/Home/Index',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      body: 'selectedMission=268'
    });
  
    const res5 = await fetch('https://www.konsolosluk.gov.tr/Appointment/Index/5007', {
      headers: {
        'Cookie': cookies,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en;q=0.8',
        'Referer': 'https://www.konsolosluk.gov.tr/Appointment/AppointmentList',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Upgrade-Insecure-Requests': '1',
      }
    });
  
    const html = await res5.text();
    //console.log(html)
    const DAY_THRESHOLD = 10; // change this
  
    const match = html.match(/"DateFormatAppointment":"([^"]+)"/);
    const date = match?.[1];
    console.log('Date:', date);
  
    if (date) {
      const appointmentDate = new Date(date);
      const today = new Date();
      const diffDays = Math.ceil((appointmentDate - today) / (1000 * 60 * 60 * 24));
      
      console.log(`Appointment in ${diffDays} days`);
  
      if (diffDays <= DAY_THRESHOLD) {
        await sendTelegram(env, `✅ London appointment in ${diffDays} days!\nDate: ${date}\nBook now: https://www.konsolosluk.gov.tr/Appointment/Index/5007`);
      } else {
        console.log(`Too far away (${diffDays} days). Threshold: ${DAY_THRESHOLD} days`);
      }
    } else {
      console.log('No date found in page');
    }
  } // ← this was missing!
  
  async function sendTelegram(env, message) {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: message })
    });
    if (!res.ok) console.error('Telegram error:', await res.text());
  }