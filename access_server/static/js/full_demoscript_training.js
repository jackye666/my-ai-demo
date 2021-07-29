var start, end;

var global_config={};
var global_choosed=[];
var global_rec=[{}, {}];

var myChart = null;

var AccuracyChart = null;
var LossChart = null;
var EpochTimeChart = null;

var ldataset = null;
var rdataset = null;

var running_flag = true;

var left_time = 0, right_time = 0;

var checkbox_status = {};

var data = {};

var case_num = 0;

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
function init(){
    document.getElementById("log_output").innerText = " ";
}
function run(){
    var XHR = new XMLHttpRequest();
    var thisURL = '/training'
    XHR.open('GET', thisURL, true);
    XHR.setRequestHeader('content-type', 'application/x-www-form-urlencoded');//可以在send里面传入params对象
    XHR.onload = function(){
        if(XHR.readyState === 4 && XHR.status === 200){
	       // res = XHR.responseText;
            //case_num = JSON.parse(res).case_num; 			
            //alert("begin training");
            document.getElementById("log_output").innerText = "Training in the process: " + case_num +  " cases";
            for(var i = 1; i <= case_num; i++){
                data["case" + i] = {};
                data["case" + i]["accuracy"] = 0;   
                data["case" + i]["epoch"] = 0;
                data["case" + i]["epoch_time"] = 0;
                data["case" + i]["loss"] = 0;
            }
            console.log(data);
            make_accuracy_plot(data);
            make_loss_plot(data);
            make_epoch_time_plot(data);
	    }
	    	
    }
    XHR.send();
}
function stop(){
    var XHR = new XMLHttpRequest();
    var thisURL = '/stop_training'
    XHR.open('GET', thisURL, true);
    XHR.setRequestHeader('content-type', 'application/x-www-form-urlencoded');//可以在send里面传入params对象
    XHR.onload = function(){
        if(XHR.readyState === 4 && XHR.status === 200){
            //alert("stop training")
            document.getElementById("log_output").innerText = "Stop training!";
        }
    }
    XHR.send();
}


var check = function(){
    var XHR = new XMLHttpRequest();
    var thisURL = '/checking'
    XHR.open('GET', thisURL, true);
    XHR.setRequestHeader('content-type', 'application/x-www-form-urlencoded');//可以在send里面传入params对象
    XHR.onload = function(){
        if(XHR.readyState === 4 && XHR.status === 200){
            res = XHR.responseText;
            res_json = JSON.parse(res);
            console.log(res_json);
	    case_num = res_json.case_num;	
            log = res_json.log;
            if(res_json.info == "logs info changed"){
                //console.log(data[res_json.case_id]);
                data[res_json.case_id] = {};
                data[res_json.case_id] = log;
                //console.log(data[res_json.case_id]);
                var txt = "";
                for(i = 1; i <= case_num; i++){
                    //console.log(data["case"+i+1])
                    txt += "case_id: " + i +"\nepoch: "+data["case"+i].epoch+"\naccuracy: "+data["case"+i].accuracy+
                    "\nepoch_time: "+data["case"+i].epoch_time+"\nloss: "+data["case"+i].loss + "\n" ;
                }
                //document.getElementById("log_output").innerText = txt;
                console.log(res_json.log);
		update_ac = new Array([case_num]);
		update_loss = new Array([case_num]);
		update_ep_t = new Array([case_num]);
		for(i = 0; i < case_num; i++){
		   case_id = "case" + (i + 1);
		   update_ac[i] = data[case_id]["accuracy"].toFixed(4);
		   update_loss[i] = data[case_id]["loss"].toFixed(4);
		   update_ep_t[i] = data[case_id]["epoch_time"].toFixed(4);

		}
                AccuracyChart.data.datasets[0].data = update_ac;
                LossChart.data.datasets[0].data = update_loss;
                EpochTimeChart.data.datasets[0].data = update_ep_t;               
                AccuracyChart.update();
                LossChart.update();
                EpochTimeChart.update();
    
            }
               
        }
    }
    XHR.send();

}
setInterval(check,500);
$("#btnAct").click(function(){
    var t = $("#btnAct").text();
    //console.info(t);
  
    if(t=='Run'){
        /***************************told backend to begin training************************************/
        if(global_choosed.length != 1){
	    alert("Please choose enough nodes first!");
        }
	else{
	    run();
	    $("#btnAct").text("Stop");
	}
    } else {
        /***************************told backend to stop training************************************/    
        stop();
        $("#btnAct").text("Run");
    }
});

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
        }
    }
    if(cnt!=1){
       alert("Please Choose 1 Node!");
       return;
    }
    global_choosed = choosed;
    //console.info(global_choosed);
    var xhr = new XMLHttpRequest();
    var thisURL = "get_node_name?model_name="+choosed[0]["name"];
    xhr.open("GET", thisURL, false);
    xhr.onload = function() {
	if (xhr.readyState == 4 && xhr.status == 200) {
	};
    };
    xhr.send();
  
    $('#configModal').modal('hide');
  });

  var text = "graph LR;\nA[\"Chrome\"]--HTTP-->B[\"Web Server\"];\nB--HTTP-->C[\"AI Node A\"];";
  function show_flowchart(){
      var inputs = $('#node_list').find("input");
      var i = 0;            
      text = "graph LR;\nA[\"Chrome\"]--HTTP-->B[\"Web Server\"];\nB--HTTP-->C[\"AI Node A\"];";
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
      if(choosed_num > 1){
          alert("Please only choose 1 node!")
          for(i = 0; i < inputs.length; i++){
              if(checkbox_status["checkbox"+i] != inputs[i].checked){
                  document.getElementById("checkbox"+i).checked = false;
                  inputs[i].checked = false;
                  break;
              }
          }
          choosed_num = 1;
      }
      var cnt = 0
      for(i=0;i<inputs.length;i++){
          checkbox_status["checkbox"+i] = inputs[i].checked
          if(inputs[i].checked){
              str[i] =  str[i] + svrs[i]['hw'] + "<br/>";
              str[i] =  str[i] + svrs[i]['framework'] + " ";
              str[i] =  str[i] + svrs[i]['model'] + " ";
              str[i] =  str[i] + svrs[i]['type'] + " ";
              str[i] =  str[i] + svrs[i]['dataset'] + "\n";
              //text = text + alphabet[i] + "-->" + alphabet[i+2] + "[\"" + str[i] + "\"];\n";
              branch[cnt] = "B--HTTP-->" + alphabet[cnt+2] + "[\"AI Node " + alphabet[cnt] + " <br/>"+str[i]+"\"];\n";   
              cnt++;
          }
      }
  
      text = head;
      for(j = 0; j < 1 ; j++){
          text += branch[j];
      }
  
      output = document.getElementById("flow_chart");
      if (output.firstChild !== null) {
          output.innerHTML = "";
      }
      let insert = function (text) {
          output.innerHTML = text;
      };
      mermaid.render("preparedScheme", text, insert);
  };

$("#btnChoose").click(function(){

    var res = null;
    var xhr = new XMLHttpRequest();
    var thisURL = "training_config";
    xhr.open("GET", thisURL, false);
	xhr.onload = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			res = JSON.parse(xhr.responseText);
            //alert(res['mod_servers'][0]['dataset']);
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

    $('#configModal').modal('show');

    output = document.getElementById("flow_chart");
    if(output.firstChild != null){
        output.innerHTML="";
    }
    var txt = "graph LR;\nA[\"Chrome\"]--HTTP-->B[\"Web Server\"];\nB--HTTP-->C[\"AI Node A\"];";
    if(txt != text){
        txt = text;
    }
    let insert = function (txt) {
        output.innerHTML = txt;
    };
    mermaid.render("preparedScheme", txt, insert);
});

function make_accuracy_plot(data){
    var ctx = document.getElementById('accuracy_chart');
    Chart.defaults.global.defaultFontFamily = 'Intel Clear Pro';
    Chart.defaults.global.defaultFontColor = 'rgba(0,96,210, 1.0)';
    Chart.defaults.global.defaultFontSize = 20;
    //Chart.defaults.global.legend.display = false;
    l = new Array([case_num]);
    initial_data = new Array([case_num]);	
    for(i=1;i<=case_num;i++){
	l[i-1]="No."+i;
	initial_data[i-1]=0
    }
    AccuracyChart = new Chart(ctx, {        type: 'bar',
        data: {
            labels: l,
            datasets: [
		    {
			data: initial_data,
			label: "Accuracy - higher is better",

			backgroundColor: 'rgba(54, 162, 235, 0.8)',

			borderColor: 'rgba(54, 162, 235, 1)',

			borderWidth: 0.2
		    }
        	 ]
        },
        options: {
            title: {
                display: false,
                text: 'Accuracy plot'
            },
            
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        steps : 0.05,
                        stepValue : 0.05,
                        max : 1.2,
                        min: 0,
                        beginAtZero: true
                    },
                    scaleLabel:{
                        display:true,
                        labelString:'Accuracy'
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

function make_epoch_time_plot(data){
    var ctx = document.getElementById('epoch_time_chart');
    Chart.defaults.global.defaultFontFamily = 'Intel Clear Pro';
    Chart.defaults.global.defaultFontColor = 'rgba(0,96,210, 1.0)';
    Chart.defaults.global.defaultFontSize = 20;
    //Chart.defaults.global.legend.display = false;
    l = new Array([case_num]);
    initial_data = new Array([case_num]);
    for(i=1;i<=case_num;i++){
	l[i-1]="No."+i;
	initial_data[i-1]=0
    }
    EpochTimeChart = new Chart(ctx, {        type: 'bar',
        data: {
            labels: l,
            datasets: [
		    {
			data: initial_data,
			label: "seconds per epoch - lower is better",

			backgroundColor: 'rgba(54, 162, 235, 0.8)',

			borderColor: 'rgba(54, 162, 235, 1)',

			borderWidth: 0.2
		    }
        	 ]
        },
        options: {
            title: {
                display: false,
                text: 'Epoch time plot'
            },
            
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        steps : 0.5,
                        stepValue : 0.5,
                        max : 10,
                        min: 0,
                        //beginAtZero: true
                    },
                    scaleLabel:{
                        display:true,
                        labelString:'seconds'
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

function make_loss_plot(data){
    var ctx = document.getElementById('loss_chart');
    Chart.defaults.global.defaultFontFamily = 'Intel Clear Pro';
    Chart.defaults.global.defaultFontColor = 'rgba(0,96,210, 1.0)';
    Chart.defaults.global.defaultFontSize = 20;
    //Chart.defaults.global.legend.display = false;
    l = new Array([case_num]);
    initial_data = new Array([case_num]);
    for(i=1;i<=case_num;i++){
	    l[i-1]="No."+i;
	    initial_data[i-1]=0
    }
    LossChart = new Chart(ctx, {        type: 'bar',
        data: {
            labels: l,
            datasets: [
		    {
			data: initial_data,
			label: "Loss - lower is better",

			backgroundColor: 'rgba(54, 162, 235, 0.8)',

			borderColor: 'rgba(54, 162, 235, 1)',

			borderWidth: 0.2
		    }
        	 ]
        },
        options: {
            title: {
                display: false,
                text: 'Loss plot'
            },
            
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    display: true,
                    ticks: {
                        steps : 0.05,
                        stepValue : 0.05,
                        max : 1.5,
                        min: 0,
                        //beginAtZero: true
                    },
                    scaleLabel:{
                        display:true,
                        labelString:'Loss'
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

init();
