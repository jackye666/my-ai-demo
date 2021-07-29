// Hardcode number of files. This script doesn't "ls" over 
// img files available. "NUMIMGFILES" sets max number of imgfiles
// to file in the folder and to loop over

// DNNL
//TOP_HEADER = "DNNL SYCL CPU backend vs. DNNL SYCL GPU backend"
//LEFT_HEADER = "SYCL CPU backend"
//RIGHT_HEADER = "SYCL GPU backend"
//LOGO_FILE= "oneAPI.PNG"

// BigDL
/*
TOP_HEADER = "SkyLake FP32 vs. CascadeLake Int8"
LEFT_HEADER = "SkyLake FP32"
RIGHT_HEADER = "CascadeLake Int8 with VNNI"
LOGO_FILE= "bigdl.jpeg"
*/
TOP_HEADER = "Target A vs. Target B"
LEFT_HEADER = "Target A"
RIGHT_HEADER = "Target B"

TOP_HEADER_1 = "SkyLake vs. CascadeLake & Intel DL Boost"
LEFT_HEADER_1 = "SkyLake & FP32"
RIGHT_HEADER_1 = "CascadeLake & INT8"

TOP_HEADER_2 = "Target A vs. Target B"
LEFT_HEADER_2 = "Target A"
RIGHT_HEADER_2 = "Target B"

LOGO_FILE = "bigdl.jpeg"

IMG_PATH_0 = "./1000";
IMG_PATH_1 = "./decathlon_imgs";
NAME_PATH_0 = "./img_name_lists/imgnet_list.txt";
NAME_PATH_1 = "./img_name_lists/deca_list.txt";


// Size of small images
THUMBSIZE = 50;
THUMBBORDER = 2;
THUMIMGSIZE = THUMBSIZE+THUMBBORDER;
// Size of big image
BIGIMGSIZE = 350;
BIGIMGBORDER = 5;

CLXTHRUPUT = 1219;
SW2THRUPUT = 606;
SW1THRUPUT = 100;
BASETHRUPUT = 2.34;
SCALEFACTOR = 5000;  // Scaling latency (reducing throughput) by scale factor for better viewing
// BATCHSIZE = 128;	// images
CLXLATENCY = 1/CLXTHRUPUT; // per image latency in sec
SW2LATENCY = 1/SW2THRUPUT;
SW1LATENCY = 1/SW1THRUPUT;
BASELATENCY = 1/BASETHRUPUT;

LEFTCOLPCT = 40;
MIDCOLPCT = 20;
RIGHTCOLPCT = 40;

STEPONEDONE = false;
STEPTWODONE = false;
STEPTHREEDONE = false;

STEP1RATIO = "46.5";
STEP2RATIO = "5.1";
STEP3RATIO = "2.01";


ONLINE = false;
LEFT = 0;
RIGHT = 1;

BASE_URL="http://clx02.sh.intel.com:8000";

//original
/* SERVERS = {
	SKYLAKE: "http://tce-wolfpass-u16.sc.intel.com:58080/predict",
	CASCADELAKE: "http://mlt-clx198.sh.intel.com:58080/predict"
}*/



SERVERS_BACKUP = {
    TARGET_A: "http://tce-wolfpass-u16.sc.intel.com:8080/predict",
    TARGET_A1: "http://tce-wolfpass-u16.sc.intel.com:8081/predict",
    TARGET_A_BATCH: "http://tce-wolfpass-u16.sc.intel.com:8080/predict_batch",
    TARGET_A_BATCH1: "http://tce-wolfpass-u16.sc.intel.com:8081/predict_batch",

    TARGET_B: "http://tce-kbl-i7.sc.intel.com:8080/predict",
    TARGET_B1: "http://tce-kbl-i7.sc.intel.com:8081/predict",
    TARGET_B_BATCH: "http://tce-kbl-i7.sc.intel.com:8080/predict_batch",
    TARGET_B_BATCH1: "http://tce-kbl-i7.sc.intel.com:8081/predict_batch"
}

SERVERS = {
    TARGET_A: "http://clx02.sh.intel.com:8001/predict",
    TARGET_A1: "http://clx02.sh.intel.com:8001/predict",
    TARGET_A_BATCH: "http://clx02.sh.intel.com:8001/predict_batch",
    TARGET_A_BATCH1: "http://clx02.sh.intel.com:8001/predict_batch",

    TARGET_B: "http://clx02.sh.intel.com:8001/predict",
    TARGET_B1: "http://clx02.sh.intel.com:8001/predict",
    TARGET_B_BATCH: "http://clx02.sh.intel.com:8001/predict_batch",
    TARGET_B_BATCH1: "http://clx02.sh.intel.com:8001/predict_batch",

    TARGET_C: "http://tce-wolfpass-u16.sc.intel.com:8080/predict",
    TARGET_C1: "http://tce-wolfpass-u16.sc.intel.com:8081/predict",
    TARGET_C_BATCH: "http://tce-wolfpass-u16.sc.intel.com:8080/predict_batch",
    TARGET_C_BATCH1: "http://tce-wolfpass-u16.sc.intel.com:8081/predict_batch",
}