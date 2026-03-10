/*
 * merged-websocket.js
 * 단일 레이아웃 (id: "Pxx", "DIxx", "Axx") — PC/모바일 공통 처리
 */

/* global parmvalues, parminform, aiinform, diinform, doinform, sockwtInfo */

wsUrii = "ws://" + sockwtInfo.dnsName + ":" + sockwtInfo.webport + "/websocketIO";

// ── PC 전용: 데이터추이 탭 ─────────────────────────────────────────
if (document.getElementById('trendTab')) {
    document.getElementById('trendTab').addEventListener('click', function () {
        document.getElementById("trendIframe").src =
            "http://" + sockwtInfo.dnsName + ":" + sockwtInfo.webport + "/logNew";
    });
}

let websocket;
window.addEventListener("load", init, false);

// parameterobject: 키 = "P56", "P56B1" 등 (PC ID와 동일)
let parameterobject = {};

for (let i = 0; i < parminform.length; i++) {

    let im = {
        TagName:    parminform[i].TagName,
        InstanceNo: parminform[i].InstanceNo,
        UnitName:   parminform[i].UnitName,
        OnMsg:      parminform[i].OnMsg,
        OffMsg:     parminform[i].OffMsg,
        Max:        parminform[i].Max,
        Min:        parminform[i].Min,
        Step:       parminform[i].Step
    };

    if (!parminform[i].OnMsg.includes("bit")) {

        let key = "P" + parminform[i].InstanceNo;

        let val = 0;
        if (parminform[i].OnMsg.includes("ten")) {
            val = parmvalues[parminform[i].InstanceNo] / 10;
        } else if (parminform[i].OnMsg.includes("100f")) {
            val = parmvalues[parminform[i].InstanceNo] / 100;
        } else {
            val = parmvalues[parminform[i].InstanceNo];
        }

        try {
            let el = document.getElementById(key);
            if (el) el.value = val;
        } catch(e) { console.log(key, "not found"); }

        // 분/초 분리 입력
        try {
            let elM = document.getElementById(key + "M");
            if (elM) {
                elM.value = parseInt(val / 60);
                document.getElementById(key + "S").value = val % 60;
            }
        } catch(e) {}

        parameterobject[key] = im;

    } else {

        let key = "P" + parminform[i].InstanceNo + "B" + parminform[i].OffMsg;
        let checked = !!(parmvalues[parminform[i].InstanceNo] & (1 << (parminform[i].OffMsg - 1)));

        try { let el = document.getElementById(key); if (el) el.checked = checked; } catch(e) {}

        parameterobject[key] = im;
    }
}

let doobject = {};
for (let i = 0; i < doinform.length; i++) {
    doobject[doinform[i].InstanceNo] = {
        TagName:  doinform[i].TagName,
        UnitName: doinform[i].UnitName,
        OnMsg:    doinform[i].OnMsg,
        OffMsg:   doinform[i].OffMsg
    };
}

// ── WebSocket 초기화 ───────────────────────────────────────────────
function init() {
    if (!websocket) {
        websocket = new WebSocket(wsUrii);
        websocket.onopen    = function(evt) { onOpen(evt); };
        websocket.onmessage = function(evt) { onMessage(evt); };
        websocket.onerror   = function(evt) { onError(evt); };
    }
}

function disconnect() {
    if (websocket) websocket.close();
    console.log("OnClose");
}

function onOpen(evt) {
    console.log("OnOpen", evt);
}

// ── WebSocket 수신 ────────────────────────────────────────────────
function onMessage(evt) {
    let obj = JSON.parse(evt.data);

    // AI 태그
    for (let i = 0; i < aiinform.length; i++) {
        let val = 0;
        if (aiinform[i].OnMsg.includes("ten")) {
            val = obj.AITags[aiinform[i].InstanceNo] / 10;
        } else if (aiinform[i].OnMsg.includes("100f")) {
            val = obj.AITags[aiinform[i].InstanceNo] / 100;
        } else if (aiinform[i].OnMsg.includes("float")) {
            let buf = new ArrayBuffer(4);
            let iv  = new Uint16Array(buf);
            let fv  = new Float32Array(buf);
            iv[0] = obj.AITags[aiinform[i].InstanceNo];
            iv[1] = obj.AITags[aiinform[i].InstanceNo + 1];
            val = fv[0];
        } else {
            val = obj.AITags[aiinform[i].InstanceNo];
        }
        let el = document.getElementById("A" + aiinform[i].InstanceNo);
        if (el) el.innerHTML = val + " ";
    }

    // DI 태그
    for (let i = 0; i < diinform.length; i++) {
        let val = obj.DITags[diinform[i].InstanceNo];
        let el = document.getElementById("DI" + diinform[i].InstanceNo);
        if (el !== null) {
            el.style.backgroundColor = (val > 0) ? "green" : "gray";
            if (diinform[i].UnitName === "NORMAL-MSG")
                el.innerHTML = (val > 0) ? diinform[i].OnMsg : diinform[i].OffMsg;
        }
    }
}

function onError(evt) {
    console.log("OnError");
}

// ── 설정값 전송 ────────────────────────────────────────────────────
function btnDownload() {

    // iOS Safari: 포커스된 input의 값이 커밋되도록 강제 blur
    if (document.activeElement) document.activeElement.blur();

    // PC/모바일 공통: input 값에서 읽기 (New-merged.html은 단일 레이아웃)
    for (let kv in parameterobject) {
        let no = parameterobject[kv].InstanceNo;
        if (parameterobject[kv].OnMsg === "bitbit") {
            try {
                let el = document.getElementById(kv);
                if (el) {
                    if (el.checked) parmvalues[no] |=  (1 << (parameterobject[kv].OffMsg - 1));
                    else            parmvalues[no] &= ~(1 << (parameterobject[kv].OffMsg - 1));
                }
            } catch(e) { console.log(kv, "Not Found"); continue; }
        } else if (parameterobject[kv].OnMsg === "ten") {
            try { parmvalues[no] = document.getElementById(kv).value * 10; } catch(e) {}
        } else if (parameterobject[kv].OnMsg === "100f") {
            try { parmvalues[no] = document.getElementById(kv).value * 100; } catch(e) {}
        } else {
            try {
                let elM = document.getElementById(kv + "M");
                if (elM) {
                    parmvalues[no] = parseInt(elM.value * 60) + parseInt(document.getElementById(kv + "S").value);
                } else {
                    parmvalues[no] = parseInt(document.getElementById(kv).value);
                }
            } catch(e) { console.log(kv, "Not Found"); continue; }
        }
    }

    let msg = {};
    msg["parm"] = parmvalues;
    if (confirm("설정치를 전송하시겠습니까?") === true) {
        websocket.send(JSON.stringify(msg));
        ToastMsg("설정값 전송완료!!");
    } else {
        ToastMsg("설정값 전송취소??");
    }
}

// ── 슬라이더 조작 (range input 사용 시) ──────────────────────────
function sliderfunc(element) {
    let instanceNo = element.id.replace(/[^0-9]/g, '');
    let value = parseInt(element.value);
    let key = "P" + instanceNo;

    if (parameterobject[key] && parameterobject[key].OnMsg.includes("ten")) {
        parmvalues[instanceNo] = 10 * value;
    } else {
        parmvalues[instanceNo] = value;
    }

    if (parameterobject[key] && parameterobject[key].OnMsg.includes("secs")) {
        let elM = document.getElementById(key + "M");
        let elS = document.getElementById(key + "S");
        if (elM) elM.textContent = Math.floor(value / 60).toString();
        if (elS) elS.textContent = (value % 60).toString();
    } else {
        let el = document.getElementById(key);
        if (el) el.textContent = value.toString();
    }
}

// ── DO 액션 (라디오 클릭) ─────────────────────────────────────────
function DoActionClick(element) {
    let id = element.id;
    let instanceNo;
    let codeVal = 10;

    try {
        instanceNo = document.getElementById(id).name.replace(/[^0-9]/g, '');
    } catch(e) {
        console.log(id, "Not found");
        return;
    }

    let v = document.getElementById(id).value.toString();
    if (v.includes("PAUS"))  codeVal = 4;
    if (v.includes("CLOS"))  codeVal = 3;
    if (v.includes("OPEN"))  codeVal = 2;
    if (v.includes("man"))   codeVal = 7;
    if (v.includes("MAN"))   codeVal = 7;
    if (v.includes("sch"))   codeVal = 6;
    if (v.includes("SCH"))   codeVal = 6;
    if (v.includes("off"))   codeVal = 0;
    if (v.includes("stop"))  codeVal = 0;
    if (v.includes("VCLO"))  codeVal = 0;
    if (v.includes("on"))    codeVal = 1;
    if (v.includes("run"))   codeVal = 1;
    if (v.includes("star"))  codeVal = 1;
    if (v.includes("VOPE"))  codeVal = 1;
    if (v.includes("REMOT")) codeVal = 1;
    if (v.includes("LOCA"))  codeVal = 0;
    if (v.includes("STAR"))  codeVal = 1;
    if (v.includes("STOP"))  codeVal = 0;

    let msg = {};
    msg["DO" + instanceNo] = codeVal;
    if (!websocket) websocket = new WebSocket(wsUrii);
    if (codeVal >= 0 && codeVal <= 7) websocket.send(JSON.stringify(msg));

    let contents = doobject[instanceNo].TagName;
    if (codeVal == 4) contents += " 정지 명령 완료";
    if (codeVal == 3) contents += " 닫힘 명령 완료";
    if (codeVal == 2) contents += " 열림 명령 완료";
    if (codeVal == 1 || codeVal == 6) contents += " " + doobject[instanceNo].OnMsg + " 명령 완료";
    if (codeVal == 0 || codeVal == 7) contents += " " + doobject[instanceNo].OffMsg + " 명령 완료";
    ToastMsg(contents);
}

// ── Toast 알림 ────────────────────────────────────────────────────
function ToastMsg(msg) {
    const toastEl = document.getElementById('toast-1');
    const toast   = bootstrap.Toast.getOrCreateInstance(toastEl);
    document.getElementById('ToastMsg').innerHTML = msg;
    toast.show();
}
