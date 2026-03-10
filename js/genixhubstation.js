/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */


            
            
//            
//            for ( i = 0 ; i < parmValues.length ;i ++){
//                console.log ( parmValues[i])
//            }

            const water_status_div = document.getElementById("water_status_id");
            const badge_status_div = document.getElementById("badge_status_id");
            const internal_status_div = document.getElementById("internal_status_id");

            for (var key in aiinform) {
             //   console.log(aiinform[key].GroupName);


                if (aiinform[key].GroupName.includes("양액")) {

                    water_status_div.appendChild(document.createElement('p')).setAttribute("id", "A" + aiinform[key].InstanceNo);
                }
                if (aiinform[key].GroupName.includes("근권")) {

                    badge_status_div.appendChild(document.createElement('p')).setAttribute("id", "A" + aiinform[key].InstanceNo);
                }
                if (aiinform[key].GroupName.includes("실내")) {

                    internal_status_div.appendChild(document.createElement('p')).setAttribute("id", "A" + aiinform[key].InstanceNo);
                }

            }

  
            wsUrii = "ws://" + sockwtInfo.dnsName + ":9832/websocketIO"
            //console.log(wsUrii);
            var websocket;
            var output;

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
            }

            function send_message() {
                var message = textID.value;
                writeToScreen("Message Sent: " + message);
                websocket.send(message);
            }

            function onOpen(evt) {
                //tag1.innerHTML = "Connected to Endpoint!";
            }

            function onMessage(evt) {
                // tag0.innerHTML = "Message Received: " + evt.data;
                
;               var objAI = JSON.parse(evt.data).AITags;
                
                       
                for (var key in aiinform) {

                    document.getElementById("A" + aiinform[key].InstanceNo).innerHTML = aiinform[aiinform[key].InstanceNo].TagName + " : " + objAI[aiinform[key].InstanceNo] + " " + aiinform[aiinform[key].InstanceNo].UnitName;

                }

            }

            function onError(evt) {
                tag1.innerHTML = 'ERROR: ' + evt.data;
            }


            window.addEventListener("load", init, false);
            