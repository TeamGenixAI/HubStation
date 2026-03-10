/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */


wsUrii = "ws://" + sockwtInfo.dnsName + ":" + sockwtInfo.webport + "/websocketIO";

document.getElementById('trendTab').addEventListener('click', function () {

    document.getElementById("trendIframe").src = "http://" + sockwtInfo.dnsName + ":" + sockwtInfo.webport + "/logNew";

});

let websocket;
let output;
window.addEventListener("load", init, false);
let parameterobject = {};
for (i = 0; i < parminform.length; i++) {

    let instancematch = { "TagName": "", "InstanceNo": -1, " UnitName": "", "OnMsg": "", "OffMsg": "", "Max": 0, "Min": 0, "Step": 0 };
    instancematch.TagName = parminform[i].TagName;
    instancematch.InstanceNo = parminform[i].InstanceNo;
    instancematch.UnitName = parminform[i].UnitName;
    instancematch.OnMsg = parminform[i].OnMsg;
    instancematch.OffMsg = parminform[i].OffMsg;
    instancematch.Max = parminform[i].Max;
    instancematch.Min = parminform[i].Min;
    instancematch.Step = parminform[i].Step;
    let keyCode = null;
    if (!(parminform[i].OnMsg.includes("bit"))) {

        keyCode = "P" + parminform[i].InstanceNo;

        try {

            if (document.getElementById(keyCode)) {

                val = 0;
                // var val = (parminform[i].OnMsg.includes("ten") ) ? (parmvalues [parminform[i].InstanceNo]/10) : parmvalues [parminform[i].InstanceNo];

                if (parminform[i].OnMsg.includes("ten")) {
                    val = parmvalues[parminform[i].InstanceNo] / 10;
                } else if (parminform[i].OnMsg.includes("100f")) {
                    val = parmvalues[parminform[i].InstanceNo] / 100;
                } else {
                    val = parmvalues[parminform[i].InstanceNo];
                }
                document.getElementById(keyCode).value = val;
            }

        } catch (error) {

            console.log(keyCode, "Not Found");
            continue;
        }
        try {

            if (document.getElementById(keyCode + "M")) {

                let val = parmvalues[parminform[i].InstanceNo];
                //   console.log ( val , parminform[i].InstanceNo ,keyCode  );

                document.getElementById(keyCode + "M").value = parseInt(val / 60);
                document.getElementById(keyCode + "S").value = val % 60;
            }

        } catch (error) {
            console.log(keyCode, "M or Not Not Found");
            continue;
        }

    } else {
        keyCode = "P" + parminform[i].InstanceNo + "B" + parminform[i].OffMsg;
        try {
            if (document.getElementById(keyCode)) {

                if (parmvalues[parminform[i].InstanceNo] & (1 << (parminform[i].OffMsg - 1))) {
                    document.getElementById(keyCode).checked = true;
                } else {
                    document.getElementById(keyCode).checked = false;
                }

            }
        } catch (error) {
            console.log(keyCode, "Not Found");
            continue;
        }

    }
    parameterobject[keyCode] = instancematch;
}

let doobject = {};
for (i = 0; i < doinform.length; i++) {

    let instancematch = { "OnMsg": "", "TagName": "", "UnitName": "", "OffMsg": "" };
    instancematch.TagName = doinform[i].TagName;
    instancematch.UnitName = doinform[i].UnitName;
    instancematch.OnMsg = doinform[i].OnMsg;
    instancematch.OffMsg = doinform[i].OffMsg;
    doobject[doinform[i].InstanceNo] = instancematch;
    /*
    if (doinform[i].UnitName == "DOW" ){   // 개폐기
        let id = "DO"+ doinform[i].InstanceNo.toString()+ "Name";
        let tagName = doinform[i].TagName;
     //   if (tagName.length > 5 ) tagName = tagName.slice(0,5);
        document.getElementById(id).innerHTML = tagName;;
    }
    */

}

function init() {


    if (!websocket) {


        websocket = new WebSocket(wsUrii);
        websocket.onopen = function (evt) {
            onOpen(evt)
        };
        websocket.onmessage = function (evt) {
            onMessage(evt)
        };
        websocket.onerror = function (evt) {
            onError(evt)
        };

    }



}



function disconnect() {
    if (!websocket)
        websocket.close();
    console.log("OnClose");
}

function onOpen(evt) {
    //tag1.innerHTML = "Connected to Endpoint!";
    console.log("OnOpen", evt);
}

function onMessage(evt) {

    let objTagData = JSON.parse(evt.data);
    for (i = 0; i < aiinform.length; i++) {

        let val = 0;
        if (aiinform[i].OnMsg.includes("ten")) {
            val = objTagData.AITags[aiinform[i].InstanceNo] / 10;
        } else if (aiinform[i].OnMsg.includes("100f")) {
            val = objTagData.AITags[aiinform[i].InstanceNo] / 100;
        } else if (aiinform[i].OnMsg.includes("float")) {

            let buffer = new ArrayBuffer(4);
            let intview = new Uint16Array(buffer);
            let float32view = new Float32Array(buffer);
            intview[0] = objTagData.AITags[aiinform[i].InstanceNo];
            intview[1] = objTagData.AITags[aiinform[i].InstanceNo + 1];

            val = float32view[0];
        } else {

            val = objTagData.AITags[aiinform[i].InstanceNo];
        }
        if (document.getElementById("A" + aiinform[i].InstanceNo)) {
            document.getElementById("A" + aiinform[i].InstanceNo).innerHTML = val + " " + aiinform[i].UnitName;
        }
    }


    for (i = 0; i < diinform.length; i++) {

        let val = objTagData.DITags[diinform[i].InstanceNo];
        // console.log(diinform.length, i, diinform[i], val);
        let elem = document.getElementById("DI" + diinform[i].InstanceNo);
        //  console.log(("DI" + diinform[i].InstanceNo), elem);

        if ( elem === null) continue;        
        elem.style.backgroundColor = (val > 0) ? "green" : "gray";

       
        if (diinform[i].UnitName ==="NORMAL-MSG") {
            elem.innerHTML = (val > 0) ? diinform[i].OnMsg : diinform[i].OffMsg;
        }


    }
}

function onError(evt) {
    console.log("OnError");
}

function btnDownload() {


    for (let keyVal in parameterobject) {
        instanceNo = parameterobject[keyVal].InstanceNo;
        if (parameterobject[keyVal].OnMsg === "bitbit") {
            try {
                if ((document.getElementById(keyVal).checked) === true) {
                    parmvalues[instanceNo] |= (1 << parameterobject[keyVal].OffMsg - 1);
                } else {
                    parmvalues[instanceNo] &= (~(1 << parameterobject[keyVal].OffMsg - 1));

                }
            } catch (error) {
                console.log(keyVal, "Not Found");
                continue;
            }
        } else if (parameterobject[keyVal].OnMsg === "ten") {
            try {
                parmvalues[instanceNo] = document.getElementById(keyVal).value * 10;
            } catch (error) {
                console.log(keyVal, "Not Found");
                continue;
            }
        } else if (parameterobject[keyVal].OnMsg === "100f") {
            try {
                parmvalues[instanceNo] = document.getElementById(keyVal).value * 100;
            } catch (error) {
                console.log(keyVal, "Not Found");
                continue;
            }
        } else {


            if (document.getElementById(keyVal + "M")) {
                try {
                    parmvalues[instanceNo] = parseInt(document.getElementById(keyVal + "M").value * 60) + parseInt(document.getElementById(keyVal + "S").value);
                } catch (error) {
                    console.log(keyVal, "M or S Not Found");
                    continue;
                }
            } else {
                try {
                    parmvalues[instanceNo] = parseInt(document.getElementById(keyVal).value);
                } catch (error) {
                    console.log(keyVal, "Not Found");
                    continue;
                }
            }


        }


    }
    message = {};
    message["parm"] = parmvalues;

    let text = "설정치를 전송하시겠습니까?";
    if (confirm(text) === true) {
        websocket.send(JSON.stringify(message));
        ToastMsg("설정값 전송완료!!");
    } else {
        ToastMsg("설정값 전송취소??");

    }

}

function DoActionClick(element) {

    let id = element.id;
    //console.log(id);
    //   let instanceNo = id.replace(/[^0-9]/g, '');
    let instanceNo;   // name에 instanceNo가 포함 되어야 한다.
    var codeVal = 10;

    try {
        instanceNo = document.getElementById(id).name.replace(/[^0-9]/g, '');
    } catch (error) {
        console.log(element.id.toString(), " Not found");
        return;
    }
    console.log("instanceNo:", instanceNo);
    if (document.getElementById(id).value.toString().includes("PAUS")) {

        codeVal = 4;

    }
    if (document.getElementById(id).value.toString().includes("CLOS")) {

        codeVal = 3;


    }
    if (document.getElementById(id).value.toString().includes("OPEN")) {

        codeVal = 2;


    }
    if (document.getElementById(id).value.toString().includes("man")) {

        codeVal = 7;

    }
    if (document.getElementById(id).value.toString().includes("MAN")) {

        codeVal = 7;

    }
    if (document.getElementById(id).value.toString().includes("sch")) {

        codeVal = 6;
        //    console.log (codeVal,"예약");

    }
    if (document.getElementById(id).value.toString().includes("SCH")) {

        codeVal = 6;
        //    console.log (codeVal,"예약");

    }
    if (document.getElementById(id).value.toString().includes("off")) {

        codeVal = 0;
        //        console.log (codeVal,"정지 혹은 종료");

    }
    if (document.getElementById(id).value.toString().includes("stop")) {

        codeVal = 0;
        //        console.log (codeVal,"정지 혹은 종료");

    }
     if (document.getElementById(id).value.toString().includes("VCLO")) {

        codeVal = 0;
        //        console.log (codeVal,"정지 혹은 종료");

    }
    if (document.getElementById(id).value.toString().includes("on")) {

        codeVal = 1;
        //       console.log ( codeVal,"기동 혹은 시작");
    }
    if (document.getElementById(id).value.toString().includes("run")) {

        codeVal = 1;
        //       console.log ( codeVal,"기동 혹은 시작");
    }
    if (document.getElementById(id).value.toString().includes("star")) {

        codeVal = 1;
        //       console.log ( codeVal,"기동 혹은 시작");
    }
     if (document.getElementById(id).value.toString().includes("VOPE")) {

        codeVal = 1;
        //       console.log ( codeVal,"기동 혹은 시작");
    }

    if (document.getElementById(id).value.toString().includes("REMOT")) {

        codeVal = 1;
    }
    if (document.getElementById(id).value.toString().includes("LOCA")) {

        codeVal = 0;
    }
     if (document.getElementById(id).value.toString().includes("STAR")) {

        codeVal = 1;
    }
    if (document.getElementById(id).value.toString().includes("STOP")) {

        codeVal = 0;
    }
    
    message = {};
    message["DO" + instanceNo] = codeVal;
    if (!websocket) {
        websocket = new WebSocket(wsUrii);
    }
    if (codeVal >= 0 && codeVal <= 7) {  // 매우 중요 2022.10.13 오후 4시 발견 
        websocket.send(JSON.stringify(message));
    }

    console.log(message, doobject[instanceNo]);
    let contents = doobject[instanceNo].TagName;
    //console.log ( contents);
    if (codeVal == 4) {
        contents += " 정지 명령 완료"
    }
    if (codeVal == 3) {
        contents += " 닫힘 명령 완료"
    }
    if (codeVal == 2) {
        contents += " 열림 명령 완료"
    }
    if (codeVal == 1 || codeVal == 6) {
        contents += ' ';
        contents += doobject[instanceNo].OnMsg;
        contents += '  명령 완료';
    }
    if (codeVal == 0 || codeVal == 7) {
        contents += ' ';
        contents += doobject[instanceNo].OffMsg;
        contents += '  명령 완료';
    }
    ToastMsg(contents);


}

function ToastMsg(msg) {
    const toastLive = document.getElementById('toast-1');
    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLive);
    document.getElementById('ToastMsg').innerHTML = msg;
    toastBootstrap.show();
}



