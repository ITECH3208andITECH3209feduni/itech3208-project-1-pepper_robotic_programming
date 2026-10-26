var cameraSession = null;

var videoDevice = null;
var cameraMemory = null;

var cameraSubscriber = null;

var cameraRunning = false;


/* ========================================
   Page loaded
   ======================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("camera.js loaded.");

        if (typeof QiSession === "undefined") {

            console.log(
                "ERROR: qimessaging.js was not loaded."
            );

            updateFaceStatus(
                "Unable to connect to Pepper."
            );

            return;
        }


        connectCamera();

    }
);


/* ========================================
   Connect to Pepper
   ======================================== */

function connectCamera() {

    console.log("Connecting camera QiSession...");


    new QiSession(

        function (session) {

            cameraSession = session;

            console.log(
                "Camera QiSession connected."
            );


            /* --------------------------------
               Load ALMemory
               Used for faceStatus
               -------------------------------- */

            session.service(
                "ALMemory"
            ).then(

                function (memory) {

                    cameraMemory = memory;

                    console.log(
                        "Camera script connected to ALMemory."
                    );

                    subscribeFaceStatus();

                },

                function (error) {

                    console.log(
                        "ERROR loading ALMemory: "
                        + error
                    );

                }

            );


            /* --------------------------------
               Load ALVideoDevice
               -------------------------------- */

            session.service(
                "ALVideoDevice"
            ).then(

                function (video) {

                    videoDevice = video;

                    console.log(
                        "Connected to ALVideoDevice."
                    );

                    startPepperCamera();

                },

                function (error) {

                    console.log(
                        "ERROR loading ALVideoDevice: "
                        + error
                    );

                    updateFaceStatus(
                        "Unable to access Pepper camera."
                    );

                }

            );

        },


        function (error) {

            console.log(
                "ERROR connecting QiSession: "
                + error
            );

            updateFaceStatus(
                "Unable to connect to Pepper."
            );

        }

    );

}


/* ========================================
   Subscribe to Function Box faceStatus
   ======================================== */

function subscribeFaceStatus() {

    if (cameraMemory === null) {

        return;

    }


    cameraMemory.subscriber(
        "faceStatus"
    ).then(

        function (subscriber) {

            subscriber.signal.connect(

                function (value) {

                    console.log(
                        "faceStatus received: "
                        + value
                    );

                    handleFaceStatus(
                        String(value)
                    );

                }

            );

        },

        function (error) {

            console.log(
                "ERROR subscribing faceStatus: "
                + error
            );

        }

    );

}


/* ========================================
   Handle messages from Function Box
   ======================================== */

function handleFaceStatus(value) {

    /* --------------------------------
       Waiting for face
       -------------------------------- */

    if (value === "looking") {

        updateFaceStatus(
            "Looking for your face..."
        );

        return;
    }


    /* --------------------------------
       Face found
       -------------------------------- */

    if (value === "face_detected") {

        updateFaceStatus(
            "Face detected. Please hold still."
        );

        return;
    }


    /* --------------------------------
       Existing user recognized
       -------------------------------- */

    if (
        value.indexOf("recognized|") === 0
    ) {

        var name =
            value.substring(
                "recognized|".length
            );


        updateFaceStatus(
            "Welcome, "
            + name
            + "!"
        );

        return;
    }


    /* --------------------------------
       Existing user unknown
       -------------------------------- */

    if (value === "unknown") {

        updateFaceStatus(
            "Sorry, I could not recognize you."
        );

        return;
    }


    /* --------------------------------
       Registration started
       -------------------------------- */

    if (value === "enter_name") {

        updateFaceStatus(
            "Registration started. Please enter your name."
        );

        return;
    }


    /* --------------------------------
       Registration face ready
       -------------------------------- */

    if (
        value.indexOf("face_ready|") === 0
    ) {

        var name =
            value.substring(
                "face_ready|".length
            );


        updateFaceStatus(
            "Face captured for "
            + name
            + ". Save this result?"
        );


        var saveArea =
            document.getElementById(
                "saveArea"
            );


        if (saveArea) {

            saveArea.style.display =
                "flex";

        }


        return;
    }


    /* --------------------------------
       Registration success
       -------------------------------- */

    if (
        value.indexOf(
            "registration_success|"
        ) === 0
    ) {

        var name =
            value.substring(
                "registration_success|".length
            );


        updateFaceStatus(
            "Registration successful. Welcome, "
            + name
            + "!"
        );


        var saveArea =
            document.getElementById(
                "saveArea"
            );


        if (saveArea) {

            saveArea.style.display =
                "none";

        }


        return;
    }


    /* --------------------------------
       Registration failed
       -------------------------------- */

    if (
        value === "registration_failed"
    ) {

        updateFaceStatus(
            "Registration failed. Please try again."
        );


        var saveArea =
            document.getElementById(
                "saveArea"
            );


        if (saveArea) {

            saveArea.style.display =
                "flex";

        }


        return;
    }


    /* --------------------------------
       Invalid name
       -------------------------------- */

    if (
        value === "name_error"
    ) {

        updateFaceStatus(
            "Please enter a valid name."
        );

        return;
    }


    /* --------------------------------
       General error
       -------------------------------- */

    if (value === "error") {

        updateFaceStatus(
            "An error occurred during face processing."
        );

        return;
    }


    /* --------------------------------
       Other status
       -------------------------------- */

    updateFaceStatus(
        value
    );

}


/* ========================================
   Start Pepper top camera
   ======================================== */

function startPepperCamera() {

    if (videoDevice === null) {

        console.log(
            "ALVideoDevice is not ready."
        );

        return;
    }


    updateFaceStatus(
        "Starting Pepper camera..."
    );


    /*
        subscribeCamera(

            subscriber name,

            0 = Pepper top camera,

            1 = QVGA 320 x 240,

            11 = RGB,

            5 = 5 FPS
        )
    */

    videoDevice.subscribeCamera(

        "TabletCamera_"
        + new Date().getTime(),

        0,
        1,
        11,
        5

    ).then(

        function (subscriberName) {

            cameraSubscriber =
                subscriberName;

            cameraRunning =
                true;


            console.log(
                "Camera subscribed: "
                + subscriberName
            );


            updateFaceStatus(
                "Camera ready."
            );


            requestCameraFrame();

        },


        function (error) {

            console.log(
                "ERROR subscribing camera: "
                + error
            );


            updateFaceStatus(
                "Unable to start Pepper camera."
            );

        }

    );

}


/* ========================================
   Get frames continuously
   ======================================== */

function requestCameraFrame() {

    if (!cameraRunning) {

        return;
    }


    if (
        videoDevice === null ||
        cameraSubscriber === null
    ) {

        return;
    }


    videoDevice.getImageRemote(
        cameraSubscriber
    ).then(

        function (image) {

            if (image) {

                drawCameraFrame(
                    image
                );

            }


            /*
                Around 5 FPS
            */

            setTimeout(
                requestCameraFrame,
                200
            );

        },


        function (error) {

            console.log(
                "ERROR getImageRemote: "
                + error
            );


            setTimeout(
                requestCameraFrame,
                500
            );

        }

    );

}


/* ========================================
   Draw camera image
   ======================================== */

function drawCameraFrame(image) {

    if (!image) {

        return;
    }


    /*
        ALVideoDevice result:

        image[0] = width
        image[1] = height
        image[2] = layers
        image[3] = color space
        image[4] = timestamp seconds
        image[5] = timestamp microseconds
        image[6] = pixel data
    */

    var width =
        image[0];

    var height =
        image[1];

    var data =
        image[6];


    if (!data) {

        console.log(
            "Camera frame has no pixel data."
        );

        return;
    }


    var canvas =
        document.getElementById(
            "cameraFeed"
        );


    if (!canvas) {

        return;
    }


    canvas.width =
        width;

    canvas.height =
        height;


    var context =
        canvas.getContext(
            "2d"
        );


    var imageData =
        context.createImageData(
            width,
            height
        );


    var output =
        imageData.data;


    var pixelCount =
        width * height;


    var sourceIndex = 0;

    var outputIndex = 0;


    /*
        ALVideoDevice:
        RGB RGB RGB

        HTML canvas:
        RGBA RGBA RGBA
    */

    for (
        var i = 0;
        i < pixelCount;
        i++
    ) {

        output[outputIndex] =
            getCameraByte(
                data,
                sourceIndex
            );


        output[outputIndex + 1] =
            getCameraByte(
                data,
                sourceIndex + 1
            );


        output[outputIndex + 2] =
            getCameraByte(
                data,
                sourceIndex + 2
            );


        output[outputIndex + 3] =
            255;


        sourceIndex += 3;

        outputIndex += 4;

    }


    context.putImageData(
        imageData,
        0,
        0
    );

}


/* ========================================
   Read camera binary data safely
   ======================================== */

function getCameraByte(
    data,
    index
) {

    /*
        Some Pepper / NAOqi versions
        return binary data as a String.
    */

    if (
        typeof data === "string"
    ) {

        return data.charCodeAt(
            index
        ) & 255;

    }


    /*
        Normal array / typed array
    */

    if (
        data[index] !== undefined
    ) {

        return data[index];

    }


    return 0;

}


/* ========================================
   Update text over camera
   ======================================== */

function updateFaceStatus(message) {

    var status =
        document.getElementById(
            "faceStatus"
        );


    if (status) {

        status.innerHTML =
            message;

    }


    console.log(
        "Face status: "
        + message
    );

}


/* ========================================
   Stop camera before leaving page
   ======================================== */

window.addEventListener(

    "beforeunload",

    function () {

        stopPepperCamera();

    }

);


/* ========================================
   Stop Pepper camera
   ======================================== */

function stopPepperCamera() {

    cameraRunning =
        false;


    if (
        videoDevice !== null &&
        cameraSubscriber !== null
    ) {

        try {

            videoDevice.unsubscribe(
                cameraSubscriber
            );


            console.log(
                "Camera unsubscribed."
            );

        }

        catch (error) {

            console.log(
                "ERROR unsubscribing camera: "
                + error
            );

        }

    }


    cameraSubscriber =
        null;

}