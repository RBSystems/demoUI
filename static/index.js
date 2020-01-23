$(document).ready(function(){
    //Make the call to find out what is in the room and add however many inputs there are.
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "localhost:8000/buildings/DEMO/rooms/123/configuration",
        "method": "GET",
    }
      
    $.ajax(settings).done(function (response) {
        let inputNumber = 1;
        for (let i=0; i < response.devices.length; i++) {
            for (let j=0; j < response.devices[i].roles.length; j++) {
                if (response.devices[i].roles[j].description === "VideoIn") {
                    let html = `<div id="input`+ inputNumber+`" class="card rounded" style="width: 10rem;">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Ic_settings_input_hdmi_48px.svg/1024px-Ic_settings_input_hdmi_48px.svg.png" class="card-img-top" style="height: 8rem; width: 8rem;margin: auto; alt="...">
                                    <div class="card-body">
                                        <button class="btn btn-block btn-secondary inputButton" name="`+ inputNumber+`" value="`+ response.devices[i].name+`">Select `+ response.devices[i].name +`</button>
                                    </div>
                                </div>`
                    $(".card-deck").append(html)
                    inputNumber += 1;
                }

            }

        }
        
    });
    
    $(document).on("click",".inputButton", function(input){
        console.log("input " + input.target.name + " Selected");
        let selectedInput = input.target.value;
        //All of this stuff is just one method of highlighting the buttons when they are selected
        //Using something like React of Angular with state management would make it easier
        let inputArray = $(".card-deck > div")
        for (let i=1; i <= inputArray.length; i++) {
            if (Number(input.target.name) === i) {
                inputArray.eq(i-1).addClass("border").addClass("border-primary");
            } else {
                inputArray.eq(i-1).removeClass("border").removeClass("border-primary");
            }

        }

        let buttonArray = $(".inputButton")
        for (i=1; i<= buttonArray.length; i++) {            
            if (buttonArray[i-1].name === input.target.name) {
                buttonArray.eq(i-1).addClass("btn-primary").removeClass("btn-secondary");
                buttonArray.eq(i-1).addClass("border").addClass("border-primary");
            } else {
                buttonArray.eq(i-1).removeClass("border").removeClass("border-primary");
                buttonArray.eq(i-1).removeClass("btn-primary").addClass("btn-secondary");
            }

        }

        //Create the room struct that needs to be sent to the AV-API
        let roomState = {
            displays: [
                {
                    name: "D1"
                }
            ]
        }
        roomState.displays[0].input = selectedInput
        updateRoom(roomState);

    }); 

    $("#volumeSlider").change(function(){
        volumeLevel = $("#volumeSlider").val();
        console.log("Volume level: " + $("#volumeSlider").val());
        let roomState = {
            audioDevices: [
                {
                    name: "D1",
                }
            ]
        }
        roomState.audioDevices[0].volume = Number(volumeLevel)
        updateRoom(roomState);

    })

    $(".changeDisplayButton").click(function(event){
        
        //Highlight the selected button for the display power status
        let buttonArray = $(".changeDisplayButton")
        for (i=1; i<= buttonArray.length; i++) {            
            if (buttonArray[i-1].name === event.target.name) {
                buttonArray.eq(i-1).addClass("btn-primary").removeClass("btn-secondary");
                buttonArray.eq(i-1).addClass("border").addClass("border-primary");
            } else {
                buttonArray.eq(i-1).removeClass("border").removeClass("border-primary");
                buttonArray.eq(i-1).removeClass("btn-primary").addClass("btn-secondary");
            }

        }

        //Create the room struct that needs to be sent to the AV-API depending on the button pressed
        let roomState = {
            displays: [
                {
                    name: "D1"
                }
            ]
        }
        switch(event.target.name) {
            case "on":
                roomState.displays[0].power="on";
                break;
            case "off":
                roomState.displays[0].power="off";               
                break;
            case "blank":
                roomState.displays[0].blanked=true
                break;
            case "unblank":
                roomState.displays[0].blanked=false
                break;
            default:     
        }
        updateRoom(roomState);
    }); 

    function updateRoom(roomState){
        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "http://ITB-1106B-CP1.byu.edu:8000/buildings/ITB/rooms/1106B",
            "method": "PUT",
            "headers": {
              "Content-Type": "application/json",
            },
            "processData": false,
            "data": JSON.stringify(roomState)
          }
          
          $.ajax(settings).done(function (response) {
            console.log(response);
          });
    }
});
