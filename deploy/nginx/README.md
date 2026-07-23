# Deploy Nginx สำหรับ `grant_online`

คู่มือนี้ใช้กับไฟล์ config ที่อยู่ในโฟลเดอร์นี้:

- [grant_online.conf](grant_online.conf)
- [cloudflare-real-ip.conf](cloudflare-real-ip.conf)

คู่มือนี้เหมาะกับกรณี:

- แอปรันด้วย Next.js บน port `3000`
- ใช้ Nginx เป็น reverse proxy
- ใช้ Cloudflare หน้า origin
- ใช้ Cloudflare Origin Certificate

## 1. สิ่งที่ต้องเตรียมก่อน

ต้องมีสิ่งนี้ก่อน deploy:

- domain จริง เช่น `grant.example.go.th`
- Cloudflare เปิด proxy เป็น orange cloud
- Cloudflare SSL mode เป็น `Full (strict)`
- เครื่องเซิร์ฟเวอร์รันแอปที่ `127.0.0.1:3000`
- ติดตั้ง `nginx` แล้ว

## 2. ไฟล์ที่ต้องแก้ก่อนใช้งาน

เปิดไฟล์ [grant_online.conf](grant_online.conf) แล้วแก้ 3 จุดหลัก:

1. `server_name`

จาก:

```nginx
server_name example.com www.example.com;
```

เป็น:

```nginx
server_name grant.example.go.th www.grant.example.go.th;
```

2. `ssl_certificate` และ `ssl_certificate_key`

จาก:

```nginx
ssl_certificate     /etc/nginx/ssl/cloudflare-origin.pem;
ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;
```

ให้เปลี่ยนเป็น path ที่คุณจะวาง Cloudflare Origin Certificate จริง

3. `upstream grant_online_next`

ถ้า Next.js รันบนเครื่องเดียวกันและฟังที่ port `3000` ใช้ค่าเดิมได้:

```nginx
upstream grant_online_next {
    server 127.0.0.1:3000;
    keepalive 32;
}
```

ถ้ารันใน Docker network ให้เปลี่ยน `127.0.0.1:3000` เป็นชื่อ service เช่น:

```nginx
server grant_online_app:3000;
```

## 3. วางไฟล์ cert บนเซิร์ฟเวอร์

สร้าง directory สำหรับ SSL:

```bash
sudo mkdir -p /etc/nginx/ssl
```

จากนั้นนำ Cloudflare Origin Certificate และ private key ไปวาง เช่น:

- `/etc/nginx/ssl/cloudflare-origin.pem`
- `/etc/nginx/ssl/cloudflare-origin.key`

แนะนำให้จำกัด permission:

```bash
sudo chmod 600 /etc/nginx/ssl/cloudflare-origin.key
sudo chmod 644 /etc/nginx/ssl/cloudflare-origin.pem
```

## 4. สร้าง temp directory สำหรับ upload

ใน config นี้มีบรรทัด:

```nginx
client_body_temp_path /var/cache/nginx/client_temp;
```

ดังนั้นต้องสร้าง directory นี้เอง และให้ user ที่รัน nginx เขียนได้

บน Ubuntu/Debian ส่วนใหญ่ nginx จะรันเป็น `www-data`:

```bash
sudo mkdir -p /var/cache/nginx/client_temp
sudo chown -R www-data:www-data /var/cache/nginx/client_temp
sudo chmod 700 /var/cache/nginx/client_temp
```

ถ้าเครื่องของคุณ nginx ไม่ได้รันเป็น `www-data` ให้เปลี่ยน owner ให้ตรงกับ user จริงของ nginx

## 5. copy config ไปที่ nginx

copy 2 ไฟล์นี้ไปยัง path ของ nginx:

```bash
sudo cp deploy/nginx/grant_online.conf /etc/nginx/sites-available/grant_online.conf
sudo cp deploy/nginx/cloudflare-real-ip.conf /etc/nginx/cloudflare-real-ip.conf
```

จากนั้นเปิดไฟล์ site config ที่ปลายทางและแก้ `server_name`, `ssl_certificate`, `ssl_certificate_key`, และ upstream ให้เรียบร้อย

## 6. เปิดใช้งาน site

```bash
sudo ln -s /etc/nginx/sites-available/grant_online.conf /etc/nginx/sites-enabled/grant_online.conf
```

ถ้ามี default site เดิมและไม่ใช้แล้ว:

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

## 7. ทดสอบ config

```bash
sudo nginx -t
```

ถ้าผ่านจะเห็นประมาณนี้:

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## 8. reload nginx

```bash
sudo systemctl reload nginx
```

ถ้ายังไม่เคยรัน:

```bash
sudo systemctl enable nginx
sudo systemctl restart nginx
```

## 9. ตรวจสอบแอปหลัง deploy

เช็กว่า Next.js ฟังที่ `3000`:

```bash
ss -ltnp | grep 3000
```

เช็กว่า Nginx proxy เข้าแอปได้:

```bash
curl -I http://127.0.0.1:3000
curl -I https://your-domain.com
```

เช็ก log:

```bash
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

## 10. จุดที่ต้องเช็กให้ตรงกับระบบ

1. `client_max_body_size`

ตอนนี้แอปจำกัดไฟล์ไว้ที่ `15 MB` และ Nginx ตั้ง `20m` เพื่อเผื่อ multipart overhead ถ้าฝั่งแอปเพิ่ม limit ต้องเพิ่มตรงนี้ด้วย

2. `AUTH_URL`

ในแอปฝั่ง password reset ใช้ canonical URL จาก env ดังนั้น production ต้องตั้ง `AUTH_URL` เป็น `https://โดเมนจริง`

ตัวอย่าง:

```env
AUTH_URL=https://grant.example.go.th
```

3. Cloudflare IP ranges

ไฟล์ [cloudflare-real-ip.conf](cloudflare-real-ip.conf) ใช้รายการ IP จาก Cloudflare ถ้ามีการเปลี่ยนในอนาคตต้องอัปเดตไฟล์นี้ด้วย

ตรวจสอบได้จาก:

```bash
curl https://www.cloudflare.com/ips-v4
curl https://www.cloudflare.com/ips-v6
```

## 11. คำสั่งรวมแบบสั้น

ถ้าต้องการ flow แบบรวดเร็ว:

```bash
sudo mkdir -p /etc/nginx/ssl
sudo mkdir -p /var/cache/nginx/client_temp
sudo chown -R www-data:www-data /var/cache/nginx/client_temp
sudo chmod 700 /var/cache/nginx/client_temp

sudo cp deploy/nginx/grant_online.conf /etc/nginx/sites-available/grant_online.conf
sudo cp deploy/nginx/cloudflare-real-ip.conf /etc/nginx/cloudflare-real-ip.conf

sudo ln -s /etc/nginx/sites-available/grant_online.conf /etc/nginx/sites-enabled/grant_online.conf
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
```

## 12. หมายเหตุสำคัญ

- อย่า trust `CF-Connecting-IP` จากทุก source โดยไม่มี `set_real_ip_from`
- อย่าเปิด origin ให้ยิงตรงได้ถ้าไม่จำเป็น
- ถ้าใช้ firewall ควร allow `80/443` เฉพาะ Cloudflare IP ranges
- ถ้าแก้ config แล้วต้องรัน `sudo nginx -t` ก่อน `reload` ทุกครั้ง
