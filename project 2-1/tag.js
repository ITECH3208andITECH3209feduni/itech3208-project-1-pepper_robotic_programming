var memoryService = null;

document.addEventListener("DOMContentLoaded", function () {
    setStatus("HTML loaded. Connecting to Pepper...");

    if (typeof QiSession === "undefined") {
        setStatus("ERROR: qimessaging.js was not loaded.");
        return;
    }

    new QiSession(
        function (session) {
            setStatus("QiSession connected. Loading ALMemory...");

            session.service("ALMemory").then(
                function (memory) {
                    memoryService = memory;
                    setStatus("Connected to ALMemory.");
                },
                function (error) {
                    setStatus("ERROR loading ALMemory: " + error);
                }
            );
        },

        function (error) {
            setStatus("ERROR connecting QiSession: " + error);
        }
    );
});

function goToDialogTag(tagName) {
    setStatus("Button clicked. Target: " + tagName);

    if (memoryService === null) {
        setStatus("ERROR: ALMemory is not connected.");
        return;
    }

    try {
        memoryService.raiseEvent(
            "buttonback",
            tagName
        );

        setStatus("Event sent: buttonback = " + tagName);
    } catch (error) {
        setStatus("ERROR sending event: " + error);
    }
}

function setStatus(message) {
    console.log(message);
	
    var status = document.getElementById("status");

    if (status) {
        status.innerHTML = message;
    }
}