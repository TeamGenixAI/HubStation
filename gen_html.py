#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_html.py
엑셀 파일(ParmForSpring.xlsx, DoForSpring.xlsx)로부터 testmerge.html 자동 생성

규칙:
  DoForSpring.xlsx  → 라디오 버튼 박스
  ParmForSpring.xlsx
    OnMsg == "bitbit"  → 체크박스 박스
    그 외              → number input 박스

  TagCategory → 탭 이름
  GroupName   → tagBoxDisplay 박스의 ribbon 텍스트
  OnMsg/OffMsg (DO) → 첫 번째/두 번째 라디오 라벨
  TagName (bitbit)  → 체크박스 for-label 내용
  TagName (number)  → number input 앞 레이블
  UnitName (number) → number input 뒤 단위
"""

import math
import openpyxl
from collections import OrderedDict

# ─────────────────────────────────────────────
# 엑셀 읽기
# ─────────────────────────────────────────────
def read_xlsx(path):
    wb = openpyxl.load_workbook(path)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    headers = rows[0]
    result = []
    for row in rows[1:]:
        if any(v is not None for v in row):
            result.append(dict(zip(headers, row)))
    return result


# ─────────────────────────────────────────────
# 개별 요소 HTML 조각 생성
# ─────────────────────────────────────────────
def radio_inner_html(item):
    """라디오 버튼 2개 HTML (ribbon 제외)"""
    n         = item['InstanceNo']
    on_label  = item.get('OnMsg')  or '켜짐'
    off_label = item.get('OffMsg') or '꺼짐'
    unit      = item.get('UnitName') or 'NORMAL'

    if unit == 'MODE':
        on_val, off_val = 'schedule', 'manual'
    else:
        on_val, off_val = 'start', 'stop'

    return (
        '<div class="form-check" style="color:rgb(0,0,150);font-size:2rem;'
        'position:relative;display:inline-flex;width:auto;">'
        f'<input class="form-check-input" type="radio" id="DO{n}T" name="DO{n}G" '
        f'value="{on_val}" onclick="DoActionClick(this)">'
        f'<label class="form-check-label" for="DO{n}T">{on_label}</label></div>'
        '<div class="form-check" style="color:rgb(0,0,150);font-size:2rem;'
        'position:relative;display:inline-flex;margin-left:0.7rem;width:auto;">'
        f'<input class="form-check-input" type="radio" id="DO{n}F" name="DO{n}G" '
        f'value="{off_val}" onclick="DoActionClick(this)">'
        f'<label class="form-check-label" for="DO{n}F">{off_label}</label></div>'
    )


def checkbox_inner_html(item):
    """체크박스 + 라벨 HTML (ribbon 제외)"""
    uid      = item.get('UnitName') or f"P{item['InstanceNo']}Bx"
    tag_name = item.get('TagName') or ''

    return (
        f'<div class="form-check" style="color:rgb(0,0,150);font-size:2rem;'
        f'position:relative;display:inline-flex;width:auto;margin-right:0.5rem;">'
        f'<input class="form-check-input" type="checkbox" id="{uid}" '
        f'style="font-weight:bold;border-width:2px;border-style:solid;">'
        f'<label class="form-check-label" for="{uid}" '
        f'style="font-size:1.4rem;margin:2px;">{tag_name}</label></div>'
    )


def number_inner_html(item):
    """TagName + number input + UnitName HTML (ribbon 제외)"""
    n        = item['InstanceNo']
    tag_name = item.get('TagName') or ''
    unit     = item.get('UnitName') or ''

    label_html = f'<small style="margin:0.2rem;">{tag_name}</small>' if tag_name else ''
    unit_html  = f'<small style="margin:3px;">{unit}</small>'        if unit else ''

    return (
        f'<div class="d-inline-flex align-items-center" style="margin:0.2rem;">'
        f'{label_html}'
        f'<input type="number" inputmode="decimal" id="P{n}" style="width:4.5rem;">'
        f'{unit_html}'
        f'</div>'
    )


# ─────────────────────────────────────────────
# GroupName 그룹 → 하나의 tagBoxDisplay 박스
# ─────────────────────────────────────────────
def make_group_box(group_name, items, source):
    """
    같은 GroupName의 항목들을 하나의 tagBoxDisplay로 합친다.
    source: 'do' | 'parm'
    """
    ribbon = f'<span class="ribbon">{group_name}</span>'

    if source == 'do':
        # 라디오 버튼 그룹 (DO는 GroupName당 보통 1개지만 다수도 허용)
        inner = ''.join(radio_inner_html(it) for it in items)
        return (
            '<div class="d-xxl-flex justify-content-between flex-wrap tagBoxDisplay" '
            'style="max-width:15rem;">'
            f'{inner}{ribbon}</div>'
        )
    else:
        # Parm: checkbox와 number input 혼합 가능 — checkbox를 앞으로 정렬
        sorted_items = (
            [it for it in items if str(it.get('OnMsg', '')).lower() == 'bitbit'] +
            [it for it in items if str(it.get('OnMsg', '')).lower() != 'bitbit']
        )
        parts = []
        for it in sorted_items:
            if str(it.get('OnMsg', '')).lower() == 'bitbit':
                parts.append(checkbox_inner_html(it))
            else:
                parts.append(number_inner_html(it))
        inner = ''.join(parts)
        return (
            '<div class="d-flex align-items-center flex-wrap tagBoxDisplay" '
            'style="width:auto;padding-left:10px;padding-right:0px;">'
            f'{inner}{ribbon}</div>'
        )


# ─────────────────────────────────────────────
# 탭 레이아웃 생성
# ─────────────────────────────────────────────
def build_tab_boxes(do_items, parm_items):
    """한 탭에 속한 DO/Parm 항목을 GroupName으로 묶어 tagBoxDisplay 박스 리스트로 변환"""
    boxes = []

    # DO: GroupName별로 묶기 (순서 유지)
    do_groups = OrderedDict()
    for it in do_items:
        gn = it.get('GroupName') or ''
        do_groups.setdefault(gn, []).append(it)
    for gn, group_items in do_groups.items():
        boxes.append(make_group_box(gn, group_items, 'do'))

    # Parm: GroupName별로 묶기 (순서 유지)
    parm_groups = OrderedDict()
    for it in parm_items:
        gn = it.get('GroupName') or ''
        parm_groups.setdefault(gn, []).append(it)
    for gn, group_items in parm_groups.items():
        boxes.append(make_group_box(gn, group_items, 'parm'))

    return boxes


def boxes_to_rows_html(boxes, indent='                ', min_rows=3, min_per_row=2):
    """박스 리스트 → d-flex flex-row 행 HTML 분배 규칙:
    - 최소 min_rows개 행 (justify-content-between 동작 조건)
    - 일반 행: 박스 min_per_row개 이상
    - 마지막 행 예외: 박스 1개도 허용
    알고리즘: items_per_row = max(min_per_row, n // min_rows)
    """
    if not boxes:
        return ''
    n = len(boxes)
    # min_rows 행 보장 + 비마지막 행은 min_per_row 이상 유지
    items_per_row = max(min_per_row, math.ceil(n / min_rows))

    html = ''
    for i in range(0, n, items_per_row):
        chunk = boxes[i:i + items_per_row]
        inner = ('\n' + indent + '    ').join(chunk)
        html += (
            f'{indent}<div class="d-flex flex-row justify-content-between '
            f'align-items-center flex-wrap" style="width:100%;">\n'
            f'{indent}    {inner}\n'
            f'{indent}</div>\n'
        )
    return html


# ─────────────────────────────────────────────
# 탭 네비게이션 + 탭 패널 HTML 생성
# ─────────────────────────────────────────────
def build_tabs_html(tab_order, do_by_tab, parm_by_tab):
    nav_items = []
    pane_items = []

    for idx, tab_name in enumerate(tab_order):
        tab_id   = f'tab-{idx + 1}'
        is_first = (idx == 0)
        active   = 'active' if is_first else ''

        # 네비 링크
        nav_items.append(
            f'        <li class="nav-item" role="presentation">'
            f'<a class="nav-link {active}" role="tab" data-bs-toggle="tab" '
            f'href="#{tab_id}" style="font-size:16px;font-weight:bold;">'
            f'{tab_name}</a></li>'
        )

        # 탭 패널
        do_items   = do_by_tab.get(tab_name, [])
        parm_items = parm_by_tab.get(tab_name, [])
        boxes      = build_tab_boxes(do_items, parm_items)
        rows_html  = boxes_to_rows_html(boxes)

        pane_items.append(
            f'            <div class="tab-pane {active}" role="tabpanel" '
            f'id="{tab_id}" style="width:100%;height:auto;">\n'
            f'                <div class="container d-flex flex-column justify-content-between flex-wrap" '
            f'style="padding:0px;border-style:none;padding-top:0.5rem;margin:0.3rem;">\n'
            f'{rows_html}'
            f'                </div>\n'
            f'            </div>'
        )

    nav_html  = '\n'.join(nav_items)
    pane_html = '\n'.join(pane_items)
    return nav_html, pane_html


# ─────────────────────────────────────────────
# 전체 HTML 조립
# ─────────────────────────────────────────────
HTML_TEMPLATE = """\
<!DOCTYPE html>
<html data-bs-theme="light" lang="ko" style="height:90vh;font-size:1rem;">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">
    <title>PTY3 - Auto Generated</title>
    <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/bss-overrides.css">
    <link rel="stylesheet" href="assets/css/MainPannel.css">
    <link rel="stylesheet" href="assets/css/styles.css">
    <link rel="stylesheet" href="assets/css/merged-layout.css">
</head>

<body class="w-100">
    <div style="width:100%;height:auto;">
        <div style="width:100%;height:auto;">
            <ul class="nav nav-tabs d-flex flex-row" role="tablist"
                style="margin:5px;padding:1px;width:auto;height:auto;">
{NAV_ITEMS}
            </ul>
            <div class="tab-content" style="width:100%;height:auto;">
{PANE_ITEMS}
            </div>
        </div>
    </div>

    <script src="assets/bootstrap/js/bootstrap.min.js"></script>
    <script src="assets/js/jquery-3.7.1.min.js"></script>
    <script src="js/merged-websocket.js"></script>
</body>
</html>
"""


def main():
    print("엑셀 파일 읽는 중...")
    do_data   = read_xlsx('DoForSpring.xlsx')
    parm_data = read_xlsx('ParmForSpring.xlsx')

    # ── 탭 순서 수집 (등장 순서 유지, 중복 제거) ──
    tab_order = list(OrderedDict.fromkeys(
        [r['TagCategory'] for r in do_data   if r.get('TagCategory')] +
        [r['TagCategory'] for r in parm_data if r.get('TagCategory')]
    ))

    # ── 탭별 데이터 분류 ──
    do_by_tab   = {}
    parm_by_tab = {}

    for row in do_data:
        cat = row.get('TagCategory')
        if cat:
            do_by_tab.setdefault(cat, []).append(row)

    for row in parm_data:
        cat = row.get('TagCategory')
        if cat:
            parm_by_tab.setdefault(cat, []).append(row)

    # ── HTML 생성 ──
    nav_html, pane_html = build_tabs_html(tab_order, do_by_tab, parm_by_tab)

    html = HTML_TEMPLATE.replace('{NAV_ITEMS}',  nav_html)
    html = html.replace('{PANE_ITEMS}', pane_html)

    out_path = 'testmerge.html'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"완료: {out_path}")
    print(f"  탭 수     : {len(tab_order)} ({', '.join(tab_order)})")
    print(f"  DO 항목   : {len(do_data)}개")
    print(f"  Parm 항목 : {len(parm_data)}개")


if __name__ == '__main__':
    main()
