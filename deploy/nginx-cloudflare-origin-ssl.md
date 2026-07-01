# Nginx สำหรับอัปโหลดไฟล์ผ่าน Cloudflare Origin SSL

เอกสารนี้เป็นตัวอย่าง config สำหรับโปรเจ็ค `grant_online` ที่รัน Next.js อยู่หลัง Nginx และใช้ SSL แบบ Cloudflare Origin Server Certificate

แหล่งอ้างอิง Cloudflare IP ranges:

- IPv4: https://www.cloudflare.com/ips-v4
- IPv6: https://www.cloudflare.com/ips-v6

> ตรวจสอบ IP ranges จากลิงก์ด้านบนก่อน deploy จริง เพราะ Cloudflare อาจอัปเดตช่วง IP ได้

## โครงสร้างไฟล์ที่แนะนำ

```text
/etc/nginx/
  nginx.conf
  cloudflare-real-ip.conf
  sites-available/
    grant_online.conf
  sites-enabled/
    grant_online.conf -> ../sites-available/grant_online.conf
  ssl/
    cloudflare-origin.pem
    cloudflare-origin.key
```

## 1. Site Config

สร้างไฟล์:

```bash
sudo nano /etc/nginx/sites-available/grant_online.conf
```

ใส่ config นี้:

```nginx
# CHANGE ME:
# ถ้า Next.js รันบน host ตรงๆ ใช้ 127.0.0.1:3000 ได้
# ถ้าใช้ Docker network ให้เปลี่ยนเป็นชื่อ service เช่น grant_online_app:3000
upstream grant_online_next {
    server 127.0.0.1:3000;
    keepalive 32;
}

# รับ HTTP แล้ว redirect ไป HTTPS ทั้งหมด
server {
    listen 80;
    listen [::]:80;

    # CHANGE ME: เปลี่ยนเป็น domain จริงของโปรเจ็ค
    server_name example.com www.example.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    # CHANGE ME: เปลี่ยนเป็น domain จริงของโปรเจ็ค
    server_name example.com www.example.com;

    # CHANGE ME:
    # ใช้ Cloudflare Origin Server Certificate ที่สร้างจาก Cloudflare Dashboard
    # ห้ามใช้ Cloudflare Origin Certificate เป็น cert สำหรับ browser ตรงๆ โดยไม่ผ่าน Cloudflare
    ssl_certificate     /etc/nginx/ssl/cloudflare-origin.pem;
    ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # ใช้เพื่อให้ nginx เห็น IP ผู้ใช้จริงจาก Cloudflare แทน IP edge server
    include /etc/nginx/cloudflare-real-ip.conf;

    # CHANGE ME:
    # ต้องเท่ากับหรือมากกว่า limit ฝั่งแอป
    # โปรเจ็คนี้ตั้ง FILE_UPLOAD.MAX_SIZE = 20MB ดังนั้นตั้ง 20m เป็นค่าขั้นต่ำ
    client_max_body_size 20m;

    # Timeout ฝั่ง client upload
    # ถ้า user upload ผ่าน network ช้าเกินค่านี้ nginx จะตัด connection
    client_body_timeout 75s;
    client_header_timeout 30s;
    send_timeout 75s;

    # Buffer สำหรับ request body
    # ถ้าไฟล์ใหญ่กว่า buffer nginx จะเขียนลง temp path
    client_body_buffer_size 1m;

    # CHANGE ME:
    # path นี้ต้องมีอยู่จริง และ user ที่รัน nginx ต้องเขียนได้
    client_body_temp_path /var/cache/nginx/client_temp;

    # Header มาตรฐานที่ส่งต่อไป Next.js
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # Timeout ระหว่าง nginx กับ Next.js
    # ควรสัมพันธ์กับ timeout ฝั่ง frontend upload
    proxy_connect_timeout 10s;
    proxy_send_timeout 75s;
    proxy_read_timeout 75s;

    # อัปโหลดไฟล์ปกติของโปรเจ็ค
    location = /api/file-upload {
        client_max_body_size 20m;
        client_body_timeout 75s;
        proxy_send_timeout 75s;
        proxy_read_timeout 75s;

        # เปิด buffering เพื่อให้ nginx รับไฟล์ให้จบก่อนส่งต่อ upstream
        # เหมาะกับ Next.js เพราะลดโอกาส upstream ถูก slow client ลาก connection
        proxy_request_buffering on;

        proxy_pass http://grant_online_next;
    }

    # สร้างเอกสารและอัปโหลดไฟล์แนบที่เกี่ยวกับ document generation
    # ใช้ prefix เพราะ route ใต้ /api/generate/ มีหลาย type
    location ^~ /api/generate/ {
        client_max_body_size 20m;
        client_body_timeout 75s;
        proxy_send_timeout 75s;
        proxy_read_timeout 75s;
        proxy_request_buffering on;

        proxy_pass http://grant_online_next;
    }

    # API อื่นๆ
    location ^~ /api/ {
        proxy_pass http://grant_online_next;
    }

    # Static assets ของ Next.js
    location ^~ /_next/static/ {
        proxy_pass http://grant_online_next;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Page routes ทั้งหมด
    location / {
        proxy_pass http://grant_online_next;
    }
}
```

เปิดใช้งาน site:

```bash
sudo ln -s /etc/nginx/sites-available/grant_online.conf /etc/nginx/sites-enabled/grant_online.conf
```

ถ้ามี default site อยู่และไม่ใช้แล้ว:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

## 2. Cloudflare Real IP Config

สร้างไฟล์:

```bash
sudo nano /etc/nginx/cloudflare-real-ip.conf
```

ใส่ config นี้:

```nginx
# ไฟล์นี้ใช้เฉพาะกรณี traffic เข้า origin ผ่าน Cloudflare proxy เท่านั้น
# ถ้าไม่จำกัด set_real_ip_from ให้เป็น Cloudflare IP เท่านั้น อาจโดนปลอม CF-Connecting-IP ได้

# Cloudflare IPv4 ranges
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;

# Cloudflare IPv6 ranges
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;

# Cloudflare ส่ง IP ผู้ใช้จริงผ่าน header นี้
real_ip_header CF-Connecting-IP;

# เปิดไว้เพื่อกรณีมี proxy chain หลายชั้น แต่ยัง trust เฉพาะ IP ใน set_real_ip_from
real_ip_recursive on;
```

## 3. สิ่งที่ต้องแก้ให้ตรงกับโปรเจ็ค

รายการนี้ต้องแก้ก่อนนำไปใช้จริง:

1. `server_name example.com www.example.com`

เปลี่ยนเป็น domain จริง เช่น:

```nginx
server_name grant.example.go.th www.grant.example.go.th;
```

2. `ssl_certificate` และ `ssl_certificate_key`

เปลี่ยน path ให้ตรงกับไฟล์ Cloudflare Origin Certificate บน server:

```nginx
ssl_certificate     /etc/nginx/ssl/cloudflare-origin.pem;
ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;
```

3. `upstream grant_online_next`

ถ้า Next.js รันบนเครื่องเดียวกัน:

```nginx
server 127.0.0.1:3000;
```

ถ้า Next.js รันใน Docker network:

```nginx
server ชื่อ-service-nextjs:3000;
```

4. `client_max_body_size`

ต้องสัมพันธ์กับ limit ฝั่งแอป ปัจจุบันโปรเจ็คตั้งขนาดอัปโหลดไว้ที่ 20MB จึงใช้:

```nginx
client_max_body_size 20m;
```

ถ้าปรับ limit ในแอปเป็น 50MB ต้องปรับ nginx เป็น:

```nginx
client_max_body_size 50m;
```

5. `client_body_temp_path`

ต้องเป็น path ที่มีอยู่จริงและ nginx เขียนได้:

```bash
sudo mkdir -p /var/cache/nginx/client_temp
sudo chown -R www-data:www-data /var/cache/nginx/client_temp
```

ถ้า server ใช้ user อื่นแทน `www-data` ให้เปลี่ยน user ให้ตรงกับ nginx process

6. Cloudflare IP ranges

ตรวจสอบค่าล่าสุดก่อน deploy:

```bash
curl https://www.cloudflare.com/ips-v4
curl https://www.cloudflare.com/ips-v6
```

ถ้า IP ranges เปลี่ยน ให้แก้ `/etc/nginx/cloudflare-real-ip.conf` แล้ว reload nginx

## 4. Cloudflare Dashboard

ตั้งค่าใน Cloudflare:

1. SSL/TLS encryption mode

ใช้:

```text
Full (strict)
```

2. DNS proxy

เปิด proxy เป็น orange cloud สำหรับ record ที่ยิงเข้า origin

3. Origin Certificate

สร้าง certificate จาก:

```text
Cloudflare Dashboard > SSL/TLS > Origin Server > Create Certificate
```

นำ certificate และ private key ไปวางบน server ตาม path ที่ตั้งใน nginx

4. Firewall ฝั่ง origin

ควร allow inbound `80` และ `443` เฉพาะ Cloudflare IP ranges เท่านั้น เพื่อลดการยิงตรงเข้า origin

## 5. ตรวจสอบและ Reload

ทดสอบ nginx config:

```bash
sudo nginx -t
```

ถ้าผ่านแล้ว reload:

```bash
sudo systemctl reload nginx
```

ดู log nginx:

```bash
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

## 6. Log Format แนะนำ

ถ้าต้องการให้ log เห็น IP จริงจาก Cloudflare ชัดเจน ให้เพิ่มใน `http` block ของ `/etc/nginx/nginx.conf`:

```nginx
log_format cloudflare '$remote_addr - $remote_user [$time_local] '
                      '"$request" $status $body_bytes_sent '
                      '"$http_referer" "$http_user_agent" '
                      'cf_ray="$http_cf_ray" forwarded_for="$http_x_forwarded_for"';

access_log /var/log/nginx/access.log cloudflare;
```

หลังแก้ `nginx.conf` ให้ตรวจสอบและ reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. จุดที่ต้องระวัง

1. อย่า trust header `CF-Connecting-IP` จากทุก IP

ต้องใช้ `set_real_ip_from` เฉพาะ Cloudflare IP ranges เท่านั้น ไม่ควรใช้ `0.0.0.0/0`

2. อย่าเปิด origin ให้ยิงตรงได้ถ้าไม่จำเป็น

ถ้ามีคนยิงตรงเข้า origin โดยไม่ผ่าน Cloudflare จะ bypass WAF, rate limit และ DDoS protection ของ Cloudflare

3. อย่าตั้ง upload timeout ยาวเกินจำเป็น

ค่า `75s` เหมาะกับไฟล์ 20MB ใน network ปกติ ถ้าผู้ใช้งานอยู่ network ช้ามากอาจต้องปรับเพิ่ม แต่ไม่ควรเพิ่มแบบไม่มี limit เพราะจะทำให้ connection ค้างนาน

4. ตรวจสอบ limit ให้ตรงกันทั้งระบบ

ควรสอดคล้องกันทั้ง:

```text
Frontend upload timeout
Next.js API upload validation
Nginx client_max_body_size
Cloudflare plan/request limit
```

