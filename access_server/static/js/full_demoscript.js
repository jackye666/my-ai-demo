var start, end;

var global_config={};
var global_choosed=[];
var global_rec=[{}, {}];

var myChart = null;
var imglist = [null, null];
var ldataset = null;
var rdataset = null;

var running_flag = true;

var left_time = 0, right_time = 0;

var checkbox_status = {};

var myMemory = {

	imageIndex: [0, 0],
	imageArray: [null, null],
	bigImage: [null, null],
	outerTimer: [null, null],
	innerTimer: [null, null],
	interval: [0.5, 0.1],
	plotTimer: null,
	logInterval: [{}, {}],
	imageCounter: [0, 0],
	totalElapsed: [0, 0],
	scaleFactor: 1,
    http_time:[0, 0]
    //cpu:[null, null]
};


function get_node_show(svr){
    var html='';
    html = html + svr['hw'] + '-';
    html = html + svr['framework'] + '-';
    html = html + svr['model'] + '-';
    html = html + svr['type'] + '-';
    html = html + svr['dataset'] ;
    return html;
}

function hide_rect(){
    $("#span_rect_0").hide();
    $("#span_rect_1").hide();
    $("#span_rect_0").css({"border-color": "red",
             "border-width":"0px",
             "border-style":"solid"});

    $("#span_rect_1").css({"border-color": "red",
             "border-width":"0px",
             "border-style":"solid"});
}

function stop(){
    running_flag = false;
    clearInterval(myMemory.innerTimer[LEFT]);
    clearInterval(myMemory.innerTimer[RIGHT]);
    clearInterval(myMemory.outerTimer[LEFT]);
    clearInterval(myMemory.outerTimer[RIGHT]);
    clearInterval(myMemory.plotTimer);

    console.info('stop');
}

$("#btnAct").click(function(){
  var t = $("#btnAct").text();
  //console.info(t);

  if(t=='Run'){
    if(global_choosed.length != 2){
        alert("Please choose enough nodes first!");
    }  
    stop();
    hide_rect();
    //alert(global_choosed[0]["model"])
    if (global_choosed[0]["model"] == "YOLOv3" ){
        $("#span_rect_0").show();
        $("#span_rect_1").show();
    }
    if (demoMain(true)){
      $("#btnAct").text('Stop');
      $("#btnAct").removeClass( "btn-outline-success").addClass("btn-outline-danger");
    }
    left_time = 0;
    right_time = 0;
  } else {
     $("#btnAct").text('Run');
     $("#btnAct").removeClass( "btn-outline-danger").addClass("btn-outline-success");
     stop();
  }
});

var text = "graph LR;\nA[\"Chrome\"]--HTTP-->B[\"Web Server\"];\nB--HTTP-->C[\"AI Node A\"];\nB--HTTP-->D[\"AI Node B\"];\n";
function show_flowchart(){
    var inputs = $('#node_list').find("input");
    var str = new Array("","","","");
    var alphabet = new Array("A","B","C","D","E","F","G","H","I","J");
    var head = "graph LR;\nA[\"Chrome\"]--HTTP-->B[\"Web Server\"];\n"
    var A = "B--HTTP-->C[\"AI Node A\"];\n"
    var B = "B--HTTP-->D[\"AI Node B\"];\n"
    var branch = new Array(A, B);
    var choosed_num = 0;
    svrs = global_config;	
    for(i=0;i<inputs.length;i++){
        if(inputs[i].checked){
            choosed_num++;
        }
    }
    if(choosed_num > 2){
        alert("Please only choose 2 nodes!")
        for(i = 0; i < inputs.length; i++){
            if(checkbox_status["checkbox"+i] != inputs[i].checked){
                document.getElementById("checkbox"+i).checked = false;
                inputs[i].checked = false;
                break;
            }
        }
        choosed_num = 2;
    }
    var cnt = 0
    for(i=0;i<inputs.length;i++){
        checkbox_status["checkbox"+i] = inputs[i].checked;
        //console.log(svrs[i]["hw"]);
        if(inputs[i].checked){
            str[i] =  str[i] + svrs[i]['hw'] + "<br/>";
            str[i] =  str[i] + svrs[i]['framework'] + " ";
            str[i] =  str[i] + svrs[i]['model'] + " ";
            str[i] =  str[i] + svrs[i]['type'] + " ";
            str[i] =  str[i] + svrs[i]['dataset'] + "\n";
            //text = text + alphabet[i] + "-->" + alphabet[i+2] + "[\"" + str[i] + "\"];\n";
            branch[cnt] = "B--HTTP-->" + alphabet[cnt+2] + "[\"AI Node " + alphabet[cnt] + "<br/>"+str[i]+"\"];\n";   
            cnt++;
        }
    }

    text = head;
    for(j = 0; j < 2; j++){
        text += branch[j];
    }
    //console.log(text);
    output = document.getElementById("flow_chart");
    if (output.firstChild !== null) {
        output.innerHTML = "";
    }
    let insert = function (text) {
        output.innerHTML = text;
    };
    	
    mermaid.render("preparedScheme", text, insert);
};

function insert_tag(str, id_str, base_str){
  var str_low = str.toLowerCase();
  //console.log(str_low);
  var heads = ['fp32', 'int8'];
  for(i=0;i<heads.length;i++){
      if(str_low.indexOf(heads[i])>=0) {
          //console.log("find "+ heads[i]);
          $(id_str).text(base_str+" ("+heads[i] + ")");
          break;
      }  
  }
}


$("#confirm_choose").click(function(){

  $('#node_list.table').find(":checkbox:eq(0)");
  var inputs = $('#node_list').find("input");
  var i = 0;
  var cnt = 0;
  var left = "";
  var right = "";
  var choosed=[];
  //alert(global_config[i]['hw']);
  for(i=0;i<inputs.length;i++){
      if(inputs[i].checked){
          cnt += 1;
          choosed.push(global_config[i]);
          if(left==""){
              left = get_node_show(global_config[i]);
              continue;
          }
          if(right==""){
              right =get_node_show(global_config[i]);
          }

      }
  }
  if(cnt!=2){
     alert("Please Choose 2 Nodes!");
     return;
  }

  insert_tag(left, '#leftheader', 'AI Node A');
  insert_tag(right, '#rightheader', 'AI Node B');

  $('#leftnode').text(left);
  $('#rightnode').text(right);
  global_choosed = choosed;
  //console.info(global_choosed);

  reload_local_imgs(global_choosed[0]['dataset'] , global_choosed[1]['dataset']);
  $('#configModal').modal('hide');
});
$("#btnChoose").click(function(){ 
    var res = null;
    var xhr = new XMLHttpRequest();
    var thisURL = "config";
    xhr.open("GET", thisURL, false);
	xhr.onload = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			res = JSON.parse(xhr.responseText);

            $('#node_list').empty();

            var svrs = res['mod_servers'];
            console.info(res);

            global_config = svrs;
            //alert(global_config[0]['hw']);
            var html="<table style=\"width: 100%;\">";
            var i;
            html = html + '<tr><th>Choose</th><th>Type</th><th>Hardware</th><th>Framework</th><th>Model</th><th>Dataset</th></tr>'
            for (i = 0; i < svrs.length; i++) {
               html = html +'<tr>';
               html = html + '<td><input type="checkbox" value='+i +' id = checkbox'+i+'></td>';
               html = html + '<td><strong>'+svrs[i]['type'] + '</strong></td>';
               html = html + '<td>'+svrs[i]['hw'] + '</td>';
               html = html + '<td>'+svrs[i]['framework'] + '</td>';
               html = html + '<td>'+svrs[i]['model'] + '</td>';
               html = html + '<td>'+svrs[i]['dataset'] + '</td>';
               html = html + '</tr>';
            }
            html = html +'</table>';
            //alert(html);

            $('#node_list').html(html);

            for(var checkbox in checkbox_status){
                document.getElementById(checkbox).checked = checkbox_status[checkbox];
            }

            $(function(){
                str = "";
                for (i = 0; i < svrs.length; i++){
                    str = "#checkbox"+i;
                    $(str).click(function(){
                        show_flowchart();    
                    });
                }
            })

		};
	};
	xhr.send();


    output = document.getElementById("flow_chart");
    if(output.firstChild != null){
        output.innerHTML="";
    }
    text = "graph LR;\nA[\"Chrome\"]--HTTP-->B[\"Web Server\"];\nB--HTTP-->C[\"AI Node A\"];\nB--HTTP-->D[\"AI Node B\"];\n";
    let insert = function (txt) {
        output.innerHTML = txt;
    };
    mermaid.render("preparedScheme", text, insert);
    $('#configModal').modal('show');

});

function load_local_img_list(dataset_name){

    var response = null;
    var xhr = new XMLHttpRequest();
    var thisURL = "local_img_list?dataset_name="+dataset_name;


    xhr.open("GET", thisURL, false);
	xhr.onload = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			response = JSON.parse(xhr.responseText);
		};
	};
	xhr.send();

    //console.info(response);

	img_list = response['img_list'];
    return img_list.split(",");
}


function add_span(bigImage, side){
  var div = document.createElement("div");
  //div.style.position= 'relative';
  div.appendChild(bigImage);
  //console.log(bigImage.id);
  var span =  document.createElement("span");
  span.id = "span_rect_"+side;
  span.style.position= 'absolute';
  span.style.border= '0px solid red';
  span.style["z-index"]= '3';

  div.appendChild(span);
  return div;
}

function reload_local_imgs(dataset1 , dataset2){
   ldataset = dataset1;
   rdataset = dataset2;

   //imglist_0 = load_local_img_list('imagenet');
   //console.info(imglist_0);

   imglist[0]= load_local_img_list(ldataset);
   imglist[1]= load_local_img_list(rdataset);

   //console.info(imglist[0]);
   //console.info(imglist[1]);

   // Calculate width and height of imgbars based on browser window size
    var leftimgbarwt = LEFTCOLPCT / 100 * window.innerWidth;
    FITTEDWT = THUMIMGSIZE * Math.floor(leftimgbarwt / THUMIMGSIZE)
    NUMCOLS = FITTEDWT / THUMIMGSIZE;
    imgbarht = window.innerHeight - (30 * 2 + 10 * 2 + 85 + 55);
    FITTEDHT = THUMIMGSIZE *Math.floor(imgbarht / THUMIMGSIZE)
    NUMROWS = FITTEDHT / THUMIMGSIZE;

    /*
    console.info(window.innerHeight);
    console.info(imgbarht);
    console.info(THUMIMGSIZE);
    console.info(FITTEDHT);
    console.info(NUMROWS);
    */

    // Infer number of images to be shown
    LNUMIMAGES = NUMROWS * NUMCOLS;
    RNUMIMAGES = NUMROWS * NUMCOLS;

    var photos0 = document.getElementById('leftimgbar');
    var photos1 = document.getElementById('rightimgbar');
    //photoindex = [0,0]

    // Set imgbar sizes
    photos0.setAttribute("style", "width:" + FITTEDWT + "px");
    photos1.setAttribute("style", "width:" + FITTEDWT + "px");

    // Adjust the number of images when dataset is changed.

    if (LNUMIMAGES > imglist[0].length){
        //LNUMIMAGES = imglist[0].length;
    }
     if (RNUMIMAGES > imglist[1].length){
        //RNUMIMAGES = imglist[1].length;
    }
    /*
    console.info(LNUMIMAGES);
    console.info(RNUMIMAGES);
    */
    full_load = false;
    full_load = false;
    $('#leftimgbar').empty();
    for (let i = 0; i < LNUMIMAGES; i++) {
        var img;
        img = createImage(imglist[0][i], ldataset);
        img.id = "p0img" + i;
        photos0.appendChild(img);
    }

    //RNUMIMAGES = imglist[1].length;
    $('#rightimgbar').empty();
    for (let i = 0; i < RNUMIMAGES; i++) {
        var img;
        img = createImage(imglist[1][i], rdataset);
        img.id = "p1img" + i;
        photos1.appendChild(img);
    }
    full_load = true;


    myMemory.bigImage = [createBigImage(imglist[0][0], ldataset),
        createBigImage(imglist[1][0],rdataset)];
    myMemory.bigImage[LEFT].id = 'BIGIMGARR0';
    myMemory.bigImage[RIGHT].id = 'BIGIMGARR1';

    photos0.appendChild(add_span(myMemory.bigImage[LEFT], LEFT));
    photos1.appendChild(add_span(myMemory.bigImage[RIGHT], RIGHT));

    myMemory.imageArray = [document.querySelectorAll('[id^="p0img"]'), document.querySelectorAll('[id^="p1img"]')];


}

function init(){
    mermaid.initialize({startOnLoad:false});
    reload_local_imgs("imagenet", "imagenet");
}



function pageCleanup() {

	titlediv = document.getElementById('title');

	if (titlediv != null) {
		titlediv.parentNode.removeChild(titlediv);
	};

	clearInterval(myMemory.innerTimer[LEFT]);
	clearInterval(myMemory.innerTimer[RIGHT]);

	clearInterval(myMemory.outerTimer[LEFT]);
	clearInterval(myMemory.outerTimer[RIGHT]);

	clearInterval(myMemory.plotTimer);

	myMemory.imageIndex = [0, 0];

	clearAll(0);
	clearAll(1);
};


function createImage(imgName, dataset) {
	var img = new Image();
    img.src = "dataset/" + dataset + "/" +imgName;
	img.style.margin = THUMBBORDER + "px 0 0 " + THUMBBORDER + "px";
	return img;
};


function createBigImage(img_0, dataset) {
    var img = new Image();
    img.src = "dataset/" + dataset + "/" + img_0;

	img.style.position = "absolute";
	img.style.height = BIGIMGSIZE;
	img.style.width = BIGIMGSIZE;
	img.style.zIndex = "2";
	img.style.top=(FITTEDHT/2)-(BIGIMGSIZE+BIGIMGBORDER)/2;
	img.style.left=(FITTEDWT/2)-(BIGIMGSIZE+BIGIMGBORDER)/2;
	img.style.margin = BIGIMGBORDER + "px 0 0 " + BIGIMGBORDER + "px";
	return img;
};




function clearAll(side) {
	// side: 0 = left imgbar, 1 = right imgbar
	for (let i = 0; i < myMemory.imageArray[side].length; i++) {
		var image = myMemory.imageArray[side][i];;
        image.src = "./emptywhite.jpg";
		image.style.margin = "";
		image.style.boxShadow = "";
	}
	var bigImage = myMemory.bigImage[side];
    bigImage.src = "./emptywhite.jpg";
	bigImage.style.margin = "";
	bigImage.style.boxShadow = "";
};


function makeplot(){
    var ctx = document.getElementById('midgraph');
    Chart.defaults.global.defaultFontFamily = 'Intel Clear Pro';
    Chart.defaults.global.defaultFontColor = 'rgba(0,96,210, 1.0)';
    Chart.defaults.global.defaultFontSize = 20;
    //Chart.defaults.global.legend.display = false;

    myChart = new Chart(ctx, {        type: 'bar',
        data: {
            labels: ['AI Node A', 'AI Node B'],
            datasets: [
            {
                data: [0, 0],
                label: " Higher is better",

                backgroundColor: 'rgba(54, 162, 235, 0.8)',

                borderColor: 'rgba(54, 162, 235, 1)',

                borderWidth: 0.2
            },
            ]
        },
        options: {
            title: {
                display: false,
                text: 'Nodes compare'
            },
            
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        steps : 0.5,
                        stepValue : 0.5,
                        max : 12,
                        min: 0,
                        beginAtZero: true
                    },
                    scaleLabel:{
                        display:true,
                        labelString:'Throughput Times'
                    }
                }]
            },
            "hover": {
                "animationDuration": 0
            },
            "animation": {
                "duration": 0,
                "onComplete": function() {
                    var chartInstance = this.chart,
                      ctx = chartInstance.ctx;

                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function(dataset, i) {
                      var meta = chartInstance.controller.getDatasetMeta(i);
                      meta.data.forEach(function(bar, index) {
                        var data = dataset.data[index];
                        ctx.fillText(data, bar._model.x, bar._model.y - 5);
                      });
                    });
                }
           }
    }
    });

}

function readLog(side, logPath) {
    file = logPath;
    format = 0;
    if (side == LEFT) {
        file = "./assets/static-logs/skxtime.txt";
        format = 1;
    }
    else {
        file = "./assets/static-logs/clxtime.txt";
        format = 1;
    }
	var xhr = new XMLHttpRequest();
    xhr.open("GET", file, false);
	xhr.onload = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			var textBody = xhr.responseText;

			processData(side, textBody, format);
		};
	};
	xhr.send(null);
};


function processData(side, allText, format) {

    var allTextLines = allText.split(/\r\n|\n/);
    var count = 0;
    if (format == 0) {
        for (var i = 1; i < allTextLines.length; i++) {
            var currRow = allTextLines[i].split(',');
            if (currRow.length == 2) {
                var imageIdx = currRow[0];
                var imageElapsed = parseFloat(currRow[1]);
                myMemory.logInterval[side][imageIdx] = imageElapsed;
            };
        };
    }
    else {
        for (var i = 100; i < allTextLines.length; i++) {
            var currRow = allTextLines[i].split(',');
            if (currRow.length == 4) {
                var time = currRow[2].split(' ');

                var imageIdx = count;
                var imageElapsed = parseFloat(time[2]);
                myMemory.logInterval[side][imageIdx] = imageElapsed * 1000;
                count++;
            };
        };
    };
};


function update_infer(data, side, maxLength, dataset, isOnline, imageIdx, bt){
    myMemory.interval[side] = data.infer_time;

    if (data.rect!=undefined) {
        global_rec[side][data.img_name] = data.rect;
        //console.log(global_rec);
    }

    if (!isOnline|| data.infer_time >= 0) {
        myMemory.imageIndex[side] = (imageIdx + 1) % maxLength;
        myMemory.totalElapsed[side] += myMemory.interval[side];
        myMemory.imageCounter[side] += 1;
    }

    var et = ( new Date()).valueOf();
    myMemory.http_time[side]= (et - bt)/1000;
    //console.info("side "+side+" http time "+myMemory.http_time[side]);

    var interval = get_delay_pic_time(side);
    //console.info("side "+side+" timer " + interval);
    if(side==LEFT){
        myMemory.innerTimer[side] = setTimeout(function(){leftUpdater(isOnline)}, interval*1000);
    }else{
        myMemory.innerTimer[side] = setTimeout(function(){rightUpdater(isOnline)}, interval*1000);
    }

}

function pre_pic(side, imageIdx, maxLength){
    var pre_index = imageIdx -1;
    //if(pre_index<0) pre_index = maxLength-1;

    return pre_index;

}

function update(side, maxLength, dataset, isOnline, bt) {
    if(running_flag == false){
        console.log("Stop running by CMD");
        return;
    }

    var imageIdx = myMemory.imageIndex[side];
    var imgName = imglist[side][imageIdx]

    if (imageIdx == 0) {
        clearAll(side);
        myMemory.totalElapsed[side] = 0
        myMemory.imageCounter[side] = 0;
    };
    if (!isOnline|| myMemory.interval[side] >= 0) {
        var pre_index = pre_pic(side, imageIdx, maxLength);
        if(pre_index>=0) changePic(side, dataset, pre_index);
        else{
            side == RIGHT ?  right_time++ : left_time++
            $("#left_time").text("No."+left_time+" round");
            $("#right_time").text("No."+right_time+" round");
        }

    }


	if (isOnline) {

        var result = predictImage(global_choosed[side]['name'],global_choosed[side]['model'],
            global_choosed[side]['dataset'], imgName, side, maxLength, dataset,
            isOnline,imageIdx, bt, global_choosed[side]['framework'], global_choosed[side]['type'],
            global_choosed[side]['hw']);
        //myMemory.interval[side] = result.infer_time;
        //myMemory.cpu[side] = result.cpu_rate;
    }
    else {
		myMemory.interval[side] = myMemory.logInterval[side][imageIdx];
	};


};


function predictImage(node_name, model, dataset, img_name, side, maxLength, dataset,
            isOnline,imageIdx, bt, framework, model_type, hw) {

	var response = null;
    var xhr = new XMLHttpRequest();
    var thisURL = "predict?node_name="+node_name+"&dataset=" + dataset
        +"&img_name=" + img_name+"&model="+model+"&framework="+framework+"&model_type="+model_type
        +"&hw="+hw;
    console.info(thisURL);

    $.get( thisURL, function( data ) {
        console.info(data);
        update_infer(data, side, maxLength, dataset,
            isOnline,imageIdx, bt);
    });
};

function predictImage0(node_name, dataset, img_name) {

	var response = null;
    var xhr = new XMLHttpRequest();
    var thisURL = "predict?node_name="+node_name+"&dataset=" + dataset
        +"&img_name=" + img_name;
    //console.info(thisURL);

    xhr.open("GET", thisURL, false);
	xhr.onload = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			response = JSON.parse(xhr.responseText);
		};
	};
	xhr.send();

    console.info(response);

	return response;
};

function predictBatchImage(imgName, baseURL, framework, model, dataset, device, version, node) {

    var response = null;
    var xhr = new XMLHttpRequest();
    var thisURL = baseURL + "?framework=" + framework + "&model=" + model + "&dataset=" + dataset + "&device=" + device + "&version=" + version + "&node=" + node + "&imgName=" + imgName;
    xhr.open("GET", thisURL, true);
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            response = JSON.parse(xhr.responseText);
        };
    };
    xhr.send();
    return response;
};

function draw_rect(bigImage, rect, side){
    //console.log("draw_rect");
    //console.log(bigImage.id);
    var img = $("#"+bigImage.id);
    //console.log($("#"+bigImage.id).width());
    //console.log(img.height());
    var y1=rect[0];
    var x1=rect[1];
    var y2=rect[2];
    var x2=rect[3];

    var w = (x2 - x1)*img.width();
    var h = (y2 - y1)*img.height();
    var top = y1*img.height()+img.position().top;
    var left = x1*img.width()+img.position().left;
    //console.log(w);
    //console.log(h);
    //console.log(top);
    //console.log(left);
    var span_id = "#span_rect_"+side
    $(span_id).width(w).height(h);
    $(span_id).css({'top':top+"px",'left':left+"px",
            "border-color": "red",
            "border-width":"2px",
            "border-style":"solid"});
}

function changePic(side, dataset, imageIdx) {
    var imgName = imglist[side][imageIdx];
    var imageSource = "dataset/" + dataset+ "/" + imgName;
    var bigImageSource = "dataset/" + dataset+ "/" + imgName;


	myMemory.imageArray[side][imageIdx].src = imageSource;
	myMemory.bigImage[side].src = bigImageSource;
    myMemory.imageArray[side][imageIdx].style.boxShadow = "0 0 0 " + THUMBBORDER + "px rgb(119,136,153)";
	myMemory.bigImage[side].style.boxShadow = "0 0 0 " + BIGIMGBORDER + "px rgb(0,0,0)";

    var rect = global_rec[side][imgName];
    //rect = [0.1, 0.1, 0.3, 0.3];
    if(rect != undefined){
        draw_rect(myMemory.bigImage[side], rect, side);
    }
};

function getSelectValues() {
    return document.getElementById("lselector1").value;
}

var min_refresh_time = 0.01;

function get_delay_pic_time(side){
  if(side==RIGHT){
    var right = myMemory.http_time[RIGHT];
    if(right<min_refresh_time) return min_refresh_time - right;
    return 0;
  }
  //left
  var left = myMemory.http_time[LEFT];
  var right = myMemory.http_time[RIGHT];
  if(right<min_refresh_time) right = min_refresh_time;

  var delay_left =  myMemory.interval[LEFT]/ myMemory.interval[RIGHT]*right - left;
  if(delay_left<0) delay_left = 0;

  return delay_left;
}

function leftUpdater(isOnline) {
        //console.log("leftUpdater");
        var bt = ( new Date()).valueOf();
        update(LEFT, LNUMIMAGES, ldataset, isOnline, bt);

}

function rightUpdater(isOnline) {
        //console.log("rightUpdater");
        var bt = ( new Date()).valueOf();
        update(RIGHT, LNUMIMAGES, ldataset, isOnline, bt);
}


function demoMain(isOnline) {
    running_flag = true;
    if(global_choosed.length==0){
        alert("Pleae Choose Nodes!");
        return false;
    }

	pageCleanup();


    // Setting correct server addresses based on the parameters selected.
    if (isOnline == false) {
        readLog(LEFT, "./assets/static-logs/skylake_fp32_resnet-50.log");
        readLog(RIGHT, "./assets/static-logs/cascadelake_int8_resnet-50.log");
    }

    var midUpdater = function() {

	var leftLatencyAvg = (myMemory.totalElapsed[LEFT] / myMemory.imageCounter[LEFT]);
	var rightLatencyAvg = (myMemory.totalElapsed[RIGHT] / myMemory.imageCounter[RIGHT]);
	var ratio_str = (leftLatencyAvg / rightLatencyAvg).toFixed(2);
    var ratio =  parseFloat(ratio_str);

    //var cpu_str = (myMemory.cpu[RIGHT] / myMemory.cpu[LEFT]).toFixed(2);
    //var cpu =  parseFloat(cpu_str);

    if(!isNaN(ratio))  myChart.data.datasets[0].data=[1, ratio];
    //myChart.data.datasets[1].data=[1, cpu];
    myChart.update();
    //console.info([1,ratio]);
    };

    makeplot();

    console.info("Begin left timer "+myMemory.interval[LEFT] * myMemory.scaleFactor);
    myMemory.innerTimer[LEFT] = setTimeout(function(){leftUpdater(isOnline)}, 1000);
    myMemory.innerTimer[RIGHT] = setTimeout(function(){rightUpdater(isOnline)}, 1000);
    myMemory.plotTimer = setInterval(midUpdater, 1000);
    console.info("demoMain() done");
    return true;
};




function choose(){
    var response = null;
    var xhr = new XMLHttpRequest();
    var thisURL = BASE_URL + "/config";
    xhr.open("GET", thisURL, false);
	xhr.onload = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			response = JSON.parse(xhr.responseText);
            console.log(response);

		};
	};
	xhr.send();

	return response;
}


init();



