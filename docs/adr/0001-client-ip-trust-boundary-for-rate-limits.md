# ใช้ IP ที่ Nginx normalize แล้วเป็น source of truth สำหรับ rate limit

Status: accepted

ระบบ deploy หลัง Cloudflare และ Nginx โดย Nginx ตั้ง `set_real_ip_from` เฉพาะ Cloudflare IP ranges และใช้ `real_ip_header CF-Connecting-IP` เพื่อแปลง `$remote_addr` ให้เป็น IP ผู้ใช้จริงก่อนส่งต่อเข้า Next.js. เราตัดสินใจให้แอปเชื่อ `X-Real-IP` ที่ Nginx overwrite จาก `$remote_addr` เป็นหลักสำหรับ rate limit, audit, และ session metadata แทนการอ่านค่าซ้ายสุดของ `X-Forwarded-For`.

## Considered Options

1. อ่านค่าซ้ายสุดของ `X-Forwarded-For` ในแอป
   - ปฏิเสธ เพราะ `X-Forwarded-For` อาจมีค่าที่ client ส่งมาเองอยู่ทางซ้าย และ Nginx ที่ใช้ `$proxy_add_x_forwarded_for` จะ append hop ของตัวเองต่อท้าย chain ทำให้ attacker spoof subject สำหรับ rate limit ได้

2. ให้แอปเชื่อ `CF-Connecting-IP` โดยตรง
   - ปฏิเสธเป็น primary path เพราะแอปไม่รู้ว่า request hop ก่อนหน้ามาจาก Cloudflare จริงหรือไม่ ถ้า origin หรือ Next.js ถูกยิงตรงหรือ proxy ไม่ overwrite header นี้ ผู้โจมตีสามารถปลอม header ได้

3. ให้ Nginx เป็น trust boundary และส่ง `X-Real-IP: $remote_addr`
   - เลือกทางนี้ เพราะหลัง `real_ip_header CF-Connecting-IP` ทำงานแล้ว `$remote_addr` คือ IP ผู้ใช้จริงที่ผ่าน Cloudflare trust list แล้ว ส่วนแอปมีหน้าที่ validate header เดี่ยวนี้และ fallback ไป `X-Forwarded-For` ค่าขวาสุดเฉพาะเมื่อไม่มี `X-Real-IP`

## Consequences

- Nginx config ต้องใช้ `proxy_set_header X-Real-IP $remote_addr;` ไม่ใช่ `$realip_remote_addr` เพราะ `$realip_remote_addr` คือ address เดิมก่อน realip replacement
- แอปไม่ใช้ `CF-Connecting-IP` เป็น fallback สำหรับ client IP
- ถ้า `X-Real-IP` มีค่าแต่ไม่ใช่ IP ที่ valid แอปต้องคืน `unknown` และไม่ fallback ไปเชื่อ `X-Forwarded-For`
- Production ต้องปิดหรือ firewall origin ไม่ให้ถูกยิงตรงนอก Cloudflare path และต้องอัปเดต Cloudflare IP ranges เมื่อ Cloudflare เปลี่ยน

## References

- Nginx realip module: https://nginx.org/en/docs/http/ngx_http_realip_module.html
- Nginx proxy module: https://nginx.org/en/docs/http/ngx_http_proxy_module.html
- Cloudflare HTTP request headers: https://developers.cloudflare.com/fundamentals/reference/http-headers/
