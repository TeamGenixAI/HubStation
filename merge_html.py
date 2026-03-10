import re

BASE = 'D:/ClaudeCode/박태영3'

with open(BASE + '/New-Mobile.html', 'r', encoding='utf-8') as f:
    mobile_html = f.read()
with open(BASE + '/New-pc-pad.html', 'r', encoding='utf-8') as f:
    pc_html = f.read()

# ── PC body content 추출 ──────────────────────────────────────────
pc_body_m = re.search(r'<body[^>]*>(.*)</body>', pc_html, re.DOTALL)
pc_body = pc_body_m.group(1)

# ── Mobile body content 추출 ─────────────────────────────────────
mob_body_m = re.search(r'<body[^>]*>(.*)</body>', mobile_html, re.DOTALL)
mob_body = mob_body_m.group(1)

# ── 공통 toast/script 제거 (merged에서 한 번만 추가) ───────────────

def strip_shared(body):
    body = re.sub(r'\s*<div[^>]*id="toast-1"[\s\S]*?</div>\s*</div>', '', body)
    body = re.sub(r'\s*<script>\s*document\.querySelectorAll[\s\S]*?</script>', '', body)
    body = body.replace('<script src="assets/bootstrap/js/bootstrap.min.js"></script>', '')
    body = body.replace('<script src="assets/js/bs-init.js"></script>', '')
    body = re.sub(r'\s*<script type="text/javascript" th:inline="javascript">[\s\S]*?</script>', '', body)
    return body

pc_body  = strip_shared(pc_body)
mob_body = strip_shared(mob_body)

# PC 전용 스크립트 제거
pc_body = re.sub(r'\s*<script>[\s\S]*?let lastTap[\s\S]*?</script>', '', pc_body)
pc_body = pc_body.replace('<script type="text/javascript" src="js/new-pc-tab-websocket.js"></script>', '')

# Mobile 전용 스크립트 제거
mob_body = mob_body.replace('<script type="text/javascript" src="js/new-mobile-websocket.js"></script>', '')

# ── Mobile HTML ID/name 접두사 변환 (m-) ─────────────────────────
def prefix_mobile(html):
    html = re.sub(r'id="(tab-\d+)"', r'id="m-\1"', html)
    html = re.sub(r'href="#(tab-\d+)"', r'href="#m-\1"', html)
    html = re.sub(r'id="(DO\d+\w*)"', r'id="m-\1"', html)
    html = re.sub(r'for="(DO\d+\w*)"', r'for="m-\1"', html)
    html = re.sub(r'name="(DO\d+G)"', r'name="m-\1"', html)
    html = re.sub(r'id="(P\d+[A-Za-z0-9]*)"', r'id="m-\1"', html)
    html = re.sub(r'id="(SP\d+[A-Za-z0-9]*)"', r'id="m-\1"', html)
    html = re.sub(r'id="(DI\d+[A-Za-z0-9]*)"', r'id="m-\1"', html)
    html = re.sub(r'id="(A\d+)"', r'id="m-\1"', html)
    html = re.sub(r'for="(P\d+[A-Za-z0-9]*)"', r'for="m-\1"', html)
    html = html.replace('id="BtnDownload"', 'id="m-BtnDownload"')
    return html

mob_body = prefix_mobile(mob_body)

# ── 통합 HTML 생성 ────────────────────────────────────────────────
merged_html = '''<!DOCTYPE html>
<html data-bs-theme="light" lang="ko" style="width:95vw;height:90vh;font-size:15px;">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>PTY3</title>
    <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/bss-overrides.css">
    <link rel="stylesheet" href="assets/css/MainPannel.css">
    <link rel="stylesheet" href="assets/css/styles.css">
</head>

<body class="w-100 h-100">

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- PC / PAD 레이아웃 (lg 이상: ≥992px)                        -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div class="d-none d-lg-block" style="width:100%;height:100%;">
''' + pc_body + '''
    </div>

    <!-- ═══════════════════════════════════════════════════════════ -->
    <!-- 모바일 레이아웃 (lg 미만: <992px)                           -->
    <!-- ═══════════════════════════════════════════════════════════ -->
    <div class="d-block d-lg-none">
''' + mob_body + '''
    </div>

    <!-- 공유 Toast 알림 -->
    <div class="toast fade text-center bg-info position-fixed top-50 start-50 translate-middle hide"
         role="alert" data-bs-delay="2500" id="toast-1" style="margin:auto;font-size:30px;">
        <div class="toast-body" role="alert" style="font-size:30px;">
            <p class="fs-6 fw-semibold" id="ToastMsg"
               style="font-size:xx-large;color:var(--bs-body-bg);text-align:center;">Toast message</p>
        </div>
    </div>

    <!-- 더블탭/더블클릭 전체화면 (PC) -->
    <script>
    let lastTap = 0;
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    document.addEventListener('touchend', function(e) {
        const now = new Date().getTime();
        if (now - lastTap < 300) { toggleFullscreen(); }
        lastTap = now;
    });
    document.addEventListener('dblclick', toggleFullscreen);
    </script>

    <!-- 포커스 방지 -->
    <script>
    document.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function(el) {
        el.addEventListener('focus', function(e) { e.target.blur(); });
    });
    </script>

    <script src="assets/bootstrap/js/bootstrap.min.js"></script>

    <script type="text/javascript" th:inline="javascript">
        let sockwtInfo = [[${wsuri}]];
        let aiinform   = [[${aiInform}]];
        let parmvalues = [[${parmValues}]];
        let parminform = [[${parmInform}]];
        let doinform   = [[${doInform}]];
        let diinform   = [[${diInform}]];
    </script>

    <script type="text/javascript" src="js/merged-websocket.js"></script>

</body>

</html>
'''

with open(BASE + '/New-merged.html', 'w', encoding='utf-8') as f:
    f.write(merged_html)

print("HTML 통합 완료 -", merged_html.count('\n'), "줄")
