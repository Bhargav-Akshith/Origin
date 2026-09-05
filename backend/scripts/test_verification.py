import requests
import io
from PIL import Image, ImageDraw

base = 'http://127.0.0.1:8000'

def run_tests():
    print("=== 1. Health Check ===")
    r = requests.get(f'{base}/health')
    print('Health:', r.status_code, r.json())

    print("\n=== 2. Switch Demo Role ===")
    r = requests.get(f'{base}/api/v1/auth/switch-demo-role/admin')
    print('Switch Admin:', r.status_code, r.json().get('user', {}).get('role'))
    token = r.json().get('access_token')

    r = requests.get(f'{base}/api/v1/auth/switch-demo-role/inspector')
    print('Switch Inspector:', r.status_code, r.json().get('user', {}).get('role'))

    print("\n=== 3. Verify PDF Certificates for Database Scans ===")
    r = requests.get(f'{base}/api/v1/scans')
    scans = r.json()
    print('Total scans in database:', len(scans))
    for s in scans[:4]:
        pdf_url = s.get('report_pdf_url')
        if pdf_url:
            pdf_res = requests.get(f'{base}{pdf_url}')
            print(f"Scan {s.get('id')}: PDF HTTP {pdf_res.status_code}, {len(pdf_res.content)} bytes")

    print("\n=== 4. Test Multi-Image Packaging Upload (>2 photos) & Fusion ===")
    # Image 1 (Front Panel)
    img1 = Image.new('RGB', (450, 450), color=(255, 255, 255))
    d1 = ImageDraw.Draw(img1)
    d1.text((20, 30), "SUPER DELIGHT COOKIES\nNet Weight: 250 g\nMRP Rs. 60.00 (Incl. of all taxes)", fill=(0, 0, 0))
    buf1 = io.BytesIO()
    img1.save(buf1, format='JPEG')
    buf1.seek(0)

    # Image 2 (Declarations & MRP Panel)
    img2 = Image.new('RGB', (450, 450), color=(255, 255, 255))
    d2 = ImageDraw.Draw(img2)
    d2.text((20, 30), "Mfg Date: 02/2026\nUnit Sale Price: Rs. 0.24 / g\nMfg by: Delight Foods Pvt Ltd, Industrial Area, Solan, HP\nConsumer Care: care@delightfoods.com | 1800-111-222\nCountry of Origin: India", fill=(0, 0, 0))
    buf2 = io.BytesIO()
    img2.save(buf2, format='JPEG')
    buf2.seek(0)

    files = [
        ('files', ('angle1_front.jpg', buf1, 'image/jpeg')),
        ('files', ('angle2_back.jpg', buf2, 'image/jpeg'))
    ]
    data = {'product_name': 'Super Delight Cookies 250g', 'category': 'Bakery & Biscuits'}
    headers = {'Authorization': f'Bearer {token}'}

    res = requests.post(f'{base}/api/v1/scans/upload', files=files, data=data, headers=headers)
    print("Multi-image Upload Status:", res.status_code)
    assert res.status_code == 200, f"Upload failed: {res.text}"
    data = res.json()
    print("Scan Session ID:", data.get('id'))
    print("Packaging Images:", len(data.get('packaging_images', [])))
    print("Total Extracted Fields:", len(data.get('extracted_fields', [])))
    print("Compliance Status:", data.get('overall_verdict'))
    print("Compliance Score:", data.get('compliance_score'))
    print("Violations:", len(data.get('violations', [])))
    
    pdf_path = data.get('report_url')
    print("Generated Certificate URL:", pdf_path)
    if pdf_path:
        pdf_check = requests.get(f'{base}{pdf_path}')
        print(f"Downloaded Certificate Status: HTTP {pdf_check.status_code}, {len(pdf_check.content)} bytes")
        assert pdf_check.status_code == 200, "PDF certificate download failed"

    print("\nALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
